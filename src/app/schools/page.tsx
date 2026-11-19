import type { Metadata } from "next";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSchools } from "@/lib/data/schools";

export const metadata: Metadata = { title: "Schools" };

export default async function SchoolsPage() {
  const { data: schools } = await getSchools();

  return (
    <div>
      <SectionHeading
        as="h1"
        eyebrow="The Academy"
        title="The Eight Schools"
        description="Each school is a lifelong path of study. Choose one to see its course categories."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {schools.map((school) => (
          <li key={school.slug}>
            <SchoolCard school={school} />
          </li>
        ))}
      </ul>
    </div>
  );
}
