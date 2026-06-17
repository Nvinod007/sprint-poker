# Realtime sync

Sprint Poker does **not** poll the database. Live updates use **Supabase Realtime** (WebSocket) to listen for Postgres changes, then **refetch** the full room state over REST.

## Summary

| Question | Answer |
|----------|--------|
| Polling (`setInterval`)? | **No** |
| WebSocket push? | **Yes** — `postgres_changes` on `rooms`, `participants`, `votes` |
| Apply event payload directly? | **No** — event triggers `refresh()` → 3 parallel SELECTs |
| Optimistic UI? | **Yes** — local override until mutation + refetch complete |

## End-to-end flow

```mermaid
sequenceDiagram
  participant UI as RoomView / useRoom
  participant REST as Supabase REST
  participant RT as Supabase Realtime
  participant PG as Postgres

  UI->>REST: fetchRoomState (initial load)
  REST->>PG: SELECT rooms, participants, votes
  PG-->>REST: rows
  REST-->>UI: set state, mark synced

  UI->>RT: subscribe channel room:{roomId}

  Note over UI,PG: Another user casts a vote
  UI->>REST: INSERT/UPSERT vote (own actions only)
  REST->>PG: write
  PG-->>RT: replication event
  RT-->>UI: postgres_changes callback
  UI->>REST: refresh() → fetchRoomState
  REST-->>UI: updated state
```

## `useRoom` lifecycle

```mermaid
flowchart TD
  A[roomId set + enabled] --> B[useEffect runs]
  B --> C["refresh() — async fetch"]
  B --> D[Subscribe Realtime channel]
  C --> E{fetch OK?}
  E -->|yes| F[Update room / participants / votes]
  F --> G["syncedRoomId = roomId → loading false"]
  E -->|no| H[Set error, still mark synced]

  D --> I[Any INSERT/UPDATE/DELETE<br/>on rooms, participants, votes]
  I --> C

  J[User action e.g. vote] --> K[Optimistic override in React state]
  K --> L[Write to Supabase]
  L --> C
  L --> I
```

### Loading state (no `setState` in effect)

`loading` is **derived**, not toggled inside the effect:

```
loading = enabled && roomId && syncedRoomId !== roomId
```

When `roomId` changes, `syncedRoomId` still holds the previous room until `refresh()` finishes — so the UI shows loading automatically without calling `setLoading(true)` in the effect (which React 19 lint rules disallow).

### Stale data guard

While `syncedRoomId !== roomId`, the hook returns empty participants/votes and `room: null` so a fast room switch does not flash the previous room's data.

## Realtime subscription (source)

Channel name: `room:{roomId}`. Three listeners, all calling the same `refresh()`:

| Table | Filter |
|-------|--------|
| `rooms` | `id=eq.{roomId}` |
| `participants` | `room_id=eq.{roomId}` |
| `votes` | `room_id=eq.{roomId}` |

Cleanup on unmount or `roomId` change: `supabase.removeChannel(channel)`.

## Optimistic mutations

```mermaid
sequenceDiagram
  participant User
  participant Hook as useRoom
  participant DB as Supabase

  User->>Hook: castVote("8")
  Hook->>Hook: override.votes = optimistic card
  Note over Hook: UI updates immediately
  Hook->>DB: upsert votes row
  Hook->>Hook: refresh()
  Hook->>Hook: clear override (if no other mutations)
  DB-->>Hook: Realtime event (all clients)
```

Host actions (`reveal`, `reset`, `updateStoryTitle`, `updateRoomName`) follow the same pattern with `pending` flags for button spinners.

## Supabase setup requirement

Tables must be in the `supabase_realtime` publication (see `supabase/schema.sql`). Without this, subscriptions connect but **no events fire** — the room only updates after your own writes (post-mutation `refresh()`).

Verify in Supabase Dashboard: **Database → Publications → supabase_realtime** — ensure `rooms`, `participants`, and `votes` are listed.

## Why refetch instead of merging events?

**Pros of current approach**

- Simple and hard to get wrong — always consistent with DB
- One code path for initial load, Realtime, and post-mutation updates
- No manual merge logic per table/event type

**Trade-off**

- Extra read queries on every change (3 SELECTs per event)
- Fine for planning poker room sizes; revisit if rooms grow very large

## Related files

- `hooks/use-room.ts` — subscription + derived loading + optimistic overrides
- `lib/room-actions.ts` — `fetchRoomState`, mutations
- `lib/supabase/client.ts` — browser client singleton
- `supabase/schema.sql` — Realtime publication setup
