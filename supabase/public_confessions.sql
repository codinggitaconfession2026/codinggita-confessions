-- Public anonymous confessions + comments
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
create index if not exists confessions_status_created_idx on public.confessions(status, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  content text not null check (char_length(content) between 2 and 500),
  status text not null default 'pending' check (status in ('pending','approved','rejected','flagged','removed')),
  created_at timestamptz not null default now()
);
create index if not exists comments_confession_status_idx on public.comments(confession_id, status, created_at);

alter table public.reports add column if not exists confession_id uuid references public.confessions(id) on delete cascade;
create index if not exists reports_confession_idx on public.reports(confession_id);

alter table public.confessions enable row level security;
alter table public.comments enable row level security;
drop policy if exists "public read approved confessions" on public.confessions;
create policy "public read approved confessions" on public.confessions for select to anon, authenticated using (status='approved');
drop policy if exists "public read approved comments" on public.comments;
create policy "public read approved comments" on public.comments for select to anon, authenticated using (status='approved');

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
create trigger confession_comment_count after insert or update or delete on public.comments for each row execute function public.sync_confession_comments();
