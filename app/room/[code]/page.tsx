import type { Metadata } from "next";
import { Suspense } from "react";

import { RoomPageClient } from "@/components/room/room-page-client";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: RoomPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Room ${code.toUpperCase()}`,
    description: `Sprint Poker room ${code.toUpperCase()} — vote and reveal story points in real time.`,
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  return (
    <Suspense>
      <RoomPageClient code={code} />
    </Suspense>
  );
}
