"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Lock, BookOpen, Target } from "lucide-react";
import { lessons } from "@/lib/lessons";
import RolePicker from "@/components/RolePicker";
import RoleSelectionDialog from "@/components/RoleSelectionDialog";
import { useRole } from "@/lib/useRole";

export default function HomePage() {
  const [role, cfg] = useRole();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    console.log("Current role:", role, "Banner:", cfg.banner);
  }, [role, cfg.banner]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Role Selection Dialog */}
      <RoleSelectionDialog />
      
      {/* Role Selector in Header */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold" tabIndex={-1}>
              {mounted ? cfg.banner : "Welcome! Please select your role above."}
            </h1>
          </div>
          <RolePicker />
        </div>
      </section>

      {/* Example Queries */}
      <section aria-label="Try an example" className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Example queries</h2>
        <div className="flex flex-wrap gap-2">
          {cfg.sampleQueries.map((q, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              size="sm" 
              className="text-left h-auto py-2 px-3 cursor-pointer"
              onClick={() => {
                // Copy query to clipboard and navigate to assistant
                navigator.clipboard.writeText(q);
                window.location.href = '/assistant';
              }}
              title="Click to copy and try in assistant"
            >
              {q}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click any query to copy it and try it in the AI assistant
        </p>
      </section>

      {/* Key Resources */}
      <section className="mb-16" aria-label="Key resources">
        <h2 className="text-xl font-semibold mb-2">Resources</h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {cfg.resources.map((r, idx) => (
            <li key={idx} className="border rounded p-3 hover:bg-muted/50 transition-colors">
              <a 
                className="underline hover:text-primary transition-colors" 
                href={r.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {r.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Hero Section */}
      <section className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          AI for Assistive Technology:
          <br />
          <span className="text-primary">Privacy-First Training</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Learn to use AI responsibly and effectively to find assistive technology
          resources for your K-12 students—while protecting their privacy.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="xl" asChild>
            <Link href={`/lessons/${lessons[0].slug}`}>
              <BookOpen className="mr-2 h-5 w-5" />
              Start Training
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/assistant">Try the AI Assistant</Link>
          </Button>
        </div>
      </section>

      {/* Key Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardContent className="pt-6">
            <Lock className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Privacy-First</h3>
            <p className="text-sm text-muted-foreground">
              No student data is collected, stored, or shared. FERPA-compliant and
              built for educators.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">SETT-Based</h3>
            <p className="text-sm text-muted-foreground">
              Learn to structure queries using the proven Student-Environment-Tasks-Tools
              framework.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Clock className="h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">20-25 Minutes</h3>
            <p className="text-sm text-muted-foreground">
              Complete 4 interactive lessons at your own pace. Earn access to the AI
              assistant.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Learning Objectives */}
      <section className="mb-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Understand benefits and risks of AI for AT resource discovery
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Write effective prompts using the SETT Framework
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Protect student privacy and comply with FERPA/COPPA
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Integrate AI into your AT decision-making process
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Lesson List */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Training Modules</h2>
        <div className="space-y-4">
          {lessons.map((lesson, idx) => (
            <Card key={lesson.slug} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Lesson {lesson.order}</Badge>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {lesson.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{lesson.title}</CardTitle>
                  </div>
                  <Button asChild>
                    <Link href={`/lessons/${lesson.slug}`}>
                      {idx === 0 ? "Start Here" : "Continue"}
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <Card className="bg-muted/50">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Complete all 4 lessons to unlock the AI AT Resource Assistant. Each
              lesson includes interactive exercises and knowledge checks.
            </p>
            <Button size="lg" asChild>
              <Link href={`/lessons/${lessons[0].slug}`}>
                Begin Lesson 1
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

