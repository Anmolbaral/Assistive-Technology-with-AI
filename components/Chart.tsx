"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  type: "bar" | "pie" | "line";
}

export function Chart({ title, data, type }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === "bar") {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium truncate">
                  {item.label}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative">
                  <div 
                    className="bg-primary h-6 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || undefined
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "pie") {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((item, index) => {
                  const percentage = (item.value / total) * 100;
                  const startAngle = cumulativePercentage * 3.6; // Convert to degrees
                  const endAngle = (cumulativePercentage + percentage) * 3.6;
                  
                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  const pathData = [
                    `M 50 50`,
                    `L ${x1} ${y1}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');

                  cumulativePercentage += percentage;

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
                  />
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium ml-auto">
                    {item.value} ({Math.round((item.value / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "line") {
    const maxY = Math.max(...data.map(d => d.value));
    const minY = Math.min(...data.map(d => d.value));
    const range = maxY - minY || 1;

    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              ))}
              
              {/* Data line */}
              <polyline
                points={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - ((item.value - minY) / range) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((item.value - minY) / range) * 100;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="hsl(var(--primary))"
                  />
                );
              })}
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
              <span>{maxY}</span>
              <span>{Math.round((maxY + minY) / 2)}</span>
              <span>{minY}</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-muted-foreground">
              {data.map((item, index) => (
                <span key={index} className="truncate max-w-16">
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
