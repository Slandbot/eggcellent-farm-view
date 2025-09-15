import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserRoleProvider, useUserRole } from "@/contexts/UserRoleContext";
import { AuthPage } from "@/components/auth/AuthPage";
import AuthErrorHandler from "@/components/AuthErrorHandler";
import Index from "./pages/Index";
import BirdsManagement from "./pages/BirdsManagement";
import FeedInventory from "./pages/FeedInventory";
import EggCollection from "./pages/EggCollection";
import Medicine from "./pages/Medicine";
import Reports from "./pages/Reports";
import Statistics from "./pages/Statistics";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/birds" element={<BirdsManagement />} />
      <Route path="/feed" element={<FeedInventory />} />
      <Route path="/eggs" element={<EggCollection />} />
      <Route path="/medicine" element={<Medicine />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/profile" element={<Profile />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserRoleProvider>
        <TooltipProvider>
          <AuthErrorHandler />
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </UserRoleProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
