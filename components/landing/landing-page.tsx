"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CirclePlus,
  Group,
  Loader2,
  Shield,
  Zap,
  Spade,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStoredParticipant, setStoredParticipant } from "@/lib/participant-storage";
import { createRoom, joinRoom, validateRoomExists } from "@/lib/room-actions";
import { isValidRoomCode, normalizeRoomCode } from "@/lib/room-code";
import { buildRoomPath } from "@/lib/room-url";

const features = [
  { icon: Group, label: "Collaborative", desc: "Estimate as a team" },
  { icon: Zap, label: "Real-time Sync", desc: "Instant vote updates" },
  { icon: Shield, label: "Private Rooms", desc: "Share a room code" },
] as const;

export function LandingPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    setMode("create");
    setShowNamePrompt(true);
    setError(null);
  };

  const handleJoin = async () => {
    const code = normalizeRoomCode(roomCode);
    if (!isValidRoomCode(code)) {
      setError("Enter a valid room code (e.g. thunder-avenger)");
      return;
    }

    const stored = getStoredParticipant(code);
    if (stored) {
      router.push(buildRoomPath(code, stored.participantId));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exists = await validateRoomExists(code);
      if (!exists) {
        setError("Room not valid");
        return;
      }
      setMode("join");
      setShowNamePrompt(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const name = displayName.trim();
    if (!name) {
      setError("Enter your display name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        const { room, participant } = await createRoom(name);
        setStoredParticipant({
          participantId: participant.id,
          roomCode: room.code,
          displayName: name,
        });
        router.push(buildRoomPath(room.code, participant.id));
      } else if (mode === "join") {
        const code = normalizeRoomCode(roomCode);
        const { room, participant } = await joinRoom(code, name);
        setStoredParticipant({
          participantId: participant.id,
          roomCode: room.code,
          displayName: name,
        });
        router.push(buildRoomPath(room.code, participant.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen">
      <div className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <header className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-8">
          <div className="flex items-center gap-2">
            <Spade className="h-6 w-6 text-primary" aria-hidden />
            <span className="font-heading text-lg font-bold">Sprint Poker</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4 sm:max-w-xl sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="shrink-0 pt-4 text-center sm:pt-6"
          >
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sprint Poker
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Estimate stories together.
            </p>
          </motion.div>

          <div className="pb-20 pt-8 sm:pb-28 sm:pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card className="border-white/10 bg-card/90 shadow-lg backdrop-blur-sm dark:border-white/10">
              <div className="min-h-[24rem]">
                <AnimatePresence mode="wait" initial={false}>
                  {!showNamePrompt ? (
                    <motion.div
                      key="start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CardHeader className="pb-4">
                        <Button
                          size="lg"
                          className="w-full gap-2 text-base"
                          onClick={handleCreate}
                        >
                          <CirclePlus className="h-5 w-5" />
                          Create Room
                        </Button>

                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                              or
                            </span>
                          </div>
                        </div>

                        <CardDescription className="text-left text-sm">
                          Room code
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Input
                          placeholder="e.g. SPARK"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                          aria-label="Room code"
                          className="text-center font-mono tracking-wide"
                        />
                        <Button
                          variant="secondary"
                          className="w-full gap-2"
                          onClick={() => void handleJoin()}
                          disabled={!roomCode.trim() || loading}
                        >
                          {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Join Room
                        </Button>
                      </CardContent>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-left text-lg">
                          {mode === "create" ? "Create a room" : "Join a room"}
                        </CardTitle>
                        <CardDescription className="text-left">
                          {mode === "create"
                            ? "Choose a display name for this session"
                            : "Enter your name to join the room"}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {mode === "join" && (
                          <Input
                            value={normalizeRoomCode(roomCode)}
                            disabled
                            className="text-center font-mono tracking-widest"
                          />
                        )}
                        <Input
                          placeholder="Your display name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && void submit()}
                          autoFocus
                          aria-label="Display name"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowNamePrompt(false);
                              setMode(null);
                              setError(null);
                            }}
                            disabled={loading}
                          >
                            Back
                          </Button>
                          <Button
                            className="flex-1 gap-2"
                            onClick={() => void submit()}
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {mode === "create" ? "Create" : "Join"}
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <CardContent className="space-y-2 pt-0">
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                    {error === "Room not valid" && !showNamePrompt && (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleCreate}
                      >
                        <CirclePlus className="h-4 w-4" />
                        Create a Room
                      </Button>
                    )}
                  </CardContent>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex flex-col items-center rounded-xl border border-border/60 bg-surface/60 p-4 text-center backdrop-blur-sm"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </motion.li>
            ))}
          </motion.ul>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
