# Enabling the online Sing-Off (Supabase)

The online sing-off needs a free Supabase project. One-time setup, ~5 minutes.
Everything else (Practice, same-device Sing-Off) works with no setup.

## 1. Create the project
1. Go to <https://supabase.com> → sign in **with GitHub** → **New project**.
2. Name it `karaoke-hero`, pick a region near you, set a database password.
3. Wait ~1 min for it to provision.

## 2. Create the table + realtime + access policy
Open **SQL Editor** → **New query**, paste this, and **Run**:

```sql
create table singoffs (
  code        text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Push row changes to both devices in realtime
alter publication supabase_realtime add table singoffs;

-- Open access via the public anon key (friendly game, random codes — no accounts)
alter table singoffs enable row level security;
create policy "anon full access" on singoffs
  for all to anon using (true) with check (true);
```

> Security note: this lets anyone with the anon key read/write the `singoffs`
> table. That's fine for a private game between friends using random 5-char
> codes. If we make it public we'd lock this down (per-room auth) — the same
> path Tongits took.

## 3. Grab your keys
**Settings → API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 4. Add the keys
Create `.env.local` (copy from `.env.example`), paste both values, then restart
`npm run dev` so Vite picks them up. (For a deployed host, add the same two env
vars there and redeploy.)

## 5. Play
- One player → **Sing-Off → Online → Host a game**, shares the 5-char **code**.
- The other → **Sing-Off → Online**, enters the code → **Join**.
- Both sing the same notes on their own devices; scores sync and a winner is
  declared. **Rematch** (host) deals a fresh set of notes.

## How it works
No audio is streamed. Each device detects pitch locally and the match row only
carries the shared note seed + each singer's per-note scores. The pure
`engine/match.ts` decides the winner identically on both ends — the same
seed-driven, headless model the local Sing-Off uses.
