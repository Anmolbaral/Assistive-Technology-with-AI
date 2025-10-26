"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, GripVertical } from "lucide-react";
import { announce } from "@/lib/a11y";

export interface DragDropItem {
  id: string;
  text: string;
  correct: "Safe" | "Unsafe";
}

export interface DragDropProps {
  items: DragDropItem[];
  onComplete?: (passed: boolean) => void;
}

interface Column {
  id: "Safe" | "Unsafe";
  title: string;
  items: DragDropItem[];
}

function SortableItem({ item, isCorrect }: { item: DragDropItem; isCorrect?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-md border bg-card ${
        isCorrect !== undefined
          ? isCorrect
            ? "border-success bg-success/10"
            : "border-destructive bg-destructive/10"
          : "border-border hover:bg-accent"
      } cursor-move`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="flex-1 text-sm">{item.text}</span>
      {isCorrect !== undefined && (
        isCorrect ? (
          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        )
      )}
    </div>
  );
}

export function DragDrop({ items, onComplete }: DragDropProps) {
  const [columns, setColumns] = useState<Column[]>([
    { id: "Safe", title: "✅ Safe to Query", items: [] },
    { id: "Unsafe", title: "🚫 Unsafe (Contains PII)", items: [] },
  ]);
  const [unassigned, setUnassigned] = useState<DragDropItem[]>(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = findItem(active.id as string);
    if (!activeItem) return;

    const overColumnId = over.id as "Safe" | "Unsafe" | "unassigned";

    // Move item to the appropriate column
    moveItem(activeItem, overColumnId);
    announce(
      `Moved "${activeItem.text}" to ${overColumnId === "unassigned" ? "unassigned items" : overColumnId}`,
      'polite'
    );
  };

  const findItem = (id: string): DragDropItem | undefined => {
    return (
      unassigned.find((item) => item.id === id) ||
      columns[0].items.find((item) => item.id === id) ||
      columns[1].items.find((item) => item.id === id)
    );
  };

  const moveItem = (item: DragDropItem, targetColumn: "Safe" | "Unsafe" | "unassigned") => {
    // Remove from current location
    setUnassigned((prev) => prev.filter((i) => i.id !== item.id));
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        items: col.items.filter((i) => i.id !== item.id),
      }))
    );

    // Add to target
    if (targetColumn === "unassigned") {
      setUnassigned((prev) => [...prev, item]);
    } else {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === targetColumn
            ? { ...col, items: [...col.items, item] }
            : col
        )
      );
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    
    const allCorrect = items.every((item) => {
      const column = columns.find((col) =>
        col.items.some((i) => i.id === item.id)
      );
      return column?.id === item.correct;
    });

    announce(
      allCorrect
        ? "All items sorted correctly! Great job!"
        : "Some items are incorrectly sorted. Review the feedback.",
      'assertive'
    );

    if (onComplete) {
      onComplete(allCorrect);
    }
  };

  const handleRetry = () => {
    setUnassigned(items);
    setColumns([
      { id: "Safe", title: "✅ Safe to Query", items: [] },
      { id: "Unsafe", title: "🚫 Unsafe (Contains PII)", items: [] },
    ]);
    setSubmitted(false);
    announce("Reset drag and drop exercise. Starting over.", 'polite');
  };

  const isCorrectlyPlaced = (item: DragDropItem): boolean | undefined => {
    if (!submitted) return undefined;
    const column = columns.find((col) =>
      col.items.some((i) => i.id === item.id)
    );
    return column?.id === item.correct;
  };

  const allAssigned = unassigned.length === 0;
  const activeItem = activeId ? findItem(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Sort Safe vs. Unsafe Queries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Drag each query into the correct category (or use keyboard: grab with Space/Enter, move with arrows, drop with Space/Enter). 
            Safe queries describe general challenges without identifying students. Unsafe queries contain PII (names, IDs, or identifying details).
          </p>

          {submitted && (
            <Alert variant={allAssigned && columns.every(col => col.items.every(item => col.id === item.correct)) ? "success" : "destructive"}>
              <AlertDescription>
                {allAssigned && columns.every(col => col.items.every(item => col.id === item.correct))
                  ? "Perfect! All queries sorted correctly."
                  : "Review the feedback below. Remember: never include names, IDs, or identifying details."}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="border-2 border-dashed rounded-lg p-4 min-h-[300px]"
                id={column.id}
                role="region"
                aria-label={`${column.title} category`}
              >
                <h3 className="font-semibold mb-3 text-sm">{column.title}</h3>
                <SortableContext
                  items={column.items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {column.items.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        isCorrect={isCorrectlyPlaced(item)}
                      />
                    ))}
                    {column.items.length === 0 && (
                      <div className="text-sm text-muted-foreground italic text-center py-8">
                        Drop items here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          {unassigned.length > 0 && (
            <div className="border rounded-lg p-4" id="unassigned" role="region" aria-label="Items to sort">
              <h3 className="font-semibold mb-3 text-sm">
                Items to Sort ({unassigned.length} remaining)
              </h3>
              <SortableContext
                items={unassigned.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {unassigned.map((item) => (
                    <SortableItem key={item.id} item={item} />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          <div className="flex gap-3">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!allAssigned}
                className="flex-1"
              >
                Check My Answers
              </Button>
            ) : (
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DragOverlay>
        {activeItem ? (
          <div className="p-3 rounded-md border bg-card shadow-lg">
            <span className="text-sm">{activeItem.text}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

