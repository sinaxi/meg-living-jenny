import AppHeader from "@/components/AppHeader";
import WidgetEmbed from "@/components/WidgetEmbed";
import { getSession } from "@/lib/auth";
import { getWidgetScript } from "@/lib/widgetStorage";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const scriptHtml = await getWidgetScript();

  return (
    <>
      <AppHeader username={session.username} role={session.role} />
      <main>
        <WidgetEmbed scriptHtml={scriptHtml} />
      </main>
    </>
  );
}
