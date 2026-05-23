"use client";

import { useEffect, useRef } from "react";
import styles from "./WidgetEmbed.module.css";

const DH_ID = "20622bdf-abb5-4f5a-bb4c-73782d7f288c";

export default function WidgetEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_DH_API_KEY ?? "";

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    const existing = document.querySelector('script[data-dh-id="' + DH_ID + '"]');
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://meg.dh.ai-anima.ai/widget.js";
    script.setAttribute("data-api-key", apiKey);
    script.setAttribute("data-dh-id", DH_ID);
    script.async = true;

    containerRef.current.appendChild(script);
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className={styles.placeholder}>
        <p>Widget non configurato.</p>
        <p className={styles.hint}>
          Imposta <code>NEXT_PUBLIC_DH_API_KEY</code> nelle variabili d&apos;ambiente.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className={styles.container} />;
}
