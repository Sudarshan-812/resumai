'use client';

import { useState, useTransition } from 'react';
import { generateCareerDoc } from '@/app/actions/ai-features';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner'; // Remove this line if you didn't install sonner

interface JobAssistantProps {
  resumeId: string;
}

export default function JobAssistant({ resumeId }: JobAssistantProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'interview_prep'>('cover_letter');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!jobDescription) return;
    setResult(null); // Clear previous result
    
    startTransition(async () => {
      try {
        const data = await generateCareerDoc(resumeId, jobDescription, activeTab);
        setResult(data);
      } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    // If you installed sonner:
    // toast.success("Copied to clipboard!");
    // If not, just use the icon change:
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-8 border-indigo-100 shadow-md bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          AI Career Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Input Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Paste the Job Description below
          </label>
          <Textarea 
            placeholder="e.g. 'Senior React Developer at Netflix...'"
            className="min-h-[120px] resize-y border-gray-200 focus:border-indigo-500 transition-colors"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Tabs value={activeTab} onValueChange={(v: any) => { setActiveTab(v); setResult(null); }} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="cover_letter">Cover Letter</TabsTrigger>
              <TabsTrigger value="interview_prep">Interview Prep</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isPending || !jobDescription}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Generate {activeTab === 'cover_letter' ? 'Draft' : 'Questions'}
              </>
            )}
          </Button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/30 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Result Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100 bg-indigo-50/50">
              <span className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generated Content
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                onClick={() => {
                    const textToCopy = activeTab === 'cover_letter' 
                        ? result 
                        : result.questions.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
                    copyToClipboard(textToCopy);
                }}
              >
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-5 max-h-[500px] overflow-y-auto">
              {activeTab === 'cover_letter' ? (
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif text-sm">
                  {result}
                </div>
              ) : (
                <div className="space-y-4">
                  {result.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <p className="font-semibold text-indigo-900 mb-2">Q{i+1}: {q.question}</p>
                      <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-indigo-200 pl-3">
                        {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}