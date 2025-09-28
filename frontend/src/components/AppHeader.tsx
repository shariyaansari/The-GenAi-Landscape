import { NavLink } from "react-router-dom";
// 1. Import the necessary icons, including a new one for the Consultant
import { Sparkles, LineChart, GitCompareArrows, Lightbulb, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium border-b-2 flex items-center ${
    isActive
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
  }`;


export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-primary/90 flex items-center justify-center">
               <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="font-inter font-bold tracking-tight">Gen AI Landscape</span>
          </NavLink>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkCls}>
            {/* 2. Using a more semantic icon for the dashboard */}
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/trends" className={navLinkCls}>
            <LineChart className="mr-2 h-4 w-4" /> Trends
          </NavLink>
          <NavLink to="/compare" className={navLinkCls}>
            <GitCompareArrows className="mr-2 h-4 w-4" /> Compare
          </NavLink>
          <NavLink to="/insights" className={navLinkCls}>
            <Lightbulb className="mr-2 h-4 w-4" /> Insights
          </NavLink>
          {/* 3. THIS IS THE NEW LINK FOR YOUR CONSULTANT PAGE */}
          <NavLink to="/consultant" className={navLinkCls}>
            <Sparkles className="mr-2 h-4 w-4" /> Consultant
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <NavLink to="/trends">
            <Button variant="secondary" size="sm">Discover</Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
