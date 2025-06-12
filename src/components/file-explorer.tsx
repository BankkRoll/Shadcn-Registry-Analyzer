"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidePanel } from "@/components/ui/side-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tree, TreeItem } from "@/components/ui/tree";
import { Copy } from "lucide-react";
import { useState } from "react";
import { CodeViewer } from "./code-viewer";

interface File {
  path: string;
  type: string;
  content?: string;
}

interface FileExplorerProps {
  files: File[];
}

// Map file extensions to display types
const FILE_TYPE_MAP: Record<string, string> = {
  // TypeScript/JavaScript
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  // Styles
  css: "CSS",
  scss: "SCSS",
  sass: "SASS",
  less: "LESS",
  styl: "Stylus",
  pcss: "PostCSS",
  // Markup
  html: "HTML",
  htm: "HTML",
  md: "Markdown",
  mdx: "MDX",
  // Data
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  // Config
  env: "Environment",
  config: "Config",
  // Other
  txt: "Text",
  sh: "Shell",
  bash: "Shell",
  zsh: "Shell",
  // Registry specific
  registry: "Registry",
};

function getFileType(path: string, type?: string): string {
  // First try to get type from registry type
  if (type && type.startsWith("registry:")) {
    return (
      type.replace("registry:", "").charAt(0).toUpperCase() + type.slice(9)
    );
  }

  // Then try to get from extension
  const extension = path.split(".").pop()?.toLowerCase();
  if (extension && FILE_TYPE_MAP[extension]) {
    return FILE_TYPE_MAP[extension];
  }

  return "File";
}

export function FileExplorer({ files }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Group files by type
  const filesByType = files.reduce(
    (acc, file) => {
      const type = getFileType(file.path, file.type);
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(file);
      return acc;
    },
    {} as Record<string, File[]>,
  );

  const filteredFiles = Object.entries(filesByType).reduce(
    (acc, [type, typeFiles]) => {
      acc[type] = typeFiles.filter((file) =>
        file.path.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return acc;
    },
    {} as Record<string, File[]>,
  );

  const renderFileTree = (type: string, files: File[]) => {
    return files.map((file) => (
      <TreeItem
        key={file.path}
        label={file.path.split("/").pop() || file.path}
        description={
          <div className="flex items-center gap-2">
            <Badge variant="outline">{type}</Badge>
          </div>
        }
        onClick={() => {
          setSelectedFile(file);
          setPanelOpen(true);
        }}
      />
    ));
  };

  return (
    <Card className="w-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Files</Label>
            <Input
              id="search"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const allFiles = files.map((f) => f.path).join("\n");
              navigator.clipboard.writeText(allFiles);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Paths
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-6">
          {Object.entries(filteredFiles).map(
            ([type, typeFiles]) =>
              typeFiles.length > 0 && (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-4">{type}</h3>
                  <Tree>{renderFileTree(type, typeFiles)}</Tree>
                </div>
              ),
          )}
        </div>
      </div>

      <SidePanel
        open={panelOpen && !!selectedFile}
        onClose={() => setPanelOpen(false)}
        title={selectedFile?.path.split("/").pop() || selectedFile?.path}
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {getFileType(selectedFile.path, selectedFile.type)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedFile.path);
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Path
              </Button>
              {selectedFile.content && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.content!);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Content
                </Button>
              )}
            </div>
            {selectedFile.content && (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="import">Import</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <CodeViewer
                    initialCode={selectedFile.content}
                    initialLanguage={selectedFile.path}
                  />
                </TabsContent>
                <TabsContent value="import">
                  <CodeViewer
                    initialCode={`import { ${selectedFile.path
                      .split("/")
                      .pop()
                      ?.replace(
                        /\.[^/.]+$/,
                        "",
                      )} } from "@/components/${selectedFile.path}"`}
                    initialLanguage="typescript"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </SidePanel>
    </Card>
  );
}
