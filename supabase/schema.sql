create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key,
  phone_number text unique not null,
  name text not null,
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) not null,
  receiver_id uuid references users(id) not null,
  type text not null default 'text',        -- 'text' | 'image' | 'audio'
  text text,
  image_url text,
  audio_url text,
  audio_duration_ms integer,
  reply_to_id uuid references messages(id),
  reaction text,                             -- single emoji, WhatsApp-style (one reaction per message)
  starred_by uuid[] default '{}',
  deleted_for_everyone boolean not null default false,
  deleted_for uuid[] default '{}',           -- per-user "delete for me"
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on messages (created_at);
create index if not exists messages_sender_receiver_idx on messages (sender_id, receiver_id);

-- Seed the two fixed users (replace with values matching .env)
insert into users (id, phone_number, name) values
  ('11111111-1111-1111-1111-111111111111', '+919999999999', 'Alex'),
  ('22222222-2222-2222-2222-222222222222', '+918888888888', 'Sam')
on conflict (id) do update set
  phone_number = excluded.phone_number,
  name = excluded.name;

-- Safely add messages to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END
$$;

-- Rate Limits
create table if not exists rate_limits (
  ip text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);

-- RPC for atomic array append
create or replace function append_array_distinct(message_id uuid, column_name text, user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  execute format(
    'update messages set %I = array_append(array_remove(coalesce(%I, ''{}''), $1), $1) where id = $2',
    column_name, column_name
  ) using user_id, message_id;
end;
$$;

-- RPC for atomic array remove
create or replace function remove_array_item(message_id uuid, column_name text, user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  execute format(
    'update messages set %I = array_remove(coalesce(%I, ''{}''), $1) where id = $2',
    column_name, column_name
  ) using user_id, message_id;
end;
$$;
