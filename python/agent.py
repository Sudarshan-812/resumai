import json
import logging
import os
from dotenv import find_dotenv, load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    RoomInputOptions,
    WorkerOptions,
    cli,
)
from livekit.plugins import deepgram, groq, silero

load_dotenv(find_dotenv())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resumai-voice-worker")


class InterviewAgent(Agent):
    """Stateless interviewer persona — instructions are baked in at construction."""

    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)

    async def on_enter(self) -> None:
        await self.session.say(
            "Hello! I have your resume and the target job description right in front of me. "
            "Let's kick off this interview. Could you start by walking me through your most relevant recent project?",
            allow_interruptions=True,
        )


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    logger.info("Participant joined: %s", participant.identity)

    # 1. Safely extract and parse the injected token metadata.
    #    Keys must match the JSON shape written by /api/interview/get-token:
    #      { "userId": str, "resumeText": str, "jobDescription": str }
    candidate_resume = "No resume provided."
    target_jd = "No job description provided."

    try:
        if participant.metadata:
            meta = json.loads(participant.metadata)
            candidate_resume = meta.get("resumeText", candidate_resume)
            target_jd = meta.get("jobDescription", target_jd)
            logger.info("Successfully loaded Resume and JD context from WebRTC handshake.")
    except Exception as e:
        logger.error("Failed to parse participant metadata: %s", e)

    # 2. Construct the deterministic mock interviewer persona
    system_instruction = (
        "You are an expert, elite hiring manager conducting a fast-paced 5-minute mock interview. "
        "Keep your spoken responses brief, conversational, and direct. Do not use markdown, bolding, or lists. "
        "Ask highly specific, challenging technical and behavioral questions based strictly on the candidate's claims below.\n\n"
        f"--- CANDIDATE RESUME ---\n{candidate_resume}\n\n"
        f"--- TARGET JOB DESCRIPTION ---\n{target_jd}\n"
    )

    # 3. Initialize the ultra-low latency Groq + Deepgram pipeline
    session = AgentSession(
        vad=silero.VAD.load(activation_threshold=0.35, min_silence_duration=0.4),
        stt=deepgram.STT(),
        llm=groq.LLM(
            model="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY"),
        ),
        tts=deepgram.TTS(model="aura-2-orpheus-en"),
    )

    await session.start(
        room=ctx.room,
        agent=InterviewAgent(instructions=system_instruction),
        room_input_options=RoomInputOptions(),
    )
    logger.info("Voice Assistant pipeline active. Routing inference via Groq Llama 3.3.")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
