"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./AdminPanel.module.css";

export default function WidgetSection() {
  const [script, setScript] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const loadScript = useCallback(async () => {
    const res = await fetch("/api/widget");
    if (res.ok) {
      const data = await res.json();
      setScript(data.script ?? "");
    }
  }, []);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/widget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Errore nel salvataggio");
        return;
      }

      setSuccess("Widget aggiornato");
      setScript(data.script ?? script);
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.listTitle}>Widget</h2>

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.field}>
          <label htmlFor="widget-script">Script widget</label>
          <textarea
            id="widget-script"
            className={styles.textarea}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={8}
            spellCheck={false}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? "Salvataggio..." : "Salva widget"}
        </button>
      </form>
    </section>
  );
}
