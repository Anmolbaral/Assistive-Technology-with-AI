"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About TechBridge Learning</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Empowering educators with AI-driven assistive technology solutions
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Star className="w-4 h-4 mr-1" />
            Free Platform
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Shield className="w-4 h-4 mr-1" />
            Privacy-First
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Mission Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-7 mb-4">
            TechBridge Learning bridges the gap between assistive technology knowledge and practical classroom implementation. 
            We believe every student deserves access to the tools that help them succeed, and every educator deserves 
            the support to make that happen.
          </p>
          <p className="text-muted-foreground">
            Our platform combines comprehensive AT training with intelligent AI assistance to create a seamless learning 
            experience that transforms how educators discover, understand, and implement assistive technology solutions.
          </p>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Interactive Training Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Responsible AI practices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Effective prompt engineering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Data privacy protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>SETT Framework implementation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI-Powered Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Personalized AT recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Role-based guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Evidence-based solutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Goals */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Our Main Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Empower Educators</h3>
              <p className="text-sm text-muted-foreground">
                Provide teachers, AT specialists, and coaches with the knowledge and tools they need to support every student.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Bridge Knowledge Gaps</h3>
              <p className="text-sm text-muted-foreground">
                Connect research-based AT practices with real-world classroom implementation through accessible training.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Protect Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Ensure student data privacy while providing powerful AI assistance that never requires personal information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How AI Assistant Helps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            How Our AI Assistant Helps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Personalized Recommendations
              </h3>
              <p className="text-muted-foreground">
                Our AI analyzes your specific needs and provides tailored assistive technology recommendations, 
                from low-tech solutions to advanced software tools.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Role-Based Guidance
              </h3>
              <p className="text-muted-foreground">
                Whether you're a teacher, AT specialist, or instructional coach, our assistant adapts its responses 
                to match your role and expertise level.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Evidence-Based Solutions
              </h3>
              <p className="text-muted-foreground">
                Every recommendation is backed by research and includes citations to trusted sources, ensuring 
                you have access to proven, effective solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Instant Support
              </h3>
              <p className="text-muted-foreground">
                Get immediate answers to your AT questions, from simple tool suggestions to complex implementation 
                strategies, available 24/7.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-semibold">Free Access</h3>
              <p className="text-sm text-muted-foreground">No cost, no subscriptions - just valuable AT knowledge</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-semibold">Privacy-First Design</h3>
              <p className="text-sm text-muted-foreground">Never requires student names or personal information</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-semibold">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground">Hands-on exercises and quizzes to reinforce learning</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-semibold">Comprehensive Resources</h3>
              <p className="text-sm text-muted-foreground">Access to curated AT tools and implementation guides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="text-center">
        <CardContent className="pt-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join educators who are transforming their classrooms with assistive technology knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                Start Training
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/assistant">
                Try AI Assistant
                <Brain className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
