"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Download, Trash2 } from "lucide-react";

interface FeedbackEntry {
  context: "lesson" | "chat";
  lessonSlug?: string;
  helpful: boolean;
  comments: string;
  timestamp: string;
}

export default function FeedbackDataPage() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("feedback-data");
    if (data) {
      setFeedback(JSON.parse(data));
    }
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(feedback, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to delete all feedback data?")) {
      localStorage.removeItem("feedback-data");
      setFeedback([]);
    }
  };

  const stats = {
    total: feedback.length,
    helpful: feedback.filter((f) => f.helpful).length,
    notHelpful: feedback.filter((f) => f.helpful === false).length,
    withComments: feedback.filter((f) => f.comments.trim().length > 0).length,
    lessonFeedback: feedback.filter((f) => f.context === "lesson").length,
    chatFeedback: feedback.filter((f) => f.context === "chat").length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Feedback Data</h1>
        <p className="text-muted-foreground">
          View and export user feedback from lessons and AI assistant
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">{stats.helpful}</div>
            <p className="text-sm text-muted-foreground">Helpful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">{stats.notHelpful}</div>
            <p className="text-sm text-muted-foreground">Not Helpful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{stats.withComments}</div>
            <p className="text-sm text-muted-foreground">With Comments</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <Button onClick={handleExport} disabled={feedback.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </Button>
        <Button
          variant="destructive"
          onClick={handleClear}
          disabled={feedback.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All Data
        </Button>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground">No feedback collected yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Feedback will appear here as users complete lessons and use the assistant.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedback
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={entry.context === "lesson" ? "default" : "secondary"}>
                          {entry.context === "lesson" ? "Lesson" : "Chat"}
                        </Badge>
                        {entry.lessonSlug && (
                          <Badge variant="outline">{entry.lessonSlug}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-normal text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </CardTitle>
                    </div>
                    <div>
                      {entry.helpful ? (
                        <div className="flex items-center gap-2 text-success">
                          <ThumbsUp className="h-5 w-5" />
                          <span className="font-semibold">Helpful</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-warning">
                          <ThumbsDown className="h-5 w-5" />
                          <span className="font-semibold">Not Helpful</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {entry.comments && (
                  <CardContent>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm font-semibold mb-1">Comments:</p>
                      <p className="text-sm text-muted-foreground italic">
                        "{entry.comments}"
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

