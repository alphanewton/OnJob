import { hasPermission } from "@/services/clerk/hasPermission";

export async function canRunResumeAnalysis() {
  return hasPermission("unlimited_resume_analysis");
}
