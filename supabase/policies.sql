alter table if exists users enable row level security;
alter table if exists messages enable row level security;

-- Both users can see each other's profile (only two rows ever exist)
drop policy if exists "read profiles" on users;
create policy "read profiles" on users
  for select using (auth.uid() is not null);

-- A user can see a message only if they are sender or receiver
drop policy if exists "read own thread" on messages;
create policy "read own thread" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- A user can only insert messages as themselves
drop policy if exists "send as self" on messages;
create policy "send as self" on messages
  for insert with check (auth.uid() = sender_id);

-- Sender can edit their own message (e.g. delete_for_everyone, reaction by either party)
-- Receiver can mark delivered_at / read_at; either party can react or "delete for me"
drop policy if exists "update own thread" on messages;
create policy "update own thread" on messages
  for update using (auth.uid() = sender_id or auth.uid() = receiver_id);
