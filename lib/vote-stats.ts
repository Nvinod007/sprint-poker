import type { Vote, VoteValue } from "@/lib/types";

export interface VoteDistribution {
  value: VoteValue;
  count: number;
}

export function parseNumericVote(value: VoteValue): number | null {
  switch (value) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "5":
      return 5;
    case "8":
      return 8;
    case "13":
      return 13;
    case "21":
      return 21;
    case "?":
    case "☕":
      return null;
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

function voteSortOrder(value: VoteValue): number {
  switch (value) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "5":
      return 4;
    case "8":
      return 5;
    case "13":
      return 6;
    case "21":
      return 7;
    case "?":
      return 8;
    case "☕":
      return 9;
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

export function aggregateVotes(votes: Vote[]): VoteDistribution[] {
  const counts = new Map<VoteValue, number>();

  for (const vote of votes) {
    counts.set(vote.value, (counts.get(vote.value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => voteSortOrder(a.value) - voteSortOrder(b.value));
}

export function computeAverage(votes: Vote[]): number | null {
  const numerics = votes
    .map((v) => parseNumericVote(v.value))
    .filter((n): n is number => n !== null);

  if (numerics.length === 0) return null;

  const sum = numerics.reduce((acc, n) => acc + n, 0);
  return sum / numerics.length;
}

export function hasNumericConsensus(votes: Vote[]): boolean {
  if (votes.length === 0) return false;

  const numerics = votes.map((v) => parseNumericVote(v.value));

  if (numerics.some((n) => n === null)) return false;

  const unique = new Set(numerics);
  return unique.size === 1;
}

export function formatAverage(average: number): string {
  const rounded = Math.round(average * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
