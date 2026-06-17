"use client";

import { Info, Pencil, Check, X, Loader2 } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";

import { ActionTooltip } from "@/components/action-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHORTCUTS } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";

interface StoryTitleEditorProps {
  title: string | null;
  onSave: (title: string) => Promise<void>;
  disabled?: boolean;
  saving?: boolean;
}

export interface StoryTitleEditorHandle {
  startEdit: () => void;
}

export const StoryTitleEditor = forwardRef<
  StoryTitleEditorHandle,
  StoryTitleEditorProps
>(function StoryTitleEditor({ title, onSave, disabled, saving: savingExternal }, ref) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title ?? "");
  const [savingLocal, setSavingLocal] = useState(false);
  const saving = savingLocal || !!savingExternal;

  const startEdit = () => {
    if (disabled) return;
    setDraft(title ?? "");
    setEditing(true);
  };

  useImperativeHandle(ref, () => ({ startEdit }), [disabled, title]);

  const cancelEdit = () => {
    setDraft(title ?? "");
    setEditing(false);
  };

  const save = async () => {
    setSavingLocal(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSavingLocal(false);
    }
  };

  return (
    <section
      aria-label="Current story"
      className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Current Story
        </p>
        {!editing && !disabled && (
          <ActionTooltip label="Edit story title" shortcut={SHORTCUTS.editStory}>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              className="h-8 gap-1 text-xs"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </ActionTooltip>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What are we estimating?"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <h1
          className={cn(
            "font-heading text-xl font-bold leading-tight sm:text-2xl",
            !title && "text-muted-foreground",
          )}
        >
          {title || "Add a story title to get started"}
        </h1>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {disabled
          ? "Only the host can edit the story title"
          : "You can edit the story title as host"}
      </p>
    </section>
  );
});
