create table if not exists public.workspace_pinned_wardrobe (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  system_item_id text,
  dedupe_key text not null,
  name text not null,
  category text not null check (category in ('top', 'outerwear', 'dress', 'bottom', 'footwear', 'accessory')),
  source_kind text not null check (source_kind in ('uploaded', 'system')),
  storage_path text,
  source_url text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (workspace_id, dedupe_key),
  check (
    (source_kind = 'uploaded' and storage_path is not null and source_url is null) or
    (source_kind = 'system' and source_url is not null and storage_path is null)
  )
);

create index if not exists workspace_pinned_wardrobe_workspace_id_idx
  on public.workspace_pinned_wardrobe (workspace_id);

create index if not exists workspace_pinned_wardrobe_created_by_idx
  on public.workspace_pinned_wardrobe (created_by);

alter table public.workspace_pinned_wardrobe enable row level security;

drop policy if exists "workspace_pinned_wardrobe_select_member" on public.workspace_pinned_wardrobe;
create policy "workspace_pinned_wardrobe_select_member"
  on public.workspace_pinned_wardrobe
  for select
  using (public.is_workspace_member(workspace_id));

drop policy if exists "workspace_pinned_wardrobe_insert_member" on public.workspace_pinned_wardrobe;
create policy "workspace_pinned_wardrobe_insert_member"
  on public.workspace_pinned_wardrobe
  for insert
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

insert into storage.buckets (id, name, public)
values ('wardrobe-pinned', 'wardrobe-pinned', false)
on conflict (id) do nothing;

drop policy if exists "wardrobe_pinned_select_authenticated" on storage.objects;
create policy "wardrobe_pinned_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (false);

drop policy if exists "wardrobe_pinned_insert_authenticated" on storage.objects;
create policy "wardrobe_pinned_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (false);

drop policy if exists "wardrobe_pinned_update_authenticated" on storage.objects;
create policy "wardrobe_pinned_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (false)
  with check (false);

drop policy if exists "wardrobe_pinned_delete_authenticated" on storage.objects;
create policy "wardrobe_pinned_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (false);
