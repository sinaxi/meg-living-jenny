import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, MAX_AGE, createSession } from "@/lib/auth";
import { findUser, verifyPassword } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password obbligatori" },
        { status: 400 }
      );
    }

    const user = await findUser(username);
    if (!user || !(await verifyPassword(user, password))) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const token = await createSession({
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      username: user.username,
      role: user.role,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Errore del server" }, { status: 500 });
  }
}
