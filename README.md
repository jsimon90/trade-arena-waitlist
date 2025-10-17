# Trade Arena Waitlist

A modern, responsive waitlist landing page for Trade Arena with Supabase integration, referral tracking, and feedback collection.

## Features

- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📧 **Email Collection**: Integrated with Supabase and Formspree
- 🔗 **Referral System**: Automatic referral code generation and tracking
- 💬 **Feedback Collection**: Built-in feedback form with rating system
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast Performance**: Built with Vite and optimized for production

## Tech Stack

- **Frontend**: React 19 + Vite + TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase
- **Email**: Formspree
- **Deployment**: Netlify

## Setup Instructions

### 1. Supabase Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Waitlist + referrals
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ref_code text generated always as (substring(md5(email) for 8)) stored,
  referred_by text,                          -- stores someone else's ref_code
  bonus_points int not null default 0,       -- referral or promo bonuses
  created_at timestamptz default now()
);

-- Feedback from users
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  email text,
  message text not null,
  rating int check (rating between 1 and 5),
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;
alter table public.feedback enable row level security;

-- Allow anonymous INSERTs from your site (safe because we only allow INSERT)
create policy "public insert waitlist"
on public.waitlist for insert
to anon
with check (true);

create policy "public insert feedback"
on public.feedback for insert
to anon
with check (true);

-- Optional: referral leaderboard view
create or replace view public.referral_leaderboard as
select
  w.ref_code,
  count(child.*) as referrals,
  sum(child.bonus_points) as total_points
from public.waitlist w
left join public.waitlist child
  on child.referred_by = w.ref_code
group by w.ref_code
order by referrals desc, total_points desc;
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/movkrypd
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set the following environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_FORMSPREE_ENDPOINT`
3. Deploy automatically on push to main branch

### Manual Deployment

1. Run `npm run build`
2. Upload the `dist` folder to your hosting provider

## How It Works

### Referral System

1. When a user signs up, they get a unique referral code
2. Users can share their referral link: `yoursite.com?ref=ABC12345`
3. When someone signs up via a referral link, the `referred_by` field is set
4. Both users can earn bonus points for successful referrals

### Data Flow

1. **Waitlist Signup**: Email → Supabase (primary) + Formspree (notification)
2. **Feedback**: Message + Rating → Supabase (storage) + Formspree (notification)
3. **Referral Tracking**: URL parameter → localStorage → Supabase

## Customization

- Update colors in `tailwind.config.js`
- Modify animations in the component files
- Add more features to the feedback form
- Customize the referral bonus system

## License

MIT License - feel free to use this for your own projects!