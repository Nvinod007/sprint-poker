import type { Metadata } from "next";
import { Suspense } from "react";

import { JoinRoomForm } from "@/components/join/join-room-form";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: JoinPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Join Room ${code.toUpperCase()}`,
    description: `Join Sprint Poker room ${code.toUpperCase()} and estimate stories with your team.`,
    robots: { index: false, follow: false },
  };
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;

  return (
    <Suspense>
      <JoinRoomForm code={code} />
    </Suspense>
  );
}
