-- Run this in your Supabase SQL editor

-- Analysis results (persisted per repo+persona, no auth required)
-- Repo-specific checklist (generated from AI analysis, stored as JSON)
create table if not exists repo_checklist (
  repo_id text primary key,
  items jsonb not null default '[]',
  completed jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists analysis_results (
  id uuid primary key default gen_random_uuid(),
  repo_id text not null,
  persona text not null check (persona in ('frontend', 'backend', 'ux')),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(repo_id, persona)
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  repo_id text not null,
  item_key text not null,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, repo_id, item_key)
);

alter table checklist_items enable row level security;

do $$ begin
  create policy "Users manage own checklist" on checklist_items
    for all using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
