import z from "zod";

export const experienceLevels = ["intern", "junior", "mid-level", "senior"];

export const jobInfoSchema = z.object({
  name: z.string().min(1, "Required"),
  title: z.string().min(1).nullable(),
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, "Required"),
});

export const questionDifficulties = ["easy", "medium", "hard"];
//Enum type
export type QuestionDifficulty = "easy" | "medium" | "hard";
