"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon, CodeIcon, DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  initialCode?: string;
  initialLanguage?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  className?: string;
}

// Map file extensions to language IDs for syntax highlighting
const LANGUAGE_MAP: Record<string, string> = {
  // TypeScript/JavaScript
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  // Styles
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  styl: "stylus",
  pcss: "css",
  // Markup
  html: "html",
  htm: "html",
  md: "markdown",
  mdx: "mdx",
  // Data
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  // Config
  env: "bash",
  config: "bash",
  // Other
  txt: "text",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  // Registry specific
  registry: "json",
};

function detectLanguage(code: string, extension?: string): string {
  // First try to detect from extension
  if (extension) {
    const lang = LANGUAGE_MAP[extension.toLowerCase()];
    if (lang) return lang;
  }

  // Then try to detect from content
  if (code.trim().startsWith("{")) return "json";
  if (code.trim().startsWith("<")) return "html";
  if (code.includes("import ") || code.includes("export ")) return "typescript";
  if (code.includes("function ") || code.includes("const "))
    return "javascript";
  if (code.includes("class ") || code.includes("interface "))
    return "typescript";

  return "text";
}

export function CodeViewer({
  initialCode = "",
  initialLanguage,
  showLineNumbers = true,
  showCopyButton = true,
  showDownloadButton = false,
  className,
}: CodeViewerProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const extension = initialLanguage?.split(".").pop()?.toLowerCase();
  const language = detectLanguage(initialCode, extension);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  useEffect(() => {
    if (hasDownloaded) {
      const timer = setTimeout(() => setHasDownloaded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasDownloaded]);

  const copyCode = () => {
    navigator.clipboard.writeText(initialCode);
    setHasCopied(true);
  };

  const downloadCode = () => {
    const blob = new Blob([initialCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setHasDownloaded(true);
  };

  return (
    <div className={cn("relative rounded-md border bg-muted", className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-4 items-center justify-center rounded-[1px] opacity-70">
            <CodeIcon className="text-code size-3" />
          </div>
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          {showDownloadButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
                  onClick={downloadCode}
                >
                  <span className="sr-only">Download</span>
                  {hasDownloaded ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <DownloadIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasDownloaded ? "Downloaded" : "Download Code"}
              </TooltipContent>
            </Tooltip>
          )}
          {showCopyButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
                  onClick={copyCode}
                >
                  <span className="sr-only">Copy</span>
                  {hasCopied ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <ClipboardIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hasCopied ? "Copied" : "Copy to Clipboard"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="relative">
        <ScrollArea className="h-[750px] p-0 overflow-hidden">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            customStyle={{
              height: "100%",
              margin: 0,
              padding: 0,
            }}
            wrapLines
          >
            {initialCode}
          </SyntaxHighlighter>
        </ScrollArea>
      </div>
    </div>
  );
}
