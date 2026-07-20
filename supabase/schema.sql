create extension if not exists "pgcrypto";

create table users (
  id uuid primary key,
  phone_number text unique not null,
  name text not null,
  avatar_url text,
  last_seen_at timestamptz,
  created_at timestamptz default now()
);

create table messages (
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

create index messages_created_at_idx on messages (created_at);
create index messages_sender_receiver_idx on messages (sender_id, receiver_id);

-- Seed the two fixed users (replace with values matching .env)
insert into users (id, phone_number, name) values
  ('11111111-1111-1111-1111-111111111111', '+919999999999', 'Alex'),
  ('22222222-2222-2222-2222-222222222222', '+918888888888', 'Sam');

alter publication supabase_realtime add table messages;
