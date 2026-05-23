"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  username: string;
  role: "admin" | "user";
}

export default function AppHeader({ username, role }: AppHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Image
          src="/logo.png"
          alt="MEG Living"
          width={160}
          height={40}
          className={styles.logo}
        />
      </div>

      <div className={styles.right}>
        <span className={styles.user}>
          {username}
          {role === "admin" && <span className={styles.badge}>Admin</span>}
        </span>
        {role === "admin" && (
          <a href="/admin" className={styles.link}>
            Gestione utenti
          </a>
        )}
        {role === "admin" && (
          <a href="/dashboard" className={styles.link}>
            Widget
          </a>
        )}
        <button onClick={handleLogout} className={styles.logout}>
          Esci
        </button>
      </div>
    </header>
  );
}
