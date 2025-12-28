"use client";

import type { FC, JSX } from "react";
import { useState, useTransition, useCallback } from "react";
import { generateCareerDoc } from "@/app/actions/ai-features";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Briefcase,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type AssistantMode = "cover_letter" | "interview_prep";

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface InterviewPrepResult {
  questions: InterviewQuestion[];
}

type AssistantResult = string | InterviewPrepResult;

interface JobAssistantProps {
  resumeId: string;
}

const JobAssistant: FC<JobAssistantProps> = ({
  resumeId,
}): JSX.Element => {
  // Job description pasted by the user
  const [jobDescription, setJobDescription] = useState<string>("");

  // React 18 transition for non-blocking async UI updates
  const [isPending, startTransition] = useTransition();

  // Result returned from the AI (string or structured object)
  const [result, setResult] = useState<AssistantResult | null>(null);

  // Current assistant mode (tab)
  const [activeTab, setActiveTab] =
    useState<AssistantMode>("cover_letter");

  // UI state for copy-to-clipboard feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Trigger AI generation based on active tab
  const handleGenerate = useCallback((): void => {
    if (!jobDescription.trim()) return;

    // Clear previous result when generating again
    setResult(null);

    startTransition(async () => {
      try {
        const data = await generateCareerDoc(
          resumeId,
          jobDescription,
          activeTab
        );

        setResult(data as AssistantResult);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, [resumeId, jobDescription, activeTab]);

  // Copies generated content to clipboard with UI feedback
  const copyToClipboard = useCallback((text: string): void => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");

    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Card className="mt-8 border-indigo-100 bg-white shadow-md">
      <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50 to-white">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          AI Career Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Job description input */}
        <div className="space-y-3">
          <label
            htmlFor="job-description"
            className="text-sm font-medium text-gray-700"
          >
            Paste the Job Description below
          </label>

          <Textarea
            id="job-description"
            placeholder="e.g. Senior React Developer at Netflix..."
            className="min-h-[120px] resize-y border-gray-200 transition-colors focus:border-indigo-500"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Mode selection + generate action */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Tabs
            value={activeTab}
            onValueChange={(value: string) => {
              setActiveTab(value as AssistantMode);
              setResult(null);
            }}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="cover_letter">
                Cover Letter
              </TabsTrigger>
              <TabsTrigger value="interview_prep">
                Interview Prep
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={isPending || !jobDescription.trim()}
            className="w-full bg-indigo-600 shadow-sm transition-all hover:bg-indigo-700 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Thinking...
              </>
            ) : (
              <>
                <Briefcase
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                />
                Generate{" "}
                {activeTab === "cover_letter"
                  ? "Draft"
                  : "Questions"}
              </>
            )}
          </Button>
        </div>

        {/* AI generated result */}
        {result && (
          <div className="mt-6 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Result header */}
            <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/50 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generated Content
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900"
                onClick={() => {
                  const textToCopy =
                    activeTab === "cover_letter"
                      ? (result as string)
                      : (result as InterviewPrepResult).questions
                          .map(
                            (q) =>
                              `Q: ${q.question}\nA: ${q.answer}`
                          )
                          .join("\n\n");

                  copyToClipboard(textToCopy);
                }}
              >
                {copied ? (
                  <Check
                    className="mr-1 h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy
                    className="mr-1 h-4 w-4"
                    aria-hidden="true"
                  />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* Result body */}
            <div className="max-h-[500px] overflow-y-auto p-5">
              {activeTab === "cover_letter" ? (
                <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-700">
                  {result as string}
                </div>
              ) : (
                <div className="space-y-4">
                  {(result as InterviewPrepResult).questions.map(
                    (q, index) => (
                      <div
                        key={q.question}
                        className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <p className="mb-2 font-semibold text-indigo-900">
                          Q{index + 1}: {q.question}
                        </p>
                        <p className="border-l-2 border-indigo-200 pl-3 text-sm leading-relaxed text-gray-600">
                          {q.answer}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobAssistant;
