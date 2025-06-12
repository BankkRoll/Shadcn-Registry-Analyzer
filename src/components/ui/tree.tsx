"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  onClick?: () => void;
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="tree"
        className={cn("space-y-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Tree.displayName = "Tree";

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      label,
      description,
      children,
      defaultExpanded = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const hasChildren = React.Children.count(children) > 0;

    const handleClick = () => {
      if (hasChildren) {
        setExpanded(!expanded);
      }
      onClick?.();
    };

    return (
      <div
        ref={ref}
        role="treeitem"
        className={cn("select-none", className)}
        {...props}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
            "hover:bg-accent hover:text-accent-foreground",
            "cursor-pointer",
          )}
          onClick={handleClick}
        >
          {hasChildren && (
            <span className="flex h-4 w-4 items-center justify-center">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}
          <div className="flex flex-col">
            <span>{label}</span>
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </div>
        {hasChildren && expanded && (
          <div className="ml-4 mt-1 space-y-1 border-l pl-4">{children}</div>
        )}
      </div>
    );
  },
);
TreeItem.displayName = "TreeItem";

export { Tree, TreeItem };
