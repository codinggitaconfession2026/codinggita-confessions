create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
 display_name text not null default 'Student',
 avatar_url text,
 bio text check (char_length(bio) <= 240),
 role text not null default 'student' check (role in ('student','moderator','admin')),
 allow_messages text not null default 'friends' check (allow_messages in ('everyone','friends','none')),
 created_at timestamptz not null default now()
);

create table if not exists public.friendships (
 id uuid primary key default gen_random_uuid(),
 requester_id uuid not null references public.profiles(id) on delete cascade,
 addressee_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
 created_at timestamptz not null default now(),
 unique(requester_id, addressee_id), check(requester_id <> addressee_id)
);

create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), author_id uuid references public.profiles(id) on delete set null,
 content text not null check (char_length(content) between 2 and 3000),
 category text not null default 'General', visibility text not null default 'public' check (visibility in ('public','community','anonymous')),
 status text not null default 'pending' check (status in ('pending','approved','rejected','removed','flagged')),
 likes integer not null default 0, comments integer not null default 0,
 moderation_note text, created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
 post_id uuid references public.posts(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete cascade,
 primary key(post_id,user_id)
);

create table if not exists public.post_comments (
 id uuid primary key default gen_random_uuid(), post_id uuid references public.posts(id) on delete cascade,
 author_id uuid references public.profiles(id) on delete set null, content text not null check(char_length(content) between 2 and 1000),
 status text not null default 'pending' check(status in ('pending','approved','removed')), created_at timestamptz not null default now()
);

create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
 conversation_id uuid references public.conversations(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete cascade,
 primary key(conversation_id,user_id)
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid references public.conversations(id) on delete cascade,
 sender_id uuid references public.profiles(id) on delete set null, content text not null check(char_length(content) between 1 and 2000),
 status text not null default 'sent' check(status in ('sent','flagged','removed')), created_at timestamptz not null default now()
);

create table if not exists public.blocks (
 blocker_id uuid references public.profiles(id) on delete cascade,
 blocked_id uuid references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);

create table if not exists public.reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid references public.profiles(id) on delete set null,
 post_id uuid references public.posts(id) on delete cascade, message_id uuid references public.messages(id) on delete cascade,
 reason text not null, details text, status text not null default 'open' check(status in ('open','resolved','dismissed')), created_at timestamptz not null default now()
);


create table if not exists public.support_messages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 sender_role text not null check(sender_role in ('student','admin')),
 content text not null check(char_length(content) between 1 and 2000),
 created_at timestamptz not null default now()
);
alter table public.support_messages enable row level security;
create policy "support user read own" on public.support_messages for select to authenticated using(user_id=auth.uid());
create policy "support user send own" on public.support_messages for insert to authenticated with check(user_id=auth.uid() and sender_role='student');

create table if not exists public.admin_content (
 id uuid primary key default gen_random_uuid(), source_post_id uuid references public.posts(id) on delete set null,
 kind text not null check(kind in ('post','story','reel')), title text, caption text, asset_text text not null,
 status text not null default 'draft' check(status in ('draft','ready','published')), created_at timestamptz not null default now()
);

alter table public.profiles enable row level security; alter table public.friendships enable row level security;
alter table public.posts enable row level security; alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security; alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security; alter table public.messages enable row level security;
alter table public.reports enable row level security; alter table public.blocks enable row level security; alter table public.admin_content enable row level security;

-- Profiles: public username/display is visible; private fields can be expanded later.
create policy "profiles readable" on public.profiles for select to authenticated using (true);
create policy "users create profile" on public.profiles for insert to authenticated with check (id=auth.uid() and role='student');
create policy "users update own profile" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and role='student');

create policy "friendships participants" on public.friendships for select to authenticated using(requester_id=auth.uid() or addressee_id=auth.uid());
create policy "friend request own" on public.friendships for insert to authenticated with check(requester_id=auth.uid());
create policy "friend response participant" on public.friendships for update to authenticated using(requester_id=auth.uid() or addressee_id=auth.uid());

create policy "read visible posts" on public.posts for select to authenticated using(status='approved' and (visibility in ('public','community') or author_id=auth.uid()) or author_id=auth.uid());
create policy "create own posts" on public.posts for insert to authenticated with check(author_id=auth.uid() and status='pending');
create policy "update own pending posts" on public.posts for update to authenticated using(author_id=auth.uid() and status='pending') with check(author_id=auth.uid());

create policy "likes readable" on public.post_likes for select to authenticated using(true);
create policy "like own" on public.post_likes for insert to authenticated with check(user_id=auth.uid());
create policy "unlike own" on public.post_likes for delete to authenticated using(user_id=auth.uid());

create policy "comments readable" on public.post_comments for select to authenticated using(status='approved');
create policy "comment own" on public.post_comments for insert to authenticated with check(author_id=auth.uid() and status='pending');

create policy "conversation membership readable" on public.conversation_members for select to authenticated using(user_id=auth.uid());
create policy "conversation member insert" on public.conversation_members for insert to authenticated with check(user_id=auth.uid());
create policy "blocks own" on public.blocks for select to authenticated using(blocker_id=auth.uid() or blocked_id=auth.uid());
create policy "create own block" on public.blocks for insert to authenticated with check(blocker_id=auth.uid());
create policy "delete own block" on public.blocks for delete to authenticated using(blocker_id=auth.uid());
create policy "messages member read" on public.messages for select to authenticated using(exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
create policy "messages member send" on public.messages for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));

create policy "reports own" on public.reports for insert to authenticated with check(reporter_id=auth.uid());
create policy "reports own read" on public.reports for select to authenticated using(reporter_id=auth.uid());

-- Admin content is intentionally server-managed by the admin secret key.
create policy "no public admin content" on public.admin_content for select to authenticated using(false);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,username,display_name) values(new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''),'user_'||substr(replace(new.id::text,'-',''),1,8)), coalesce(new.raw_user_meta_data->>'display_name','Student')) on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.sync_post_likes() returns trigger language plpgsql as $$ begin
 update public.posts set likes=(select count(*) from public.post_likes where post_id=coalesce(new.post_id,old.post_id)) where id=coalesce(new.post_id,old.post_id); return coalesce(new,old); end; $$;
drop trigger if exists post_like_count on public.post_likes;
create trigger post_like_count after insert or delete on public.post_likes for each row execute function public.sync_post_likes();

create or replace function public.sync_post_comments() returns trigger language plpgsql as $$ begin
 update public.posts set comments=(select count(*) from public.post_comments where post_id=coalesce(new.post_id,old.post_id) and status='approved') where id=coalesce(new.post_id,old.post_id); return coalesce(new,old); end; $$;
drop trigger if exists post_comment_count on public.post_comments;
create trigger post_comment_count after insert or update or delete on public.post_comments for each row execute function public.sync_post_comments();


create or replace function public.create_direct_conversation(target uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid; me uuid:=auth.uid(); allow_mode text; blocked boolean; begin
 if me is null or target is null or me=target then raise exception 'Invalid user'; end if;
 select allow_messages into allow_mode from public.profiles where id=target;
 select exists(select 1 from public.blocks where (blocker_id=me and blocked_id=target) or (blocker_id=target and blocked_id=me)) into blocked;
 if blocked then raise exception 'Messaging blocked'; end if;
 if allow_mode='none' then raise exception 'User is not accepting messages'; end if;
 if allow_mode='friends' and not exists(select 1 from public.friendships where status='accepted' and ((requester_id=me and addressee_id=target) or (requester_id=target and addressee_id=me))) then raise exception 'Friends only'; end if;
 select cm.conversation_id into cid from public.conversation_members cm join public.conversation_members cm2 on cm2.conversation_id=cm.conversation_id where cm.user_id=me and cm2.user_id=target limit 1;
 if cid is null then insert into public.conversations default values returning id into cid; insert into public.conversation_members values(cid,me),(cid,target); end if; return cid; end; $$;


create or replace function public.flag_abusive_text() returns trigger language plpgsql as $$ begin
 if new.content ~* '(\m(kill|rape|slut|whore|fuck|bitch|nazi|terrorist)\M)' then new.status := 'flagged'; end if; return new; end; $$;
drop trigger if exists flag_posts on public.posts; create trigger flag_posts before insert on public.posts for each row execute function public.flag_abusive_text();
drop trigger if exists flag_comments on public.post_comments; create trigger flag_comments before insert on public.post_comments for each row execute function public.flag_abusive_text();
drop trigger if exists flag_messages on public.messages; create trigger flag_messages before insert on public.messages for each row execute function public.flag_abusive_text();
drop trigger if exists flag_support_messages on public.support_messages; create trigger flag_support_messages before insert on public.support_messages for each row execute function public.flag_abusive_text();
