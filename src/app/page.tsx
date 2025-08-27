import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { RevOpsAnalyzer } from '@/components/revops-analyzer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <RevOpsAnalyzer />
      </main>
      <Footer />
    </div>
  );
}
