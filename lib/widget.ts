export const DEFAULT_WIDGET_SCRIPT = `<script
  src="https://meg.dh.ai-anima.ai/widget.js"
  data-api-key="9ac2e0b36c93e554f33cddf9db9c348692aebf77cb30e80ce12ff04c02477134"
  data-dh-id="20622bdf-abb5-4f5a-bb4c-73782d7f288c"></script>`;

export interface ParsedWidgetScript {
  src: string;
  attributes: Record<string, string>;
}

export function parseWidgetScript(html: string): ParsedWidgetScript {
  const trimmed = html.trim();
  if (!trimmed) {
    throw new Error("Script widget vuoto");
  }

  const scriptMatch = trimmed.match(/<script\b([^>]*)>/i);
  if (!scriptMatch) {
    throw new Error("Inserisci un tag <script> valido");
  }

  const attrPart = scriptMatch[1];
  const srcMatch = attrPart.match(/\bsrc=["']([^"']+)["']/i);
  if (!srcMatch?.[1]) {
    throw new Error("Lo script deve avere l'attributo src");
  }

  const attributes: Record<string, string> = {};
  const attrRegex = /([\w:-]+)=["']([^"']*)["']/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrPart)) !== null) {
    const [, name, value] = match;
    if (name !== "src") {
      attributes[name] = value;
    }
  }

  return { src: srcMatch[1], attributes };
}
