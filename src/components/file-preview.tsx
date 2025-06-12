"use client";

import { CodeViewer } from "./code-viewer";

export function FilePreview({
  file,
}: {
  file?: { path: string; content: string; type?: string };
}) {
  if (!file)
    return <div className="p-4 text-muted-foreground">No file selected</div>;
  return (
    <div className="h-full w-full">
      <CodeViewer initialCode={file.content} initialLanguage={file.path} />
    </div>
  );
}
