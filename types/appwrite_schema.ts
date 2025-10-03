export interface userTable {
  $id?: string;
  email?: string; // Unique identifier (indexed)
  name?: string | null;
  imageUrl?: string | null;
  jobInfo?: string | null;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface JobInfoTable {
  $id?: string; // Auto-generated document ID
  title?: string | null; // Job title (max 100 chars)
  name?: string | null; // Company or job name (max 100 chars)
  experienceLevel?: "intern" | "junior" | "mid-level" | "senior" | null; // Experience level
  description?: string | null; // Job description (max 1000 chars)
  userTable?: string | null; // Reference to UserTable
  questionTable?: string | null; // Reference to QuestionTable
  interviewTable?: string | null; // Reference to InterviewTable
  $createdAt?: string; // ISO datetime
  $updatedAt?: string; // ISO datetime
}

export interface InterviewTable {
  $id?: string; // System field - document ID
  jobInfo?: string; // Reference to JobInfo (likely a foreign key)
  duration?: string | null; // Optional text field (size 100)
  humeChatId?: string | null; // Optional text field (size 100)
  feedback?: string | null; // Optional text field (size 1000)
  $createdAt?: string; // System field - ISO timestamp
  $updatedAt?: string; // System field - ISO timestamp
  userTable?: string; // Reference to UserTable
}

export interface QuestionTable {
  $id?: string; // System field - document ID
  jobInfo?: string; // Reference to JobInfo (likely a foreign key)
  text?: string | null; // Optional text field (size 100)
  difficulty?: string | null; // Optional text field (size 100)
  $createdAt?: string; // System field - ISO timestamp
  $updatedAt?: string; // System field - ISO timestamp
  userTable?: string; // Reference to UserTable
}
