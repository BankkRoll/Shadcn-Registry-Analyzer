"use client";

import {
  ChevronRight,
  File as FileIcon,
  Folder as FolderClosed,
  FolderOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import TreeView from "react-accessible-treeview";
import { ScrollArea } from "./ui/scroll-area";

interface FileTreeProps {
  files: Array<{ path: string; content: string; type?: string }>;
  selectedPath: string;
  onSelect: (path: string) => void;
}

// Convert flat file list to tree nodes for react-accessible-treeview
function buildTree(files: FileTreeProps["files"]): any[] {
  const root: any = { name: "root", children: [] };
  for (const file of files) {
    const parts = file.path.split("/");
    let curr = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let child = curr.children.find((c: any) => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: i === parts.length - 1 ? "file" : "folder",
          children: [],
        };
        curr.children.push(child);
      }
      curr = child;
    }
  }
  return root.children;
}

function flattenForTreeView(nodes: any[], parentId = "root", level = 1): any[] {
  let result: any[] = [];
  nodes.forEach((node, idx) => {
    const id = node.path;
    result.push({
      id,
      name: node.name,
      parent: parentId,
      children: node.children?.map((c: any) => c.path) || [],
      isBranch: node.type === "folder",
      metadata: { path: node.path, type: node.type },
      level,
    });
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenForTreeView(node.children, id, level + 1));
    }
  });
  return result;
}

export function FileTree({ files, selectedPath, onSelect }: FileTreeProps) {
  const treeData = useMemo(() => buildTree(files), [files]);
  const flatData = useMemo(() => flattenForTreeView(treeData), [treeData]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Expand all folders by default
  useEffect(() => {
    setExpandedIds(flatData.filter((n) => n.isBranch).map((n) => n.id));
  }, [flatData]);

  // Find selected node id
  const selectedId = flatData.find((n) => n.metadata.path === selectedPath)?.id;

  // Wrap in a single root node for TreeView
  const rootNode = useMemo(
    () => ({
      id: "root",
      name: "root",
      parent: null,
      children: flatData.filter((n) => n.parent === "root").map((n) => n.id),
      isBranch: true,
      metadata: {},
      level: 0,
    }),
    [flatData],
  );
  const treeViewData = useMemo(
    () => [rootNode, ...flatData],
    [rootNode, flatData],
  );

  return (
    <nav className="w-56 border-r h-full text-xs">
      <ScrollArea className="h-full">
        <TreeView
          data={treeViewData}
          aria-label="file browser"
          defaultExpandedIds={treeViewData
            .filter((n) => n.isBranch)
            .map((n) => n.id)}
          selectedIds={selectedId ? [selectedId] : []}
          onNodeSelect={({ element }) => {
            if (element?.metadata?.type === "file" && element?.metadata?.path) {
              onSelect(element.metadata.path as string);
            }
          }}
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            level,
            isSelected,
          }) => {
            // Hide the root node visually
            if (element.id === "root") return null;
            return (
              <div
                {...getNodeProps()}
                className={`group relative flex items-center gap-1.5 h-6 cursor-pointer select-none rounded-sm transition-colors px-2
                ${isSelected ? "bg-accent text-accent-foreground ring-1 ring-accent" : "hover:bg-muted"}`}
                style={{ paddingLeft: 8 + (level - 2) * 16 }}
                data-level={level}
              >
                {/* Chevron for folders */}
                {isBranch ? (
                  <ChevronRight
                    className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} text-muted-foreground`}
                    size={14}
                    strokeWidth={1.5}
                  />
                ) : (
                  <span className="w-[14px]" />
                )}
                {/* Folder/file icon */}
                {isBranch ? (
                  isExpanded ? (
                    <FolderOpen size={14} className="text-yellow-500" />
                  ) : (
                    <FolderClosed size={14} className="text-yellow-500" />
                  )
                ) : (
                  <FileIcon size={13} className="text-blue-400" />
                )}
                <span className="truncate font-mono text-xs">
                  {element.name}
                </span>
              </div>
            );
          }}
        />
      </ScrollArea>
    </nav>
  );
}
