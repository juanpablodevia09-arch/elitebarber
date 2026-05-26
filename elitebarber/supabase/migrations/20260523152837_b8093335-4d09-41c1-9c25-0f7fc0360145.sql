
-- Roles enum & table
create type public.app_role as enum ('client', 'barber', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  loyalty_points int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.get_my_roles()
returns setof public.app_role language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

-- Auto-create profile + assign client role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'client');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes int not null default 60,
  active boolean not null default true
);
alter table public.services enable row level security;

insert into public.services (name, description, price) values
  ('Haircut', 'Classic premium haircut', 30),
  ('Beard', 'Beard trim & shape', 20),
  ('Eyebrows', 'Eyebrow grooming', 10),
  ('Premium', 'Haircut + hair wash', 45);

-- Appointments
create type public.appointment_status as enum ('scheduled','completed','cancelled','no_show');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  barber_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  service_ids uuid[] not null default '{}',
  total_price numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.appointments (barber_id, scheduled_at);
create index on public.appointments (client_id, scheduled_at);
alter table public.appointments enable row level security;

-- Inventory
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  quantity int not null default 0,
  unit_price numeric(10,2) not null default 0,
  low_stock_threshold int not null default 5,
  created_at timestamptz not null default now()
);
alter table public.inventory enable row level security;

-- RLS Policies
-- Profiles
create policy "View own profile" on public.profiles for select using (auth.uid() = id);
create policy "Update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins manage profiles" on public.profiles for all using (public.has_role(auth.uid(),'admin'));
create policy "Barbers view client profiles" on public.profiles for select using (public.has_role(auth.uid(),'barber'));

-- Roles
create policy "View own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

-- Services
create policy "Anyone authenticated can view services" on public.services for select to authenticated using (true);
create policy "Admins manage services" on public.services for all using (public.has_role(auth.uid(),'admin'));

-- Appointments
create policy "Clients view own appointments" on public.appointments for select using (auth.uid() = client_id);
create policy "Barbers view own appointments" on public.appointments for select using (auth.uid() = barber_id);
create policy "Admins view all appointments" on public.appointments for select using (public.has_role(auth.uid(),'admin'));
create policy "Clients view all barber slots" on public.appointments for select to authenticated using (true);
create policy "Clients create own appointments" on public.appointments for insert with check (auth.uid() = client_id);
create policy "Clients update own appointments" on public.appointments for update using (auth.uid() = client_id);
create policy "Barbers update own appointments" on public.appointments for update using (auth.uid() = barber_id);
create policy "Admins manage appointments" on public.appointments for all using (public.has_role(auth.uid(),'admin'));

-- Inventory
create policy "Staff view inventory" on public.inventory for select using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'barber'));
create policy "Admins manage inventory" on public.inventory for all using (public.has_role(auth.uid(),'admin'));

insert into public.inventory (name, sku, quantity, unit_price, low_stock_threshold) values
  ('Premium Pomade', 'POM-001', 24, 18.00, 5),
  ('Beard Oil', 'BRD-002', 12, 22.00, 4),
  ('Shaving Cream', 'SHV-003', 8, 14.00, 5),
  ('Hair Wax', 'WAX-004', 30, 16.00, 6);
