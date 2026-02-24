import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Platforms from "./pages/Platforms";
import Tools from "./pages/Tools";
import VariableExpenses from "./pages/VariableExpenses";
import Team from "./pages/Team";
import Ads from "./pages/Ads";
import Withdrawals from "./pages/Withdrawals";
import History from "./pages/History";
import Login from "./pages/Login";
import AllowedUsers from "./pages/AllowedUsers";
import AccessLogs from "./pages/AccessLogs";
import Profile from "./pages/Profile";
import Taxes from "./pages/Taxes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/platforms" element={<ProtectedRoute><Platforms /></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
            <Route path="/variable-expenses" element={<ProtectedRoute><VariableExpenses /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
            <Route path="/withdrawals" element={<ProtectedRoute><Withdrawals /></ProtectedRoute>} />
            <Route path="/taxes" element={<ProtectedRoute><Taxes /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Admin routes */}
            <Route path="/allowed-users" element={<ProtectedRoute requireAdmin><AllowedUsers /></ProtectedRoute>} />
            <Route path="/access-logs" element={<ProtectedRoute requireAdmin><AccessLogs /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
