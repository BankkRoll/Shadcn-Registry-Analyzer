import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function parseColor(val: string) {
  if (/^#|^hsl|^rgb|^oklch/i.test(val)) return val;
  if (/^[0-9.]+( [0-9.]+%?)+$/.test(val)) return `hsl(${val})`;
  return val;
}

export function StyleThemePreview({
  css,
  cssVars,
  tailwind,
}: {
  css?: any;
  cssVars?: any;
  tailwind?: any;
}) {
  // Convert css object to string
  const cssString = css
    ? Object.entries(css)
        .map(
          ([layer, rules]) =>
            `${layer} {${Object.entries(rules as any)
              .map(
                ([selector, props]) =>
                  `${selector} {${Object.entries(props as any)
                    .map(([k, v]) => `${k}: ${v};`)
                    .join(" ")}}`,
              )
              .join(" ")}}`,
        )
        .join(" ")
    : "";

  // Inject CSS for live preview
  useEffect(() => {
    if (!cssString) return;
    const style = document.createElement("style");
    style.innerHTML = cssString;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [cssString]);

  return (
    <div className="space-y-6">
      {cssVars?.theme && (
        <div>
          <div className="font-semibold mb-1">Theme Variables:</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(cssVars.theme).map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col items-center min-w-[80px]"
              >
                {/(color|background|foreground|border|accent|muted|primary|secondary|destructive|chart)/i.test(
                  key,
                ) && (
                  <div
                    className="w-8 h-8 rounded border mb-1"
                    style={{ background: parseColor(value as string) }}
                  />
                )}
                {/(font)/i.test(key) && (
                  <div style={{ fontFamily: value as string, fontSize: 14 }}>
                    Aa
                  </div>
                )}
                {/(radius)/i.test(key) && (
                  <div
                    className="w-8 h-8 border"
                    style={{
                      borderRadius: value as string,
                      background: "#eee",
                    }}
                  />
                )}
                <span className="text-xs">{key}</span>
                <span className="text-xs text-muted-foreground break-all">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {cssString && (
        <div>
          <div className="font-semibold mb-1">CSS:</div>
          <SyntaxHighlighter
            language="css"
            style={vscDarkPlus}
            customStyle={{ borderRadius: 8 }}
          >
            {cssString}
          </SyntaxHighlighter>
        </div>
      )}
      {cssVars && (
        <div>
          <div className="font-semibold mb-1">CSS Vars:</div>
          <SyntaxHighlighter
            language="css"
            style={vscDarkPlus}
            customStyle={{ borderRadius: 8 }}
          >
            {JSON.stringify(cssVars, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
      {tailwind && (
        <div>
          <div className="font-semibold mb-1">Tailwind Config:</div>
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{ borderRadius: 8 }}
          >
            {JSON.stringify(tailwind, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
