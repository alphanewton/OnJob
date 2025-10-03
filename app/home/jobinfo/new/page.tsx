import { BackLink } from "@/components/BackLink";
import { JobInfoForm } from "@/components/JobInfoForm";
import { Card, CardContent } from "@/components/ui/card";

export default function JobInfoNewPage() {
  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href="/home">Dashboard</BackLink>

      <h1 className="text-3xl md:text-4xl">Create New Job Description</h1>

      <Card>
        <CardContent>
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}
