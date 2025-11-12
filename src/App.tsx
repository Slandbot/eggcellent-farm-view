import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { UserRoleProvider, useUserRole } from "@/contexts/UserRoleContext";
import { authService } from "@/services/authService";
import { AuthPage } from "@/components/auth/AuthPage";
import AuthErrorHandler from "@/components/AuthErrorHandler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useUserRole();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const hasStoredUser = !!authService.getCurrentUser();

  // NEVER show loading screen when not authenticated - always show login page
  // This prevents white screen during login process
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // Only show loading screen during initial app load when authenticated but still loading
  // This should rarely happen, but handle it gracefully
  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login route - accessible when not authenticated */}
      <Route path="/login" element={<AuthPage />} />
      
      {/* Protected routes - require authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/" element={
            <ProtectedRoute requiredPage="/">
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/birds" element={
            <ProtectedRoute requiredPage="/birds">
              <BirdsManagement />
            </ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute requiredPage="/feed">
              <FeedInventory />
            </ProtectedRoute>
          } />
          <Route path="/eggs" element={
            <ProtectedRoute requiredPage="/eggs">
              <EggCollection />
            </ProtectedRoute>
          } />
          <Route path="/medicine" element={
            <ProtectedRoute requiredPage="/medicine">
              <Medicine />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredPage="/reports">
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute requiredPage="/reports">
              <Statistics />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredPage="/users" requiredPermission="manage_users">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredPage="/profile">
              <Profile />
            </ProtectedRoute>
          } />
        </>
      ) : (
        // Redirect all routes to login when not authenticated
        <Route path="*" element={<AuthPage />} />
      )}
      
      {/* Catch-all for authenticated users */}
      {isAuthenticated && <Route path="*" element={<NotFound />} />}
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
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
  </ErrorBoundary>
);

export default App;
