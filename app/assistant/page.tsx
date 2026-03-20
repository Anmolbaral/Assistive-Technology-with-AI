"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Sparkles } from "lucide-react";
import { isComplete, getCompletionPercentage } from "@/lib/completion";
import { Chat } from "@/components/chat/Chat";
import { analytics } from "@/lib/analytics";
import RolePicker from "@/components/roles/RolePicker";
import RoleSelectionDialog from "@/components/roles/RoleSelectionDialog";
import { useRole } from "@/lib/useRole";

export default function AssistantPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [role, cfg] = useRole();

  useEffect(() => {
    const refresh = () => {
      const done = isComplete();
      setComplete(done);
      setPercentage(getCompletionPercentage());
      if (done) analytics.assistantOpened();
    };
    refresh();
    setReady(true);

    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  if (!ready) {
    return null;
  }

  if (!complete) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-12 pb-12 text-center">
            <Lock className="w-16 h-16 text-warning mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Training Required</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Complete all 4 training lessons to unlock the AI AT Resource Assistant.
            </p>

            <Alert variant="warning" className="max-w-md mx-auto mb-8">
              <AlertTitle>Your Progress: {percentage}%</AlertTitle>
              <AlertDescription>
                {percentage === 0
                  ? "Start with Lesson 1 to begin your journey."
                  : `You're ${100 - percentage}% away from unlocking the assistant!`}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button size="lg" onClick={() => router.push("/")}>
                View Training Lessons
              </Button>
              <p className="text-sm text-muted-foreground">
                The training takes approximately 25 minutes to complete.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why Training is Required */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-3">Why is training required?</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Privacy Protection:</strong> Learn to avoid sharing student
                  PII (names, IDs, photos) in your queries
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Effective Prompts:</strong> Understand how to structure
                  questions using the SETT Framework for better recommendations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Responsible Use:</strong> Know when to use AI and when to
                  consult your AT specialist
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>FERPA/COPPA Compliance:</strong> Stay compliant with federal
                  privacy laws
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Role Selection Dialog */}
      <RoleSelectionDialog />
      
      {/* Role Selector */}
      <div className="mb-6">
        <RolePicker />
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Privacy-First AI Assistant</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">
          TechBridge Learning AT Resource Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask questions about assistive technology tools and strategies for your K-12
          students. All recommendations are evidence-based and sourced from trusted
          resources.
        </p>
      </div>

      {/* Role-specific Example Queries */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Try asking:</h2>
        <div className="flex flex-wrap gap-2">
          {cfg.sampleQueries.map((q, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="text-left h-auto py-2 px-3 cursor-pointer"
              onClick={() => {
                // Copy query to clipboard
                navigator.clipboard.writeText(q);
                // Trigger a custom event to prefill the chat input
                window.dispatchEvent(new CustomEvent('prefillQuery', { detail: q }));
              }}
              title="Click to copy and use this query"
            >
              {q}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click any query to copy it to the chat input below
        </p>
      </div>

      {/* Chat Interface */}
      <Chat />
    </div>
  );
}

