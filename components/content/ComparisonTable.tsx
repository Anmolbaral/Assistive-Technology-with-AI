"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { getIcon } from "@/lib/icons";

interface ComparisonRow {
  risk: string;
  approach: string;
}

interface ComparisonTableProps {
  title?: string;
  rows: ComparisonRow[];
  leftHeader?: string;
  rightHeader?: string;
  variant?: "risk" | "comparison";
}

export function ComparisonTable({
  title,
  rows,
  leftHeader = "Risk",
  rightHeader = "Our Approach",
  variant = "risk",
}: ComparisonTableProps) {
  return (
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left p-4 bg-muted/50 font-semibold">
                {variant === "risk" ? (
                  <span className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    {leftHeader}
                  </span>
                ) : (
                  leftHeader
                )}
              </th>
              <th className="text-left p-4 bg-muted/50 font-semibold">
                {variant === "risk" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    {rightHeader}
                  </span>
                ) : (
                  rightHeader
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-muted/30 transition-colors"
              >
                <td className="p-4 align-top">
                  <div className="flex items-start gap-2">
                    {variant === "risk" && (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-1" />
                    )}
                    <span className="text-sm">{row.risk}</span>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="flex items-start gap-2">
                    {variant === "risk" && (
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-1" />
                    )}
                    <span className="text-sm">{row.approach}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface FeatureGridProps {
  features: Array<{
    iconKey: string;
    title: string;
    description: string;
  }>;
  columns?: number;
}

export function FeatureGrid({ features, columns = 2 }: FeatureGridProps) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 my-6`}>
      {features.map((feature, idx) => {
        const Icon = getIcon(feature.iconKey);
        return (
        <Card key={idx} className="border-2 hover:border-primary transition-colors">
          <CardContent className="pt-6">
            {Icon && (
              <div className="mb-3">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            )}
            <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}

interface ProcessStepsProps {
  steps: Array<{
    number: number;
    title: string;
    description: string;
    badge?: string;
  }>;
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="relative my-8">
      {/* Vertical line connector */}
      <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-primary/30 hidden md:block" />
      
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-4">
            {/* Step number circle */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl z-10">
              {step.number}
            </div>
            
            {/* Step content */}
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.badge && (
                    <Badge variant="outline" className="flex-shrink-0">
                      {step.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProsConsCardProps {
  bad: {
    title: string;
    example: string;
    reason: string;
  };
  good: {
    title: string;
    example: string;
    reason: string;
  };
}

export function ProsConsCard({ bad, good }: ProsConsCardProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      {/* Bad Example */}
      <Card className="border-2 border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-6 w-6 text-destructive" />
            <h4 className="font-semibold text-lg">{bad.title}</h4>
          </div>
          <div className="bg-background p-3 rounded-md mb-3 font-mono text-sm">
            {bad.example}
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Why it fails:</strong> {bad.reason}
          </p>
        </CardContent>
      </Card>

      {/* Good Example */}
      <Card className="border-2 border-success/50 bg-success/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-6 w-6 text-success" />
            <h4 className="font-semibold text-lg">{good.title}</h4>
          </div>
          <div className="bg-background p-3 rounded-md mb-3 font-mono text-sm">
            {good.example}
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Why it works:</strong> {good.reason}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

