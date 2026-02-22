import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { getIcon } from "@/lib/icons";

export interface InfoCardProps {
  title: string;
  icon?: LucideIcon | string;
  iconKey?: string;
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}

export function InfoCard({
  title,
  icon: iconProp,
  iconKey,
  children,
  variant = "default",
}: InfoCardProps) {
  const Icon =
    typeof iconProp === "function"
      ? iconProp
      : iconKey
        ? getIcon(iconKey.toLowerCase())
        : typeof iconProp === "string"
          ? getIcon(iconProp.toLowerCase())
          : undefined;
  const variantStyles = {
    default: "border-border",
    success: "border-success bg-success/5",
    warning: "border-warning bg-warning/5",
    info: "border-primary bg-primary/5",
  };

  return (
    <Card className={`my-6 ${variantStyles[variant]}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        {children}
      </CardContent>
    </Card>
  );
}

