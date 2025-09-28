import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { ProjectsPage } from '@/pages/ProjectPage';
import { ProfessorsPage } from '@/pages/ProfessorsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { ROUTES } from '@/constants/routes';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

export function Router() {
  const path = window.location.pathname;
  if (path.startsWith(ROUTES.professors)) return <ProfessorsPage />;
  if (path.startsWith(ROUTES.students)) return <StudentsPage />;
  if (path.startsWith(ROUTES.people)) return <PeoplePage />;
  if (path.startsWith(ROUTES.projects)) return <ProjectsPage />;
  return <ProjectsPage />; // default
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
    {/*<App />*/}
  </StrictMode>,
)
