export type UserRole = "admin" | "user";

export interface User {
  username: string;
  passwordHash: string;
  role: UserRole;
}

export interface SessionPayload {
  username: string;
  role: UserRole;
}
