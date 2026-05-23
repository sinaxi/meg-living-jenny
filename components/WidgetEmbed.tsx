import Script from "next/script";
import styles from "./WidgetEmbed.module.css";

const WIDGET_SRC = "https://meg.dh.ai-anima.ai/widget.js";
const DH_ID = "20622bdf-abb5-4f5a-bb4c-73782d7f288c";

export default function WidgetEmbed() {
  const apiKey = process.env.NEXT_PUBLIC_DH_API_KEY ?? "";

  return (
    <div className={styles.container}>
      {!apiKey && (
        <p className={styles.hint}>
          Imposta <code>NEXT_PUBLIC_DH_API_KEY</code> nelle variabili d&apos;ambiente
          per attivare il widget.
        </p>
      )}

      {/*
        Script fornito per il widget Digital Humans:
        src="https://meg.dh.ai-anima.ai/widget.js"
        data-api-key="<YOUR_ORG_API_KEY>"
        data-dh-id="20622bdf-abb5-4f5a-bb4c-73782d7f288c"
      */}
      <Script
        id="meg-dh-widget"
        src={WIDGET_SRC}
        strategy="afterInteractive"
        data-api-key={apiKey}
        data-dh-id={DH_ID}
      />
    </div>
  );
}
