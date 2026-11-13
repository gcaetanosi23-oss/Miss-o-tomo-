-- Missão Átomo: esquema inicial para atividades por turma.
-- Execute com Wrangler D1 após criar o banco. Não armazene gabaritos no cliente.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS teachers (
  github_id TEXT PRIMARY KEY,
  github_login TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS classrooms (
  id TEXT PRIMARY KEY,
  teacher_github_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  access_code_hash TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_github_id) REFERENCES teachers(github_id)
);

CREATE TABLE IF NOT EXISTS classroom_students (
  id TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  student_key_hash TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  UNIQUE (classroom_id, student_key_hash),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  teacher_github_id TEXT NOT NULL,
  title TEXT NOT NULL,
  statement_md TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options_json TEXT NOT NULL DEFAULT '[]',
  correct_answer_json TEXT NOT NULL,
  explanation_md TEXT,
  subject TEXT NOT NULL DEFAULT 'Química',
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_github_id) REFERENCES teachers(github_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  teacher_github_id TEXT NOT NULL,
  classroom_id TEXT NOT NULL,
  title TEXT NOT NULL,
  instructions_md TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  available_from TEXT,
  available_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (teacher_github_id) REFERENCES teachers(github_id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  assessment_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  points REAL NOT NULL DEFAULT 1 CHECK (points > 0),
  PRIMARY KEY (assessment_id, question_id),
  UNIQUE (assessment_id, position),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  classroom_student_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded')),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  score REAL,
  max_score REAL,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_student_id) REFERENCES classroom_students(id),
  UNIQUE (assessment_id, classroom_student_id)
);

CREATE TABLE IF NOT EXISTS submission_answers (
  submission_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_json TEXT NOT NULL,
  is_correct INTEGER CHECK (is_correct IN (0, 1) OR is_correct IS NULL),
  points_awarded REAL,
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (submission_id, question_id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_github_id);
CREATE INDEX IF NOT EXISTS idx_students_classroom ON classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_questions_teacher_status ON questions(teacher_github_id, status);
CREATE INDEX IF NOT EXISTS idx_assessments_classroom_status ON assessments(classroom_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON submissions(assessment_id);
