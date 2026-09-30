-- CodingGita account approval migration for an existing Supabase database.
-- Run this once in Supabase SQL Editor after deploying the app changes.

alter table public.profiles add column if not exists approval_status text;

-- Existing accounts remain usable. New accounts created by the trigger will use the default.
update public.profiles set approval_status='approved' where approval_status is null;

alter table public.profiles alter column approval_status set default 'pending';
alter table public.profiles alter column approval_status set not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='profiles_approval_status_check') then
    alter table public.profiles add constraint profiles_approval_status_check
      check (approval_status in ('pending','approved','rejected'));
  end if;
end $$;

create index if not exists profiles_approval_status_idx on public.profiles(approval_status);

-- Helper used by RLS so pending users can only use the private admin-support chat.
create or replace function public.is_approved_user(uid uuid)
returns boolean
language sql
security definer
set search_path=public
as $$
  select exists(
    select 1 from public.profiles
    where id=uid and approval_status='approved'
  );
$$;

-- Replace policies whose existing rules would otherwise let a pending account use
-- normal community/friend/chat features.
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
for update to authenticated
using (id=auth.uid() and approval_status='approved')
with check (id=auth.uid() and role='student' and approval_status='approved');

drop policy if exists "friendships participants" on public.friendships;
create policy "friendships participants" on public.friendships
for select to authenticated using (public.is_approved_user(auth.uid()) and (requester_id=auth.uid() or addressee_id=auth.uid()));

drop policy if exists "friend request own" on public.friendships;
create policy "friend request own" on public.friendships
for insert to authenticated with check (public.is_approved_user(auth.uid()) and requester_id=auth.uid());

drop policy if exists "friend response participant" on public.friendships;
create policy "friend response participant" on public.friendships
for update to authenticated using (public.is_approved_user(auth.uid()) and (requester_id=auth.uid() or addressee_id=auth.uid()));

drop policy if exists "read visible posts" on public.posts;
create policy "read visible posts" on public.posts
for select to authenticated
using (public.is_approved_user(auth.uid()) and (status='approved' and (visibility in ('public','community') or author_id=auth.uid()) or author_id=auth.uid()));

drop policy if exists "create own posts" on public.posts;
create policy "create own posts" on public.posts
for insert to authenticated with check (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending');

drop policy if exists "update own pending posts" on public.posts;
create policy "update own pending posts" on public.posts
for update to authenticated using (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending')
with check (public.is_approved_user(auth.uid()) and author_id=auth.uid());

drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes
for select to authenticated using (public.is_approved_user(auth.uid()));

drop policy if exists "like own" on public.post_likes;
create policy "like own" on public.post_likes
for insert to authenticated with check (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "unlike own" on public.post_likes;
create policy "unlike own" on public.post_likes
for delete to authenticated using (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments
for select to authenticated using (public.is_approved_user(auth.uid()) and status='approved');

drop policy if exists "comment own" on public.post_comments;
create policy "comment own" on public.post_comments
for insert to authenticated with check (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending');

drop policy if exists "conversation membership readable" on public.conversation_members;
create policy "conversation membership readable" on public.conversation_members
for select to authenticated using (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "conversation member insert" on public.conversation_members;
create policy "conversation member insert" on public.conversation_members
for insert to authenticated with check (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "blocks own" on public.blocks;
create policy "blocks own" on public.blocks
for select to authenticated using (public.is_approved_user(auth.uid()) and (blocker_id=auth.uid() or blocked_id=auth.uid()));

drop policy if exists "create own block" on public.blocks;
create policy "create own block" on public.blocks
for insert to authenticated with check (public.is_approved_user(auth.uid()) and blocker_id=auth.uid());

drop policy if exists "delete own block" on public.blocks;
create policy "delete own block" on public.blocks
for delete to authenticated using (public.is_approved_user(auth.uid()) and blocker_id=auth.uid());

drop policy if exists "messages member read" on public.messages;
create policy "messages member read" on public.messages
for select to authenticated using (public.is_approved_user(auth.uid()) and exists(
  select 1 from public.conversation_members cm
  where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()
));

drop policy if exists "messages member send" on public.messages;
create policy "messages member send" on public.messages
for insert to authenticated with check (public.is_approved_user(auth.uid()) and sender_id=auth.uid() and exists(
  select 1 from public.conversation_members cm
  where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()
));

-- Support chat remains available to pending users by design.
