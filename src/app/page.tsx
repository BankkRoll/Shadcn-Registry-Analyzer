import { RegistryAnalyzer } from "@/components/registry-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Shadcn Registry Analyzer
            </h1>
            <p className="text-xl text-muted-foreground">
              Analyze and explore shadcn/ui components with advanced tools and
              live previews
            </p>
          </div>
          <RegistryAnalyzer />
        </div>
      </div>
    </main>
  );
}
