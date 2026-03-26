module.exports=[89577,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(38051)},15688,a=>{"use strict";var b=a.i(89577),c=a.i(32694);let d=new(a.i(40691)).GoogleGenerativeAI(process.env.GEMINI_API_KEY);async function e(a){try{let b=d.getGenerativeModel({model:"gemini-2.0-flash"}),c=await b.generateContent(a);return(await c.response).text()}catch(a){throw console.error("Gemini API Error:",a),Error("Failed to generate content from AI")}}async function f(a,b,d){if(!process.env.GEMINI_API_KEY)throw Error("Server Error: API Key is missing.");let f=await (0,c.createClient)(),{data:{user:g},error:h}=await f.auth.getUser();if(h||!g)throw Error("Unauthorized");let{data:i,error:j}=await f.from("resumes").select("*").eq("id",a).single();if(j||!i)throw Error("Resume not found");let k="";k=i.content?i.content:i.original_analysis?JSON.stringify("string"==typeof i.original_analysis?JSON.parse(i.original_analysis):i.original_analysis):"User resume data.";let l="cover_letter"===d?`You are an expert career coach. Write a professional cover letter for the following Job Description:
"${b}"

Using the candidate's background details here:
${k}

Keep it concise, professional, and highlight matching skills.
Output ONLY the cover letter text.`:`You are an expert technical recruiter. Based on this Job Description:
"${b}"

And this candidate's resume:
${k}

Generate 5 likely interview questions and brief suggested answers.
Return the output in this specific JSON format (do not use markdown code blocks):
{
  "questions": [
    { "question": "...", "answer": "..." }
  ]
}`,m=await e(l);if("interview_prep"===d){let a=m.replace(/```json/g,"").replace(/```/g,"").trim();try{return JSON.parse(a)}catch{throw Error("Failed to parse AI response as JSON.")}}return m}(0,a.i(81934).ensureServerEntryExports)([f]),(0,b.registerServerReference)(f,"70fc7a28770f8d7558244ecec89298213bf3827d08",null),a.s([],86736),a.i(86736),a.s(["70fc7a28770f8d7558244ecec89298213bf3827d08",()=>f],15688)}];

//# sourceMappingURL=OneDrive_Desktop_AI%20RESUME%20PROJ_resumai_399cd177._.js.map