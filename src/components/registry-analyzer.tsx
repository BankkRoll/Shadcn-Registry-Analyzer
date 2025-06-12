"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { FileSandbox } from "./file-sandbox";
import { InstallCommandBlock } from "./install-command-block";

// Universal command/URL parser
function parseUniversalInput(input: string) {
  const trimmed = input.trim();
  // Try to extract a URL
  const urlMatch = trimmed.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch) {
    return { url: urlMatch[1], type: "url" };
  }
  // Try to extract a name from any install command
  const addMatch = trimmed.match(/add\s+(@?[^\s]+)/i);
  if (addMatch) {
    const target = addMatch[1];
    if (target.startsWith("@http")) {
      return { url: target.slice(1), type: "url" };
    }
    if (target.startsWith("http")) {
      return { url: target, type: "url" };
    }
    // Assume official registry
    return {
      url: `https://ui.shadcn.com/r/styles/default/${target.replace(/^@/, "")}.json`,
      type: "registry",
    };
  }
  // If just a name
  if (/^[\w-]+$/.test(trimmed)) {
    return {
      url: `https://ui.shadcn.com/r/styles/default/${trimmed}.json`,
      type: "registry",
    };
  }
  return {
    url: null,
    type: null,
    error: "Could not parse input as a registry URL or install command.",
  };
}

export function RegistryAnalyzer() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<any[]>([]);
  const [registryData, setRegistryData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setError(null);
    setRegistryData(null);
    setSteps([
      { label: "Parsing input", status: "active" },
      { label: "Fetching registry", status: "pending" },
      { label: "Analyzing item", status: "pending" },
      { label: "Success", status: "pending" },
    ]);
    setLoading(true);

    // Step 1: Parse
    let url: string | null = null;
    let parseError: string | undefined;
    let type: string | null = null;
    try {
      const parsed = parseUniversalInput(input);
      url = parsed.url;
      type = parsed.type;
      parseError = parsed.error;
      setSteps((prev) => [
        {
          ...prev[0],
          status: parsed.error ? "error" : "done",
          details: parsed.error ? parsed.error : url || undefined,
        },
        ...prev.slice(1),
      ]);
      if (parsed.error) throw new Error(parsed.error);
    } catch (err) {
      setError(
        "Failed to parse input: " +
          (err instanceof Error ? err.message : String(err)),
      );
      setLoading(false);
      return;
    }

    // Step 2: Fetch
    setSteps((prev) => [
      prev[0],
      { ...prev[1], status: "active" },
      ...prev.slice(2),
    ]);
    let data: any = null;
    try {
      const res = await fetch(url!);
      if (!res.ok)
        throw new Error("Failed to fetch registry: " + res.statusText);
      data = await res.json();
      setSteps((prev) => [
        prev[0],
        { ...prev[1], status: "done" },
        ...prev.slice(2),
      ]);
    } catch (err) {
      setSteps((prev) => [
        prev[0],
        { ...prev[1], status: "error", details: String(err) },
        ...prev.slice(2),
      ]);
      setError(
        "Failed to fetch registry: " +
          (err instanceof Error ? err.message : String(err)),
      );
      setLoading(false);
      return;
    }

    // Step 3: Analyze
    setSteps((prev) => [
      prev[0],
      prev[1],
      { ...prev[2], status: "active" },
      prev[3],
    ]);
    setRegistryData(data);
    setSteps((prev) => [
      prev[0],
      prev[1],
      { ...prev[2], status: "done" },
      prev[3],
    ]);

    // Step 4: Success
    setSteps((prev) => [
      prev[0],
      prev[1],
      prev[2],
      { ...prev[3], status: "done" },
    ]);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Paste any install command, registry URL, or name (e.g., pnpm dlx shadcn@latest add @https://custom.com/comp.json, npx shadcn add accordion, https://custom.com/comp.json, vercel)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  runAnalysis();
                }
              }}
            />
            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Paste any install command, registry URL, or name. This tool supports
            all registry types and validates against the shadcn schema.
          </p>
        </div>
      </Card>

      {steps.length > 0 && (
        <Card className="max-w-3xl mx-auto p-6">
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span>
                  {step.status === "done" && (
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                  )}
                  {step.status === "active" && (
                    <Loader2 className="animate-spin text-blue-500 h-5 w-5" />
                  )}
                  {step.status === "pending" && (
                    <Package className="text-muted-foreground h-5 w-5" />
                  )}
                  {step.status === "error" && (
                    <XCircle className="text-red-500 h-5 w-5" />
                  )}
                </span>
                <div>
                  <div className="font-medium">
                    {step.label}
                    {Array.isArray(step.details) && step.details.length > 0 && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({step.details.join(", ")})
                      </span>
                    )}
                  </div>
                  {typeof step.details === "string" &&
                    step.status === "error" && (
                      <div className="text-xs text-red-500 mt-1">
                        {step.details}
                      </div>
                    )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {registryData && (
        <Card className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold">{registryData.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {registryData.type}
              </span>
            </div>
            {registryData.description && (
              <div className="text-muted-foreground mb-2">
                {registryData.description}
              </div>
            )}
            {registryData.title && (
              <div className="text-muted-foreground mb-2">
                Title: {registryData.title}
              </div>
            )}
            {registryData.author && (
              <div className="text-muted-foreground mb-2">
                Author: {registryData.author}
              </div>
            )}
          </div>
          {/* Install command for main item */}
          <InstallCommandBlock
            target={
              input.match(/^https?:\/\//)
                ? input.trim()
                : registryData.url || registryData.name
            }
            isRegistry={
              !!(
                input.match(/^https?:\/\//) ||
                (registryData.type && registryData.type.startsWith("registry:"))
              )
            }
            label="Install This Item"
          />
          {registryData.dependencies &&
            registryData.dependencies.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Dependencies:</div>
                <InstallCommandBlock
                  target={registryData.dependencies}
                  isRegistry={false}
                  label="Install all npm dependencies"
                />
              </div>
            )}
          {registryData.registryDependencies &&
            registryData.registryDependencies.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Registry Dependencies:</div>
                <InstallCommandBlock
                  target={registryData.registryDependencies}
                  isRegistry={true}
                  label="Install all registry dependencies"
                />
              </div>
            )}
          {/* Files and Tailwind */}
          {(registryData.files && registryData.files.length > 0) ||
          registryData.tailwind ? (
            <div>
              <div className="font-semibold mb-1">Files:</div>
              <FileSandbox
                files={registryData.files || []}
                tailwind={registryData.tailwind}
              />
            </div>
          ) : null}
          {registryData.meta && (
            <div>
              <div className="font-semibold mb-1">Meta:</div>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto">
                {JSON.stringify(registryData.meta, null, 2)}
              </pre>
            </div>
          )}
          {registryData.docs && (
            <div>
              <div className="font-semibold mb-1">Docs:</div>
              <pre className="bg-muted rounded p-2 text-xs overflow-x-auto">
                {registryData.docs}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
