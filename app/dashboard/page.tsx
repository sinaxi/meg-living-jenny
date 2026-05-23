import AppHeader from "@/components/AppHeader";
import WidgetEmbed from "@/components/WidgetEmbed";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <>
      <AppHeader username={session.username} role={session.role} />
      <main>
        <WidgetEmbed />
      </main>
    </>
  );
}
