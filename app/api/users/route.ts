import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createUser,
  deleteUser,
  getUsers,
  toPublicUser,
} from "@/lib/users";
import type { UserRole } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const users = await getUsers();
  return NextResponse.json(users.map(toPublicUser));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const role = (body.role ?? "user") as UserRole;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password obbligatori" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Ruolo non valido" }, { status: 400 });
    }

    const user = await createUser(username, password, role);
    return NextResponse.json(toPublicUser(user), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore del server";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();

    if (!username) {
      return NextResponse.json(
        { error: "Username obbligatorio" },
        { status: 400 }
      );
    }

    if (username === session.username) {
      return NextResponse.json(
        { error: "Non puoi eliminare il tuo account" },
        { status: 400 }
      );
    }

    await deleteUser(username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore del server";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
