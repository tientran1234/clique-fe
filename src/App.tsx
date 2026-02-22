import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import ProfileList from "./pages/ProfileList";
import ProfileForm from "./pages/ProfileForm";
import LikePage from "./pages/LikePage";
import MatchesPage from "./pages/MatchesPage";
import SchedulingPage from "./pages/SchedulingPage";
import { Button } from "./components/ui/button";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <nav className="border-b">
            <div className="container mx-auto p-4 flex gap-4">
              <Link to="/profiles">
                <Button variant="ghost">Profiles</Button>
              </Link>
              <Link to="/like">
                <Button variant="ghost">Find People</Button>
              </Link>
              <Link to="/matches">
                <Button variant="ghost">Matches</Button>
              </Link>
              <Link to="/profiles/create">
                <Button variant="ghost">Create Profile</Button>
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<Navigate to="/profiles" replace />} />
            <Route path="/profiles" element={<ProfileList />} />
            <Route path="/profiles/create" element={<ProfileForm />} />
            <Route path="/profiles/edit/:id" element={<ProfileForm />} />
            <Route path="/like" element={<LikePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/scheduling/:matchId" element={<SchedulingPage />} />
          </Routes>
        </div>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
