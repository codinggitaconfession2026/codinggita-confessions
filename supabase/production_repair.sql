-- CodingGita production repair migration
-- Run this ONCE in Supabase SQL Editor for the existing live database.
-- It adds account approval and anonymous confession tables without deleting existing data.

-- A) Account approval: existing users stay approved; future profiles default to pending.
alter table public.profiles add column if not exists approval_status text;
update public.profiles set approval_status='approved' where approval_status is null;
alter table public.profiles alter column approval_status set default 'pending';
alter table public.profiles alter column approval_status set not null;
alter table public.profiles drop constraint if exists profiles_approval_status_check;
alter table public.profiles add constraint profiles_approval_status_check
  check (approval_status in ('pending','approved','rejected'));
create index if not exists profiles_approval_status_idx on public.profiles(approval_status);

create or replace function public.is_approved_user(uid uuid)
returns boolean language sql security definer set search_path=public as $$
  select exists (select 1 from public.profiles where id=uid and approval_status='approved');
$$;

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
create policy "read visible posts" on public.posts for select to authenticated
using (public.is_approved_user(auth.uid()) and (status='approved' and (visibility in ('public','community') or author_id=auth.uid()) or author_id=auth.uid()));
drop policy if exists "create own posts" on public.posts;
create policy "create own posts" on public.posts for insert to authenticated
with check (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending');
drop policy if exists "update own pending posts" on public.posts;
create policy "update own pending posts" on public.posts for update to authenticated
using (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending')
with check (public.is_approved_user(auth.uid()) and author_id=auth.uid());

drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes for select to authenticated using (public.is_approved_user(auth.uid()));
drop policy if exists "like own" on public.post_likes;
create policy "like own" on public.post_likes for insert to authenticated
with check (public.is_approved_user(auth.uid()) and user_id=auth.uid());
drop policy if exists "unlike own" on public.post_likes;
create policy "unlike own" on public.post_likes for delete to authenticated
using (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments for select to authenticated
using (public.is_approved_user(auth.uid()) and status='approved');
drop policy if exists "comment own" on public.post_comments;
create policy "comment own" on public.post_comments for insert to authenticated
with check (public.is_approved_user(auth.uid()) and author_id=auth.uid() and status='pending');

drop policy if exists "conversation membership readable" on public.conversation_members;
create policy "conversation membership readable" on public.conversation_members for select to authenticated
using (public.is_approved_user(auth.uid()) and user_id=auth.uid());
drop policy if exists "conversation member insert" on public.conversation_members;
create policy "conversation member insert" on public.conversation_members for insert to authenticated
with check (public.is_approved_user(auth.uid()) and user_id=auth.uid());

drop policy if exists "blocks own" on public.blocks;
create policy "blocks own" on public.blocks for select to authenticated
using (public.is_approved_user(auth.uid()) and (blocker_id=auth.uid() or blocked_id=auth.uid()));
drop policy if exists "create own block" on public.blocks;
create policy "create own block" on public.blocks for insert to authenticated
with check (public.is_approved_user(auth.uid()) and blocker_id=auth.uid());
drop policy if exists "delete own block" on public.blocks;
create policy "delete own block" on public.blocks for delete to authenticated
using (public.is_approved_user(auth.uid()) and blocker_id=auth.uid());

drop policy if exists "messages member read" on public.messages;
create policy "messages member read" on public.messages for select to authenticated
using (public.is_approved_user(auth.uid()) and exists (
  select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()
));
drop policy if exists "messages member send" on public.messages;
create policy "messages member send" on public.messages for insert to authenticated
with check (public.is_approved_user(auth.uid()) and sender_id=auth.uid() and exists (
  select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()
));

-- B) Anonymous confession system, separate from account-based community posts.
create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 10 and 1000),
  category text not null default 'Other' check (category in ('Love','Funny','Coding','Rant','College Life','Other')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','flagged','removed')),
  likes integer not null default 0,
  comments integer not null default 0,
  moderation_note text,
  created_at timestamptz not null default now()
);
alter table public.confessions add column if not exists likes integer not null default 0;
alter table public.confessions add column if not exists comments integer not null default 0;
alter table public.confessions add column if not exists moderation_note text;
alter table public.confessions add column if not exists created_at timestamptz not null default now();
create index if not exists confessions_status_created_idx on public.confessions(status,created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected','flagged','removed')),
  created_at timestamptz not null default now()
);
create index if not exists comments_confession_status_idx on public.comments(confession_id,status,created_at);
alter table public.reports add column if not exists confession_id uuid references public.confessions(id) on delete cascade;
create index if not exists reports_confession_idx on public.reports(confession_id);

alter table public.confessions enable row level security;
alter table public.comments enable row level security;
drop policy if exists "public read approved confessions" on public.confessions;
create policy "public read approved confessions" on public.confessions
for select to anon,authenticated using (status='approved');
drop policy if exists "public read approved comments" on public.comments;
create policy "public read approved comments" on public.comments
for select to anon,authenticated using (status='approved');

create or replace function public.sync_confession_comments()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.confessions set comments=(
    select count(*) from public.comments
    where confession_id=coalesce(new.confession_id,old.confession_id) and status='approved'
  ) where id=coalesce(new.confession_id,old.confession_id);
  return coalesce(new,old);
end;
$$;
drop trigger if exists confession_comment_count on public.comments;
create trigger confession_comment_count after insert or update or delete on public.comments
for each row execute function public.sync_confession_comments();

-- Private admin-support chat intentionally remains available to pending students.


-- C) Make profile creation robust for duplicate display names/usernames.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  base_username text;
  candidate text;
  suffix text;
begin
  base_username := coalesce(nullif(new.raw_user_meta_data->>'username',''), 'user_' || substr(replace(new.id::text,'-',''),1,8));
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  if char_length(base_username) < 3 then base_username := 'student'; end if;
  candidate := left(base_username, 24);

  if exists (select 1 from public.profiles where username=candidate) then
    suffix := substr(replace(new.id::text,'-',''),1,8);
    candidate := left(base_username, 15) || '_' || suffix;
  end if;

  insert into public.profiles(id,username,display_name,approval_status)
  values (
    new.id,
    candidate,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),'Student'),
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
