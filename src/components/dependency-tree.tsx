"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidePanel } from "@/components/ui/side-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tree, TreeItem } from "@/components/ui/tree";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { CodeViewer } from "./code-viewer";
import { InstallCommandBlock } from "./install-command-block";

interface Dependency {
  name: string;
  version?: string;
  type: "npm" | "registry";
  dependencies?: Dependency[];
}

interface DependencyTreeProps {
  dependencies: string[];
  registryDependencies: string[];
}

export function DependencyTree({
  dependencies,
  registryDependencies,
}: DependencyTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDep, setSelectedDep] = useState<Dependency | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Transform flat dependencies into tree structure
  const buildDependencyTree = (
    deps: string[],
    type: "npm" | "registry",
  ): Dependency[] => {
    return deps.map((dep) => ({
      name: dep,
      type,
      version: "latest", // In a real app, we'd fetch actual versions
      dependencies: [], // In a real app, we'd fetch nested dependencies
    }));
  };

  const npmDeps = buildDependencyTree(dependencies, "npm");
  const registryDeps = buildDependencyTree(registryDependencies, "registry");

  const filteredDeps = {
    npm: npmDeps.filter((dep) =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    registry: registryDeps.filter((dep) =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  };

  const getInstallCommand = (dep: Dependency) => {
    return dep.type === "npm"
      ? `npm install ${dep.name}`
      : `npx shadcn add https://date-time-range-picker.vercel.app/r/${dep.name}.json`;
  };

  const renderDependencyTree = (deps: Dependency[]) => {
    return deps.map((dep) => (
      <TreeItem
        key={dep.name}
        label={dep.name}
        description={
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dep.type}</Badge>
            {dep.version && <Badge variant="secondary">{dep.version}</Badge>}
          </div>
        }
        onClick={() => {
          setSelectedDep(dep);
          setPanelOpen(true);
        }}
      >
        {dep.dependencies && dep.dependencies.length > 0 && (
          <div className="ml-4 mt-1 space-y-1 border-l pl-4">
            {renderDependencyTree(dep.dependencies)}
          </div>
        )}
      </TreeItem>
    ));
  };

  return (
    <Card className="w-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Dependencies</Label>
            <Input
              id="search"
              placeholder="Search dependencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const allDeps = [...dependencies, ...registryDependencies];
              navigator.clipboard.writeText(allDeps.join("\n"));
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="space-y-6">
          {filteredDeps.npm.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">NPM Dependencies</h3>
              <Tree>{renderDependencyTree(filteredDeps.npm)}</Tree>
            </div>
          )}

          {filteredDeps.registry.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Registry Dependencies
              </h3>
              <Tree>{renderDependencyTree(filteredDeps.registry)}</Tree>
            </div>
          )}
        </div>
      </div>

      <SidePanel
        open={panelOpen && !!selectedDep}
        onClose={() => setPanelOpen(false)}
        title={selectedDep?.name}
      >
        {selectedDep && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{selectedDep.type}</Badge>
              {selectedDep.version && (
                <Badge variant="secondary">{selectedDep.version}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    selectedDep.type === "npm"
                      ? `https://www.npmjs.com/package/${selectedDep.name}`
                      : `https://ui.shadcn.com/docs/components/${selectedDep.name}`,
                    "_blank",
                  );
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
            <InstallCommandBlock
              target={selectedDep.name}
              isRegistry={selectedDep.type === "registry"}
              label={`Install ${selectedDep.name}`}
            />
            <Tabs defaultValue="package.json">
              <TabsList>
                <TabsTrigger value="package.json">package.json</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
              </TabsList>
              <TabsContent value="package.json">
                <CodeViewer
                  initialCode={JSON.stringify(
                    {
                      dependencies: {
                        [selectedDep.name]: selectedDep.version || "latest",
                      },
                    },
                    null,
                    2,
                  )}
                  initialLanguage="json"
                />
              </TabsContent>
              <TabsContent value="import">
                <CodeViewer
                  initialCode={`import { ${selectedDep.name} } from "${
                    selectedDep.type === "npm"
                      ? selectedDep.name
                      : "@/components/ui"
                  }"`}
                  initialLanguage="typescript"
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SidePanel>
    </Card>
  );
}
