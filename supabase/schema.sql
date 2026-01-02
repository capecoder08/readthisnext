-- Read This Next Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Books table
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text not null,
  cover_image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Book genres (junction table)
create table public.book_genres (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books on delete cascade not null,
  genre text not null,
  unique(book_id, genre)
);

-- Book tropes (junction table)
create table public.book_tropes (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books on delete cascade not null,
  trope text not null,
  unique(book_id, trope)
);

-- User taste profiles
create table public.user_taste_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  genre text not null,
  preference_score integer not null check (preference_score >= 0 and preference_score <= 100),
  unique(user_id, genre)
);

-- User tropes (favorite tropes)
create table public.user_tropes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  trope text not null,
  unique(user_id, trope)
);

-- User library (books the user has added)
create type book_status as enum ('want_to_read', 'reading', 'read');

create table public.user_library (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  book_id uuid references public.books on delete cascade not null,
  status book_status not null default 'want_to_read',
  rating integer check (rating >= 1 and rating <= 5),
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id)
);

-- Reading goals
create table public.reading_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  year integer not null,
  target_books integer not null default 12,
  books_read integer not null default 0,
  unique(user_id, year)
);

-- Indexes for better query performance
create index idx_book_genres_book_id on public.book_genres(book_id);
create index idx_book_tropes_book_id on public.book_tropes(book_id);
create index idx_user_library_user_id on public.user_library(user_id);
create index idx_user_library_status on public.user_library(status);
create index idx_user_taste_profiles_user_id on public.user_taste_profiles(user_id);
create index idx_reading_goals_user_year on public.reading_goals(user_id, year);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.book_genres enable row level security;
alter table public.book_tropes enable row level security;
alter table public.user_taste_profiles enable row level security;
alter table public.user_tropes enable row level security;
alter table public.user_library enable row level security;
alter table public.reading_goals enable row level security;

-- Profiles: Users can read all profiles, but only update their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Books: Everyone can read books, authenticated users can insert
create policy "Books are viewable by everyone"
  on public.books for select
  using (true);

create policy "Authenticated users can insert books"
  on public.books for insert
  with check (auth.role() = 'authenticated');

create policy "Book genres are viewable by everyone"
  on public.book_genres for select
  using (true);

create policy "Book tropes are viewable by everyone"
  on public.book_tropes for select
  using (true);

-- User-specific tables: Users can only access their own data
create policy "Users can view own taste profiles"
  on public.user_taste_profiles for select
  using (auth.uid() = user_id);

create policy "Users can manage own taste profiles"
  on public.user_taste_profiles for all
  using (auth.uid() = user_id);

create policy "Users can view own tropes"
  on public.user_tropes for select
  using (auth.uid() = user_id);

create policy "Users can manage own tropes"
  on public.user_tropes for all
  using (auth.uid() = user_id);

create policy "Users can view own library"
  on public.user_library for select
  using (auth.uid() = user_id);

create policy "Users can manage own library"
  on public.user_library for all
  using (auth.uid() = user_id);

create policy "Users can view own reading goals"
  on public.reading_goals for select
  using (auth.uid() = user_id);

create policy "Users can manage own reading goals"
  on public.reading_goals for all
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create default reading goal for current year
  insert into public.reading_goals (user_id, year, target_books, books_read)
  values (new.id, extract(year from now())::integer, 12, 0);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
