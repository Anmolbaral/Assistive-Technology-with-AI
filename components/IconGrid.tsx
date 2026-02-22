"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getIcon } from "@/lib/icons";

interface IconGridItem {
  iconKey: string;
  title: string;
  items: string[];
}

interface IconGridProps {
  items: IconGridItem[];
  variant?: "danger" | "success";
}

export function IconGrid({ items, variant = "success" }: IconGridProps) {
  const borderColor = variant === "danger" ? "border-destructive/30" : "border-success/30";
  const bgColor = variant === "danger" ? "bg-destructive/5" : "bg-success/5";
  const iconColor = variant === "danger" ? "text-destructive" : "text-success";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {items.map((item, idx) => {
        const Icon = getIcon(item.iconKey);
        return (
        <Card key={idx} className={`border-2 ${borderColor} ${bgColor}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
              <h4 className="font-semibold text-base">{item.title}</h4>
            </div>
            <ul className="space-y-1.5">
              {item.items.map((subItem, subIdx) => (
                <li key={subIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${variant === "danger" ? "bg-destructive" : "bg-success"}`} />
                  {subItem}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}

