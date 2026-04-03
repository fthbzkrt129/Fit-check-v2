begin;

create extension if not exists pgtap;

select plan(8);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'organizations', 'organizations table exists');
select has_table('public', 'workspaces', 'workspaces table exists');
select has_table('public', 'workspace_memberships', 'workspace_memberships table exists');

select col_is_pk('public', 'profiles', 'id', 'profiles.id is primary key');
select col_is_unique('public', 'workspaces', 'slug', 'workspace slug is globally unique');
select col_is_unique('public', 'workspace_memberships', 'user_id', 'user can belong to only one workspace in v1');
select policies_are('public', 'workspace_memberships', array['workspace_memberships_select_own_workspace'], 'membership RLS policy exists');

select * from finish();

rollback;
