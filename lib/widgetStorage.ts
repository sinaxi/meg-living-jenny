import path from "path";
import { readDataFile, writeDataFile } from "./blobStorage";
import { DEFAULT_WIDGET_SCRIPT } from "./widget";

const BLOB_PATH = "data/widget.txt";
const LOCAL_PATH = path.join(process.cwd(), "data", "widget.txt");

export async function getWidgetScript(): Promise<string> {
  const content = await readDataFile(BLOB_PATH, LOCAL_PATH);
  return content?.trim() || DEFAULT_WIDGET_SCRIPT;
}

export async function saveWidgetScript(script: string): Promise<void> {
  const content = script.trim();
  if (!content) {
    throw new Error("Script widget vuoto");
  }

  await writeDataFile(BLOB_PATH, LOCAL_PATH, content);
}
