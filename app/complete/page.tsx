"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Sparkles } from "lucide-react";
import { isComplete, markComplete, getCompletionPercentage } from "@/lib/completion";
import { analytics } from "@/lib/analytics";

export default function CompletePage() {
  const router = useRouter();
  const percentage = getCompletionPercentage();
  const allComplete = percentage === 100;

  useEffect(() => {
    if (allComplete && !isComplete()) {
      markComplete();
      analytics.trainingComplete();
    }
  }, [allComplete]);

  if (!allComplete) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="pt-12 pb-12">
            <h1 className="text-3xl font-bold mb-4">Almost There!</h1>
            <p className="text-muted-foreground mb-6">
              You've completed {percentage}% of the training. Finish all lessons to unlock the AI assistant.
            </p>
            <Button size="lg" onClick={() => router.push("/")}>
              Continue Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        {/* Badge/Award */}
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-success/10 mb-6">
          <Award className="w-16 h-16 text-success" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          You've completed the AI & AT Training
        </p>

        <Badge variant="success" className="text-base px-4 py-2">
          <CheckCircle className="mr-2 h-4 w-4" />
          Certified: Privacy-First AI for AT Resources
        </Badge>
      </div>

      {/* Summary */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">What You Learned</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">Responsible AI Use</strong>
                <span className="text-sm text-muted-foreground">
                  Benefits, risks, and TechBridge Learning's privacy-first approach
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">Prompt Engineering</strong>
                <span className="text-sm text-muted-foreground">
                  Writing effective queries using the SETT Framework
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">Student Privacy Protection</strong>
                <span className="text-sm text-muted-foreground">
                  FERPA/COPPA compliance and PII detection
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">SETT + AI Integration</strong>
                <span className="text-sm text-muted-foreground">
                  End-to-end AT decision-making with AI support
                </span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="pt-8 pb-8 text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            AI AT Resource Assistant Unlocked!
          </h2>
          <p className="text-muted-foreground mb-6">
            You now have access to the privacy-first AI assistant. Start finding
            evidence-based AT resources for your students.
          </p>
          <Button size="lg" onClick={() => router.push("/assistant")}>
            Try the AI Assistant
          </Button>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Recommended Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Test the AI assistant with a real classroom scenario</li>
            <li>Share this training with colleagues in your building or district</li>
            <li>Bookmark the assistant for quick access during planning time</li>
            <li>
              Contact your AT specialist for personalized support
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <Button onClick={() => router.push("/assistant")} size="lg">
          Open AI Assistant
        </Button>
        <Button variant="outline" onClick={() => router.push("/")} size="lg">
          Review Lessons
        </Button>
      </div>
    </div>
  );
}

