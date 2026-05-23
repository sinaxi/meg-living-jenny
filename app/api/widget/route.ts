import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseWidgetScript } from "@/lib/widget";
import { getWidgetScript, saveWidgetScript } from "@/lib/widgetStorage";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const script = await getWidgetScript();
  return NextResponse.json({ script });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const script = String(body.script ?? "").trim();

    parseWidgetScript(script);
    await saveWidgetScript(script);

    return NextResponse.json({ script });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore del server";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
