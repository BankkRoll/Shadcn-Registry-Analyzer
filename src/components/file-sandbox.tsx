"use client";

import { useState } from "react";
import { FilePreview } from "./file-preview";
import { FileTree } from "./file-tree";

export interface FileSandboxProps {
  files: Array<{ path: string; content: string; type?: string }>;
  tailwind?: any;
}

export function FileSandbox({ files, tailwind }: FileSandboxProps) {
  const [selectedPath, setSelectedPath] = useState(files[0]?.path || "");

  // Combine files and tailwind into a single list for the tree
  const allFiles = [
    ...files,
    ...(tailwind
      ? [
          {
            path: "tailwind.config.js",
            content: JSON.stringify(tailwind, null, 2),
            type: "tailwind",
          },
        ]
      : []),
  ];

  return (
    <div className="flex w-full h-[800px] border rounded overflow-hidden">
      <FileTree
        files={allFiles}
        selectedPath={selectedPath}
        onSelect={setSelectedPath}
      />
      <div className="flex-1 bg-muted p-0">
        <FilePreview file={allFiles.find((f) => f.path === selectedPath)} />
      </div>
    </div>
  );
}
