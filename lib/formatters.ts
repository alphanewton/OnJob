export function formatExperienceLevel(level: string) {
  switch (level) {
    case "intern":
      return "Intern";
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid-Level";
    case "senior":
      return "Senior";
    default:
      throw new Error(`Unknown experience level: ${level}`);
  }
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
export function formatDateTime(date: string) {
  const d = new Date(date);
  return DATE_TIME_FORMATTER.format(d);
}

export function formatQuestionDifficulty(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
    default:
      throw new Error(`Unknown question difficulty`);
  }
}
