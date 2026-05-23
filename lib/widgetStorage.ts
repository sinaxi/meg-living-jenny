import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import { DEFAULT_WIDGET_SCRIPT } from "./widget";

const BLOB_PATH = "data/widget.txt";
const LOCAL_PATH = path.join(process.cwd(), "data", "widget.txt");

async function readFromBlob(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === BLOB_PATH);
    if (!blob) return null;

    const response = await fetch(blob.url);
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

async function writeToBlob(content: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN non configurato");
  }

  await put(BLOB_PATH, content, {
    access: "public",
    addRandomSuffix: false,
    contentType: "text/plain",
  });
}

async function readFromLocal(): Promise<string | null> {
  try {
    return await fs.readFile(LOCAL_PATH, "utf-8");
  } catch {
    return null;
  }
}

async function writeToLocal(content: string): Promise<void> {
  if (process.env.VERCEL) return;

  try {
    await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
    await fs.writeFile(LOCAL_PATH, content, "utf-8");
  } catch {
    // Filesystem read-only (es. Vercel serverless)
  }
}

export async function getWidgetScript(): Promise<string> {
  const blobContent = await readFromBlob();
  if (blobContent?.trim()) return blobContent;

  const localContent = await readFromLocal();
  if (localContent?.trim()) return localContent;

  return DEFAULT_WIDGET_SCRIPT;
}

export async function saveWidgetScript(script: string): Promise<void> {
  const content = script.trim();
  if (!content) {
    throw new Error("Script widget vuoto");
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(content);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Salvataggio non disponibile: configura BLOB_READ_WRITE_TOKEN su Vercel"
    );
  }

  await writeToLocal(content);
}
