import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import HelpCenter from "@/pages/HelpCenter";
import StudentsPage from "@/pages/StudentsPage";
import StudentDashboardPage from "@/pages/StudentDashboardPage";

/**
 * Componente de rotas da aplicação
 * Contém todas as páginas do sistema
 */
function Router() {
  return (
    <Switch>
      {/* Página principal do sistema */}
      <Route path="/" component={HomePage} />
      
      {/* Páginas auxiliares */}
      <Route path="/help" component={HelpCenter} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/students/:id" component={StudentDashboardPage} />
      
      {/* Rota padrão para 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Componente principal da aplicação
 * Inicializa os providers e o router
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
