
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginScreen from "./components/LoginScreen";

const queryClient = new QueryClient();

// ─── Режим разработки: true = кнопка "Войти без авторизации" видна ───────────
const DEV_MODE = true;

// ─── Показывать экран входа: false = МИС открывается сразу ──────────────────
const AUTH_ENABLED = false;

const App = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(
    AUTH_ENABLED ? null : { name: "Администратор", role: "admin" }
  );

  if (AUTH_ENABLED && !user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LoginScreen onLogin={setUser} devMode={DEV_MODE} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index user={user} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;