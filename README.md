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

## Database Schema

### Tasks Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: Text
- `description`: Text (Optional)
- `due_date`: Timestamp with timezone (Optional)
- `priority`: Integer (1: High, 2: Medium, 3: Low)
- `completed`: Boolean
- `order`: Integer
- `created_at`: Timestamp with timezone
- `updated_at`: Timestamp with timezone

### Task Checklists Table
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key to tasks)
- `title`: Text
- `completed`: Boolean
- `order`: Integer
- `created_at`: Timestamp with timezone

### Task Notes Table
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key to tasks)
- `content`: Text
- `created_at`: Timestamp with timezone

## Security

- Row Level Security (RLS) enabled
- User-specific data access
- Secure authentication flow
- Protected API endpoints

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Environment Variables

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.