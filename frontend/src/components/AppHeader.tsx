import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // <-- Import your auth context
import { Sparkles, LineChart, GitCompareArrows, Lightbulb, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium border-b-2 flex items-center ${
    isActive
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
  }`;


export const AppHeader = () => {
  const { isLoggedIn, logout } = useAuth(); // <-- Get auth state and logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

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
          {isLoggedIn ? (
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <NavLink to="/login">
              <Button variant="secondary" size="sm">Login</Button>
            </NavLink>
          )}
          <NavLink to="/trends">
            <Button variant="secondary" size="sm">Discover</Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
