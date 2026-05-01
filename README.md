# Speak — AI Rights Awareness Tool

> Know your rights. Take action. Be heard.

Speak is an AI-powered mobile application that helps people in the UK understand their rights when facing everyday situations of injustice. Users describe their situation in plain English and receive accessible, general information about relevant legislation, suggested next steps, a draft template letter, and signposting to the appropriate authorities and support organisations.

**This application provides general information and guidance only. It is not a substitute for professional legal advice.**

---

## Categories Covered

- Renter rights and housing disputes
- Workplace discrimination
- Consumer fraud and scams
- Data and privacy violations
- Whistleblowing

---

## Features

- Conversational AI intake powered by the Claude API
- Structured information packs with rights, suggested steps, evidence checklist, and authority matching
- Draft template letters for users to review and adapt
- User authentication via email and password
- Anonymous mode with no server-side data storage
- Saved case journal for registered users
- Cross-platform iOS and Android support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native with Expo |
| AI Engine | Claude API (Anthropic) |
| Backend and Database | Supabase (PostgreSQL, Auth, Row Level Security) |
| Anonymous Mode | AsyncStorage (local device only) |

---

## Project Structure

```
speak/
├── App.js                  # Root navigation and auth state
├── src/
│   ├── screens/
│   │   ├── AuthScreen.js       # Sign in, sign up, anonymous access
│   │   ├── HomeScreen.js       # Category selection
│   │   ├── ChatScreen.js       # Conversational AI intake
│   │   ├── ResultsScreen.js    # Information pack display
│   │   └── JournalScreen.js    # Saved cases
│   └── lib/
│       ├── api.js              # Claude API integration and system prompt
│       └── supabase.js         # Supabase client configuration
```

---

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Expo Go app on your mobile device (iOS or Android)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/speak-app.git
cd speak-app
```

2. Install dependencies:

```bash
npm install
```

3. Create your configuration files.

Create `src/lib/api.js` and add your Claude API key:

```javascript
export const ANTHROPIC_API_KEY = 'your_claude_api_key_here';
export const API_URL = 'https://api.anthropic.com/v1/messages';

export const SYSTEM_PROMPT = `...`; // See project documentation

export async function sendToAI(messages) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}
```

Create `src/lib/supabase.js` and add your Supabase credentials:

```javascript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'your_supabase_url_here';
const SUPABASE_ANON_KEY = 'your_anon_key_here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

4. Start the development server:

```bash
npx expo start
```

5. Scan the QR code with Expo Go on your phone.

---

## Database Setup

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
create table cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  category text not null,
  summary text,
  created_at timestamp with time zone default now()
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table action_packs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases on delete cascade,
  rights jsonb,
  legislation jsonb,
  action_plan jsonb,
  evidence jsonb,
  authorities jsonb,
  draft_letter text,
  created_at timestamp with time zone default now()
);

alter table cases enable row level security;
alter table messages enable row level security;
alter table action_packs enable row level security;

create policy "Users can manage their own cases"
  on cases for all using (auth.uid() = user_id);

create policy "Users can manage their own messages"
  on messages for all using (
    case_id in (select id from cases where user_id = auth.uid())
  );

create policy "Users can manage their own action packs"
  on action_packs for all using (
    case_id in (select id from cases where user_id = auth.uid())
  );
```

---

## Important Notes

- **API keys are not included in this repository.** You must provide your own Claude API key and Supabase credentials.
- The `src/lib/api.js` and `src/lib/supabase.js` files are excluded from version control for security reasons.
- This application is a university prototype. It is not intended for production deployment without further security review.
- All AI generated outputs are general guidance only and do not constitute legal advice.

---

## Academic Context

This project was developed as part of the BSc Software Engineering for Business degree at UWE Bristol (2025/26). The application was built over approximately four weeks using an iterative, Agile-inspired development approach.

---

## Disclaimer

Speak provides general information and signposting only. It is not a source of legal advice and does not make any determination about a user's specific legal position. Users are strongly encouraged to seek advice from a qualified professional such as Citizens Advice, a solicitor, or the relevant regulatory body before taking any action.

---

## Author

Si Thu — BSc Software Engineering for Business, UWE Bristol
