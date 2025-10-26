import { CheckCircle } from "lucide-react";

export interface ObjectivesProps {
  items: string[];
}

export function Objectives({ items }: ObjectivesProps) {
  return (
    <div className="my-6 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        Learning Objectives
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

