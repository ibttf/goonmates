create table if not exists public.users (
    user_id uuid primary key,
    status text not null,
    plan text not null,
    current_period_start timestamp with time zone not null,
    current_period_end timestamp with time zone not null,
    stripe_customer_id text not null,
    stripe_subscription_id text unique not null,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone default now() not null
);

-- Set up RLS policies
alter table public.users enable row level security;

-- Allow public read access to own row only
create policy "Users can view own row"
    on public.users for select
    using (auth.uid() = user_id);

-- Allow service role full access
create policy "Service role has full access"
    on public.users for all
    using (auth.jwt() ->> 'role' = 'service_role'); 