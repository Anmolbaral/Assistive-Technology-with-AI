"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import { announce } from "@/lib/a11y";

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  feedback?: string;
}

export interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (passed: boolean, score: number) => void;
  passingScore?: number;
}

export function Quiz({ questions, onComplete, passingScore = 80 }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const totalQuestions = questions.length;
  const question = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedAnswer;
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        announce(`Question ${currentQuestion + 2} of ${totalQuestions}`, 'polite');
      } else {
        // Submit quiz
        const correct = newAnswers.filter(
          (ans, idx) => ans === questions[idx].answerIndex
        ).length;
        const score = Math.round((correct / totalQuestions) * 100);
        setSubmitted(true);
        
        const passed = score >= passingScore;
        announce(
          `Quiz complete. You scored ${score}%. ${passed ? 'You passed!' : 'Please try again.'}`,
          'assertive'
        );
        
        if (onComplete) {
          onComplete(passed, score);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      announce(`Question ${currentQuestion} of ${totalQuestions}`, 'polite');
    }
  };

  const handleRetry = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setSubmitted(false);
    setSelectedAnswer(null);
    announce('Quiz reset. Starting over.', 'polite');
  };

  if (submitted) {
    const correct = answers.filter(
      (ans, idx) => ans === questions[idx].answerIndex
    ).length;
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= passingScore;

    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-success" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant={passed ? "success" : "destructive"}>
            <AlertDescription>
              <div className="text-lg font-semibold mb-2">
                Score: {score}% ({correct}/{totalQuestions} correct)
              </div>
              {passed ? (
                <p>Congratulations! You passed the quiz.</p>
              ) : (
                <p>
                  You need {passingScore}% to pass. Review the lesson and try
                  again.
                </p>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Review Your Answers
            </h4>
            {questions.map((q, qIdx) => {
              const userAnswer = answers[qIdx];
              const isCorrect = userAnswer === q.answerIndex;

              return (
                <div
                  key={qIdx}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{q.prompt}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: {q.options[userAnswer ?? 0]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-success mt-1">
                          Correct answer: {q.options[q.answerIndex]}
                        </p>
                      )}
                      {q.feedback && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          {q.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!passed && (
            <Button onClick={handleRetry} className="w-full">
              Retry Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>
          Knowledge Check
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={(currentQuestion + 1) / totalQuestions * 100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{question.prompt}</h3>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(val) => handleAnswerSelect(parseInt(val))}
          >
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleAnswerSelect(idx)}
                >
                  <RadioGroupItem
                    value={idx.toString()}
                    id={`q${currentQuestion}-option${idx}`}
                  />
                  <Label
                    htmlFor={`q${currentQuestion}-option${idx}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="flex-1"
          >
            {currentQuestion === totalQuestions - 1 ? "Submit Quiz" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

