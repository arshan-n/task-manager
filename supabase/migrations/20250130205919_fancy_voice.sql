/*
  # Add task details features

  1. New Tables
    - `task_checklists`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `title` (text)
      - `completed` (boolean)
      - `order` (integer)
      - `created_at` (timestamp)
    
    - `task_notes`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own task details
*/

-- Create task_checklists table
CREATE TABLE task_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  "order" int4 NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create task_notes table
CREATE TABLE task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for task_checklists
CREATE POLICY "Users can manage their own task checklists"
  ON task_checklists
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Create policies for task_notes
CREATE POLICY "Users can manage their own task notes"
  ON task_notes
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_id
      AND tasks.user_id = auth.uid()
    )
  );