-- SerenIQ schema — run this in Supabase SQL Editor BEFORE writing any app code.
-- This is the single biggest "Security" score item for the time invested: RLS means
-- the database itself enforces per-user isolation, independent of any app-layer bug.

create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  mood_score int check (mood_score between 1 and 5) not null,
  content text not null,
  ai_summary text,
  ai_triggers text[],
  ai_emotion_tags text[],
  flagged_for_safety boolean default false,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  flagged_for_safety boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table journal_entries enable row level security;
alter table chat_messages enable row level security;

create policy "users manage own profile" on profiles
  for all using (auth.uid() = id);

create policy "users manage own journal" on journal_entries
  for all using (auth.uid() = user_id);

create policy "users manage own chats" on chat_messages
  for all using (auth.uid() = user_id);

-- Optional: auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
