"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Send, Loader2, ExternalLink, Lightbulb } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { announce } from "@/lib/a11y";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { shouldShowFeedback, markFeedbackShown, startEngagementTracking } from "@/lib/feedback";
import { isComplete } from "@/lib/completion";
import { MarkdownText } from "@/components/MarkdownText";
import { useRole } from "@/lib/useRole";

interface ChatResponse {
  answer: string;
  recommendations: Array<{
    level: "Low-Tech" | "Mid-Tech" | "High-Tech";
    items: string[];
  }>;
  tips: string[];
  sources: Array<{
    title: string;
    url: string;
  }>;
  disclaimer: string;
  clarifyingQuestions?: string[];
}

interface PolicyResponse {
  policy: true;
  message: string;
  hint?: string;
}

export function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policyWarning, setPolicyWarning] = useState<PolicyResponse | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [role] = useRole();

  useEffect(() => {
    // Start tracking engagement time
    startEngagementTracking();

    // Check every 30 seconds if we should show feedback
    const interval = setInterval(() => {
      const allComplete = isComplete();
      
      if (shouldShowFeedback(allComplete)) {
        setShowFeedback(true);
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds

    // Listen for prefill query events
    const handlePrefillQuery = (event: CustomEvent) => {
      setQuery(event.detail);
    };

    window.addEventListener('prefillQuery', handlePrefillQuery as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('prefillQuery', handlePrefillQuery as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim().length < 5) {
      setError("Please enter a more detailed question.");
      return;
    }

    setLoading(true);
    setError(null);
    setPolicyWarning(null);
    setResponse(null);

    analytics.assistantQuery(query.length);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      // Check if it's a policy response
      if (data.policy) {
        setPolicyWarning(data);
        analytics.piiBlocked(data.hint);
        announce("Privacy warning: " + data.message, "assertive");
      } else {
        setResponse(data);
        announce("Response received", "polite");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      announce("Error: " + (err instanceof Error ? err.message : "Request failed"), "assertive");
    } finally {
      setLoading(false);
    }
  };


  const handleFeedbackClose = () => {
    setShowFeedback(false);
    markFeedbackShown();
  };

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <Alert variant="warning" className="sticky top-4 z-10 bg-warning/10 border-warning">
        <Shield className="h-4 w-4" />
        <AlertTitle>Privacy-First Reminder</AlertTitle>
        <AlertDescription>
          Never include student names, IDs, photos, or other identifying information.
          Describe challenges, environments, and tasks generally.
        </AlertDescription>
      </Alert>


      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="chat-input" className="sr-only">
            Ask your question
          </label>
          <textarea
            id="chat-input"
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Example: What are low-tech and mid-tech AT tools for a 4th-grade student with dyslexia who needs support with reading fluency in a Chromebook classroom?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Describe the challenge, environment, and task. Don't include student names.
          </p>
        </div>

        <Button type="submit" disabled={loading || query.trim().length < 5} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Ask Assistant
            </>
          )}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PII Warning */}
      {policyWarning && (
        <Alert variant="warning">
          <Shield className="h-4 w-4" />
          <AlertTitle>Privacy Policy</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{policyWarning.message}</p>
            {policyWarning.hint && (
              <p className="text-sm font-semibold">Hint: {policyWarning.hint}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Response */}
      {response && (
        <div className="space-y-6" role="region" aria-label="Assistant response">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3">Answer</h3>
              <div className="text-muted-foreground leading-7 prose prose-sm max-w-none" role="article" aria-live="polite">
                <MarkdownText text={response.answer} />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {response.recommendations && response.recommendations.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Recommendations by Tech Level</h3>
                <div aria-live="polite" aria-atomic="true">
                <div className="space-y-6">
                  {response.recommendations.map((rec, idx) => (
                    <div key={idx}>
                      <Badge variant="outline" className="mb-2">
                        {rec.level}
                      </Badge>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        {rec.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm">
                            <MarkdownText text={item} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Tips */}
          {response.tips.length > 0 && (
            <Card className="bg-success/5 border-success">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-success" />
                  Implementation Tips
                </h3>
                <ul className="space-y-2">
                  {response.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-success font-bold mt-0.5">→</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          {response.sources.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">Sources</h3>
                <div className="space-y-3">
                  {response.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-md hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {source.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {source.url}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert>
            <AlertDescription className="text-sm italic">
              {response.disclaimer}
            </AlertDescription>
          </Alert>

          {/* Clarifying Questions */}
          {response.clarifyingQuestions && response.clarifyingQuestions.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-blue-900">To help you better:</h4>
                </div>
                <ul className="space-y-2">
                  {response.clarifyingQuestions.map((question, idx) => (
                    <li key={idx} className="text-sm text-blue-800">
                      • {question}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Can't Find What You Need */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center">
          <h4 className="font-semibold mb-2">Can't find what you need?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Contact your AT specialist for personalized support.
          </p>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      {showFeedback && (
        <FeedbackDialog
          context="chat"
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
}

