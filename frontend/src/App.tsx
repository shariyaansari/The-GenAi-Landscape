import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ToolDetail from "./pages/ToolDetail";
import Compare from "./pages/Compare";
import Trends from "./pages/Trends";
import Insights from "./pages/Insights";
import AppHeader from "./components/AppHeader";

const queryClient = new QueryClient();

const Layout = () => (
  <div className="min-h-screen w-full bg-background">
    <AppHeader />
    <main className="container mx-auto px-4 py-6">
      <Outlet />
    </main>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="tools/:id" element={<ToolDetail />} />
              <Route path="compare" element={<Compare />} />
              <Route path="trends" element={<Trends />} />
              <Route path="insights" element={<Insights />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
