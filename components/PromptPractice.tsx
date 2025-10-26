"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { announce } from "@/lib/a11y";

export interface PromptScenario {
  title: string;
  student: string;
  environment: string;
  task: string;
  hints?: string[];
}

export interface PromptPracticeProps {
  scenario: PromptScenario;
}

export function PromptPractice({ scenario }: PromptPracticeProps) {
  const [prompt, setPrompt] = useState("");
  const [feedback, setFeedback] = useState<{
    hasStudent: boolean;
    hasEnvironment: boolean;
    hasTask: boolean;
    hasToolLevel: boolean;
  } | null>(null);
  const [showHints, setShowHints] = useState(false);

  const checkPrompt = () => {
    const lower = prompt.toLowerCase();

    const result = {
      hasStudent: 
        lower.includes("student") || 
        lower.includes("grade") ||
        lower.includes("learner") ||
        lower.includes("challenge"),
      hasEnvironment:
        lower.includes("classroom") ||
        lower.includes("chromebook") ||
        lower.includes("environment") ||
        lower.includes("gen ed") ||
        lower.includes("general education") ||
        lower.includes("ipad") ||
        lower.includes("computer"),
      hasTask:
        lower.includes("write") ||
        lower.includes("read") ||
        lower.includes("task") ||
        lower.includes("assignment") ||
        lower.includes("notes") ||
        lower.includes("essay"),
      hasToolLevel:
        lower.includes("low-tech") ||
        lower.includes("mid-tech") ||
        lower.includes("high-tech") ||
        lower.includes("free") ||
        lower.includes("low cost"),
    };

    setFeedback(result);

    const allPresent = Object.values(result).every(Boolean);
    announce(
      allPresent
        ? "Great prompt! It includes all SETT elements."
        : "Your prompt is missing some elements. Review the feedback.",
      'assertive'
    );
  };

  const allCorrect = feedback && Object.values(feedback).every(Boolean);

  return (
    <Card className="my-8 bg-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Practice: {scenario.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 bg-background p-4 rounded-lg border">
          <div>
            <strong className="text-sm font-semibold">Student Need:</strong>
            <p className="text-sm text-muted-foreground mt-1">{scenario.student}</p>
          </div>
          <div>
            <strong className="text-sm font-semibold">Environment:</strong>
            <p className="text-sm text-muted-foreground mt-1">{scenario.environment}</p>
          </div>
          <div>
            <strong className="text-sm font-semibold">Task:</strong>
            <p className="text-sm text-muted-foreground mt-1">{scenario.task}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt-input">
            Write your AI query (use SETT framework):
          </Label>
          <textarea
            id="prompt-input"
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Example: What low-tech AT tools help elementary students with dyslexia decode multisyllabic words during independent reading?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-describedby="prompt-help"
          />
          <p id="prompt-help" className="text-xs text-muted-foreground">
            Include: student need, environment, task, and tool level (low/mid/high-tech)
          </p>
        </div>

        {feedback && (
          <Alert variant={allCorrect ? "success" : "warning"}>
            <AlertTitle>
              {allCorrect ? "Excellent Prompt!" : "Good Start—Let's Refine"}
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  {feedback.hasStudent ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>Student need described</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {feedback.hasEnvironment ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>Environment/context included</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {feedback.hasTask ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>Task/activity specified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {feedback.hasToolLevel ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span>Tool level preference (low/mid/high-tech, free, etc.)</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={checkPrompt}
            disabled={prompt.trim().length < 10}
            className="flex-1"
          >
            Check My Prompt
          </Button>
          {scenario.hints && (
            <Button
              variant="outline"
              onClick={() => setShowHints(!showHints)}
            >
              {showHints ? "Hide" : "Show"} Hints
            </Button>
          )}
        </div>

        {showHints && scenario.hints && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Hints</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                {scenario.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

