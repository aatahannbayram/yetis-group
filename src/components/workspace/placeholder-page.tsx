import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <ComingSoonPage title={title} description={description} />;
}
