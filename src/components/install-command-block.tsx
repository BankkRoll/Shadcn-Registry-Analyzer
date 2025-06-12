"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, ClipboardIcon, TerminalIcon } from "lucide-react";
import { useEffect, useState } from "react";

export interface InstallCommandBlockProps {
  /**
   * The package name(s) or registry item(s) or URLs. Accepts string or string[].
   */
  target: string | string[];
  /**
   * Optional: If true, treat as a registry item (not npm package)
   */
  isRegistry?: boolean;
  /**
   * Optional: Custom label for the install block
   */
  label?: string;
}

const getInstallCommands = (
  target: string | string[],
  isRegistry?: boolean,
) => {
  const targets = Array.isArray(target) ? target : [target];
  const joined = targets.join(" ");
  // If any target is a URL, use npx shadcn@latest add <url ...>
  if (isRegistry || targets.some((t) => /^https?:\/\//.test(t))) {
    return {
      pnpm: `pnpm dlx shadcn@latest add ${joined}`,
      npm: `npx shadcn@latest add ${joined}`,
      yarn: `yarn dlx shadcn@latest add ${joined}`,
      bun: `bunx shadcn@latest add ${joined}`,
    };
  }
  // Otherwise, treat as npm package(s)
  return {
    pnpm: `pnpm add ${joined}`,
    npm: `npm install ${joined}`,
    yarn: `yarn add ${joined}`,
    bun: `bun add ${joined}`,
  };
};

export function InstallCommandBlock({
  target,
  isRegistry,
  label,
}: InstallCommandBlockProps) {
  const [packageManager, setPackageManager] = useState("pnpm");
  const [hasCopied, setHasCopied] = useState(false);
  const commands = getInstallCommands(target, isRegistry);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const copyCommand = () => {
    const command = commands[packageManager as keyof typeof commands];
    if (!command) return;

    navigator.clipboard.writeText(command);
    setHasCopied(true);
  };

  return (
    <div className="w-full relative overflow-x-auto">
      <Tabs
        value={packageManager}
        className="w-full gap-0 border rounded"
        onValueChange={(value) => setPackageManager(value)}
      >
        <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1">
          <div className="flex size-4 items-center justify-center rounded-[1px] opacity-70">
            <TerminalIcon className="text-code size-3" />
          </div>
          <TabsList className="rounded-none bg-transparent p-0">
            {Object.keys(commands).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-accent data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(commands).map(([key, value]) => (
            <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
              <pre>
                <code
                  className="relative font-mono text-sm leading-none"
                  data-language="bash"
                >
                  {value}
                </code>
              </pre>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-slot="copy-button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
            onClick={copyCommand}
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
    </div>
  );
}
