import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { ProjectsPage } from '@/pages/ProjectPage';
import { ProfessorsPage } from '@/pages/ProfessorsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { PeoplePage } from '@/pages/PeoplePage';
import { CareersPage } from '@/pages/CareersPage';
import { ApplicationDomainsPage } from '@/pages/ApplicationDomainsPage';
import { TagsPage } from '@/pages/TagsPage';
import { ROUTES } from '@/constants/routes';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackupPage } from '@/pages/BackupPage';
import { ImportDataPage } from '@/pages/ImportDataPage';
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

export function Router() {
  const path = window.location.pathname;
  if (path.startsWith(ROUTES.backup)) return <BackupPage />;
  if (path.startsWith(ROUTES.importData)) return <ImportDataPage />;
  if (path.startsWith(ROUTES.careers)) return <CareersPage />;
  if (path.startsWith(ROUTES.applicationDomains)) return <ApplicationDomainsPage />;
  if (path.startsWith(ROUTES.tags)) return <TagsPage />;
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
      <Toaster position="top-right" richColors expand={false} closeButton />
    </QueryClientProvider>
    {/*<App />*/}
  </StrictMode>,
)
