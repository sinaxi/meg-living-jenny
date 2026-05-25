import path from "path";
import bcrypt from "bcryptjs";
import { readDataFile, writeDataFile } from "./blobStorage";
import type { User, UserRole } from "./types";

const BLOB_PATH = "data/users.txt";
const LOCAL_PATH = path.join(process.cwd(), "data", "users.txt");

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

async function ensureDefaultUsers(): Promise<string> {
  const adminHash = await bcrypt.hash("AndRot2026!", 10);
  return serializeUsers([
    { username: "andrea", passwordHash: adminHash, role: "admin" },
  ]);
}

export async function getUsers(): Promise<User[]> {
  const content = await readDataFile(BLOB_PATH, LOCAL_PATH);
  if (content) {
    const users = parseUsers(content);
    if (users.length > 0) return users;
  }

  const defaultContent = await ensureDefaultUsers();
  const users = parseUsers(defaultContent);
  try {
    await saveUsers(users);
  } catch {
    // Seed in memoria se il salvataggio non è disponibile
  }
  return users;
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeDataFile(BLOB_PATH, LOCAL_PATH, serializeUsers(users));
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
