# Task Management Application

A simple, minimalistic alternative to task management applications such as Trello.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Fill the file in the project root with your Supabase details:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Database setup:
   - Go to your Supabase dashboard
   - Go to the SQL editor
   - Run the contents of:
     - `supabase/migrations/supabase.sql`

### 3. Run the Application

```bash
npm run dev
```

## Key Components

### Authentication
- Email/password authentication
- Protected routes
- Secure session management

### Task Management
- Create, read, update, and delete tasks
- Priority levels
- Due dates
- Task ordering
- Checklists

### Focus Mode
- Pomodoro timer
- Focus/break intervals
- Task-specific focus sessions
- Desktop notifications


### Environment Variables

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
