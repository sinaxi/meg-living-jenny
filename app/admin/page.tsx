import AdminPanel from "@/components/AdminPanel";
import AppHeader from "@/components/AppHeader";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "admin") redirect("/dashboard");

  return (
    <>
      <AppHeader username={session.username} role={session.role} />
      <main>
        <AdminPanel />
      </main>
    </>
  );
}
