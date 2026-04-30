begin;

create extension if not exists pgtap;

select plan(12);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'workspaces', 'workspaces table exists');
select has_table('public', 'workspace_memberships', 'workspace_memberships table exists');

select col_is_pk('public', 'profiles', 'id', 'profiles.id is primary key');
select col_is_unique('public', 'workspaces', 'slug', 'workspace slug is globally unique');
select col_is_unique('public', 'workspace_memberships', 'user_id', 'user can belong to only one workspace in v1');
select policies_are('public', 'workspace_memberships', array['workspace_memberships_select_own_workspace'], 'membership RLS policy exists');
select has_table('public', 'workspace_pinned_wardrobe', 'workspace pinned wardrobe table exists');
select col_is_pk('public', 'workspace_pinned_wardrobe', 'id', 'workspace_pinned_wardrobe.id is primary key');
select col_is_unique('public', 'workspace_pinned_wardrobe', ARRAY['workspace_id', 'dedupe_key'], 'workspace dedupe key is unique');
select policies_are(
  'public',
  'workspace_pinned_wardrobe',
  array['workspace_pinned_wardrobe_insert_member', 'workspace_pinned_wardrobe_select_member'],
  'workspace pinned wardrobe RLS policies exist'
);

select * from finish();

rollback;
