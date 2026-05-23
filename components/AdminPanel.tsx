"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import WidgetSection from "@/components/WidgetSection";
import styles from "./AdminPanel.module.css";

interface PublicUser {
  username: string;
  role: "admin" | "user";
}

export default function AdminPanel() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      setUsers(await res.json());
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Errore nella creazione");
        return;
      }

      setSuccess(`Utente "${data.username}" creato`);
      setUsername("");
      setPassword("");
      setRole("user");
      await loadUsers();
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(targetUsername: string) {
    if (!confirm(`Eliminare l'utente "${targetUsername}"?`)) return;

    setError("");
    setSuccess("");

    const res = await fetch(
      `/api/users?username=${encodeURIComponent(targetUsername)}`,
      { method: "DELETE" }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Errore nell'eliminazione");
      return;
    }

    setSuccess(`Utente "${targetUsername}" eliminato`);
    await loadUsers();
  }

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h1 className={styles.title}>Gestione utenti</h1>

        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="new-username">Username</label>
              <input
                id="new-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-password">Password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="new-role">Ruolo</label>
              <select
                id="new-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
              >
                <option value="user">Utente</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? "Creazione..." : "Crea utente"}
          </button>
        </form>
      </section>

      <WidgetSection />

      <section className={styles.section}>
        <h2 className={styles.listTitle}>Utenti registrati</h2>

        {users.length === 0 ? (
          <p className={styles.empty}>Nessun utente registrato.</p>
        ) : (
          <ul className={styles.list}>
            {users.map((user) => (
              <li key={user.username} className={styles.listItem}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.username}</span>
                  <span className={styles.userRole}>
                    {user.role === "admin" ? "Amministratore" : "Utente"}
                  </span>
                </div>
                {user.username !== "andrea" && (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(user.username)}
                  >
                    Elimina
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
