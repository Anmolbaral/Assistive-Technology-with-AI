"use client";

import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { isComplete, getCompletionPercentage } from "@/lib/completion";
import { shouldShowFeedback, markFeedbackShown, startEngagementTracking } from "@/lib/feedback";

export function LessonClient({ slug }: { slug: string }) {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    analytics.lessonStarted(slug);
    
    // Start tracking engagement time
    startEngagementTracking();

    // Check every 5 seconds if we should show feedback
    const interval = setInterval(() => {
      const allComplete = isComplete();
      
      if (shouldShowFeedback(allComplete)) {
        setShowFeedback(true);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slug]);

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    markFeedbackShown();
  };

  return (
    <>
      {showFeedback && (
        <FeedbackDialog
          context="lesson"
          lessonSlug={slug}
          onClose={handleFeedbackClose}
        />
      )}
    </>
  );
}

