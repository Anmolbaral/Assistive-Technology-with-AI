"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Smile, Frown, ThumbsUp, ThumbsDown, X, CheckCircle2 } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface FeedbackDialogProps {
  context: "lesson" | "chat";
  lessonSlug?: string;
  onClose: () => void;
  onSubmit?: (feedback: { helpful: boolean; comments: string }) => void;
}

export function FeedbackDialog({
  context,
  lessonSlug,
  onClose,
  onSubmit,
}: FeedbackDialogProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (helpful === null) {
      return; // Require rating
    }

    const feedbackData = { helpful, comments };

    // Analytics tracking
    if (context === "lesson" && lessonSlug) {
      analytics.lessonFeedback(lessonSlug, helpful);
    } else if (context === "chat") {
      analytics.chatFeedback(helpful);
    }

    // Optional callback
    if (onSubmit) {
      onSubmit(feedbackData);
    }

    // Store in localStorage for potential export
    const existingFeedback = JSON.parse(
      localStorage.getItem("feedback-data") || "[]"
    );
    existingFeedback.push({
      context,
      lessonSlug,
      helpful,
      comments,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("feedback-data", JSON.stringify(existingFeedback));

    setSubmitted(true);

    // Auto-close after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-thank-you"
      >
        <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 id="feedback-thank-you" className="text-2xl font-bold mb-2">
              Thank you!
            </h2>
            <p className="text-muted-foreground">
              Your feedback helps us improve the platform for all educators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle id="feedback-title">Quick Feedback</CardTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close feedback dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question 1: Was this helpful? */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Was this {context === "lesson" ? "lesson" : "answer"} clear and
              helpful?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHelpful(true)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  helpful === true
                    ? "border-success bg-success/10 shadow-sm"
                    : "border-border hover:border-success/50 hover:bg-success/5"
                }`}
                aria-pressed={helpful === true}
                aria-label="Yes, it was helpful"
              >
                <Smile
                  className={`h-12 w-12 ${
                    helpful === true ? "text-success" : "text-muted-foreground"
                  }`}
                />
                <span className="font-semibold text-sm">Yes 👍</span>
              </button>
              <button
                onClick={() => setHelpful(false)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  helpful === false
                    ? "border-warning bg-warning/10 shadow-sm"
                    : "border-border hover:border-warning/50 hover:bg-warning/5"
                }`}
                aria-pressed={helpful === false}
                aria-label="No, it was not helpful"
              >
                <Frown
                  className={`h-12 w-12 ${
                    helpful === false ? "text-warning" : "text-muted-foreground"
                  }`}
                />
                <span className="font-semibold text-sm">No 👎</span>
              </button>
            </div>
          </div>

          {/* Question 2: Comments */}
          <div className="space-y-2">
            <Label htmlFor="feedback-comments" className="text-base font-semibold">
              Anything missing or you'd like to see improved?{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea
              id="feedback-comments"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Your suggestions help us improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              aria-describedby="feedback-help"
            />
            <p id="feedback-help" className="text-xs text-muted-foreground">
              Your feedback is anonymous and helps improve the platform for all
              educators.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={helpful === null}
              className="flex-1"
            >
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

