create table if not exists public.emotion_entries (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  mood_score int not null check (mood_score between 1 and 5),
  sleep_score int not null check (sleep_score between 1 and 5),
  anxiety_score int not null check (anxiety_score between 1 and 5),
  depression_score int not null check (depression_score between 1 and 5),
  somatic_present text not null check (somatic_present in ('有', '没有')),
  wake_present text not null check (wake_present in ('有', '没有')),
  somatic_note text,
  note text
);

alter table public.emotion_entries enable row level security;

drop policy if exists "allow anon insert emotion entries" on public.emotion_entries;
create policy "allow anon insert emotion entries"
on public.emotion_entries
for insert
to anon
with check (true);

drop policy if exists "deny anon select emotion entries" on public.emotion_entries;
create policy "deny anon select emotion entries"
on public.emotion_entries
for select
to anon
using (false);
