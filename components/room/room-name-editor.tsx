"use client";

import { Check, Pencil, X, Loader2 } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { ActionTooltip } from "@/components/action-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SHORTCUTS } from "@/lib/keyboard-shortcuts";

interface RoomNameEditorProps {
  room: { name?: string | null };
  onSave: (name: string) => Promise<void>;
  disabled?: boolean;
  saving?: boolean;
}

export interface RoomNameEditorHandle {
  startEdit: () => void;
}

export const RoomNameEditor = forwardRef<
  RoomNameEditorHandle,
  RoomNameEditorProps
>(function RoomNameEditor({ room, onSave, disabled, saving: savingExternal }, ref) {
  const [editing, setEditing] = useState(false);
  const customName = room.name?.trim() ?? "";
  const [draft, setDraft] = useState(customName);
  const [savingLocal, setSavingLocal] = useState(false);
  const saving = savingLocal || !!savingExternal;

  useEffect(() => {
    if (!editing) setDraft(customName);
  }, [customName, editing]);

  const startEdit = () => {
    if (disabled) return;
    setDraft(customName);
    setEditing(true);
  };

  useImperativeHandle(ref, () => ({ startEdit }), [disabled, customName]);

  const cancelEdit = () => {
    setDraft(customName);
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

  if (editing) {
    return (
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Session label (optional)"
          autoFocus
          maxLength={60}
          className="sm:max-w-xs"
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
    );
  }

  if (disabled) return null;

  return (
    <ActionTooltip label="Add session label" shortcut={SHORTCUTS.editRoomName}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={startEdit}
        aria-label="Add session label"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </ActionTooltip>
  );
});
