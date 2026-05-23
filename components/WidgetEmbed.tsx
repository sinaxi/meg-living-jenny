"use client";

import { useEffect, useRef, useState } from "react";
import { parseWidgetScript } from "@/lib/widget";
import styles from "./WidgetEmbed.module.css";

interface WidgetEmbedProps {
  scriptHtml: string;
}

export default function WidgetEmbed({ scriptHtml }: WidgetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setError("");
    container.innerHTML = "";
    document.getElementById("user-widget-script")?.remove();

    try {
      const { src, attributes } = parseWidgetScript(scriptHtml);
      const script = document.createElement("script");
      script.id = "user-widget-script";
      script.src = src;
      script.async = true;

      for (const [key, value] of Object.entries(attributes)) {
        script.setAttribute(key, value);
      }

      container.appendChild(script);
    } catch {
      setError("Script widget non valido.");
    }

    return () => {
      document.getElementById("user-widget-script")?.remove();
    };
  }, [scriptHtml]);

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return <div ref={containerRef} className={styles.container} />;
}
