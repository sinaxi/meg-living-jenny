import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";

export async function readDataFile(
  blobPath: string,
  localPath: string
): Promise<string | null> {
  const blobContent = await readFromBlob(blobPath);
  if (blobContent?.trim()) return blobContent;

  try {
    const localContent = await fs.readFile(localPath, "utf-8");
    return localContent.trim() ? localContent : null;
  } catch {
    return null;
  }
}

export async function writeDataFile(
  blobPath: string,
  localPath: string,
  content: string
): Promise<void> {
  await writeToBlob(blobPath, content);

  if (process.env.VERCEL) return;

  try {
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, content, "utf-8");
  } catch {
    // Filesystem read-only
  }
}

async function readFromBlob(blobPath: string): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: blobPath, limit: 10 });
    const blob = blobs.find((b) => b.pathname === blobPath);
    if (!blob) return null;

    const response = await fetch(blob.url);
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

async function writeToBlob(blobPath: string, content: string): Promise<void> {
  await put(blobPath, content, {
    access: "public",
    addRandomSuffix: false,
    contentType: "text/plain",
  });
}
