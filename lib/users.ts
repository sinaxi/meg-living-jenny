import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import type { User, UserRole } from "./types";

const USERS_FILE = "users.txt";
const BLOB_PATH = "data/users.txt";
const LOCAL_PATH = path.join(process.cwd(), "data", USERS_FILE);

function parseLine(line: string): User | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const parts = trimmed.split(":");
  if (parts.length < 3) return null;

  const role = parts[parts.length - 1] as UserRole;
  const passwordHash = parts[parts.length - 2];
  const username = parts.slice(0, -2).join(":");

  if (!username || !passwordHash || (role !== "admin" && role !== "user")) {
    return null;
  }

  return { username, passwordHash, role };
}

function serializeUser(user: User): string {
  return `${user.username}:${user.passwordHash}:${user.role}`;
}

function parseUsers(content: string): User[] {
  return content
    .split("\n")
    .map(parseLine)
    .filter((user): user is User => user !== null);
}

function serializeUsers(users: User[]): string {
  const header = "# Formato: username:passwordHash:role (admin|user)\n";
  return header + users.map(serializeUser).join("\n") + "\n";
}

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
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, content, "utf-8");
}

async function ensureDefaultUsers(): Promise<string> {
  const adminHash = await bcrypt.hash("AndRot2026!", 10);
  return serializeUsers([
    { username: "andrea", passwordHash: adminHash, role: "admin" },
  ]);
}

export async function getUsers(): Promise<User[]> {
  const blobContent = await readFromBlob();
  if (blobContent) {
    const users = parseUsers(blobContent);
    if (users.length > 0) return users;
  }

  const localContent = await readFromLocal();
  if (localContent) {
    const users = parseUsers(localContent);
    if (users.length > 0) return users;
  }

  const defaultContent = await ensureDefaultUsers();
  await saveUsers(parseUsers(defaultContent));
  return parseUsers(defaultContent);
}

export async function saveUsers(users: User[]): Promise<void> {
  const content = serializeUsers(users);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(content);
  }

  await writeToLocal(content);
}

export async function findUser(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.username === username) ?? null;
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function createUser(
  username: string,
  password: string,
  role: UserRole = "user"
): Promise<User> {
  const users = await getUsers();

  if (users.some((u) => u.username === username)) {
    throw new Error("Username già esistente");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = { username, passwordHash, role };
  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function deleteUser(username: string): Promise<void> {
  const users = await getUsers();
  const filtered = users.filter((u) => u.username !== username);

  if (filtered.length === users.length) {
    throw new Error("Utente non trovato");
  }

  await saveUsers(filtered);
}

export function toPublicUser(user: User) {
  return { username: user.username, role: user.role };
}
