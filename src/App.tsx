import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import CaptainRoute from "@/components/auth/CaptainRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import SportsProfile from "./pages/SportsProfile";
import Matches from "./pages/Matches";

import Fitness from "./pages/Fitness";
import Leaderboard from "./pages/Leaderboard";
import SportAssessment from "./pages/SportAssessment";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Archives from "./pages/Archives";
import SportsInterests from "./pages/SportsInterests";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import SportsBuddy from "./pages/SportsBuddy";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSeasons from "./pages/admin/AdminSeasons";
import AdminSports from "./pages/admin/AdminSports";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminHizb from "./pages/admin/AdminHizb";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminProficiency from "./pages/admin/AdminProficiency";
import AdminCompetition from "./pages/admin/AdminCompetition";
import AdminResultsEntry from "./pages/admin/AdminResultsEntry";
import AdminTalentIdentification from "./pages/admin/AdminTalentIdentification";
import AdminClubs from "./pages/admin/AdminClubs";
import CaptainSelection from "./pages/captain/CaptainSelection";
import AdminCertifications from "./pages/admin/AdminCertifications";
import CertificateView from "./pages/CertificateView";
import MyCertificates from "./pages/MyCertificates";
import HallOfAthletes from "./pages/HallOfAthletes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<SportsProfile />} />
              <Route path="/matches" element={<Matches />} />
              
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/assessment" element={<SportAssessment />} />
              <Route path="/archives" element={<Archives />} />
              <Route path="/interests" element={<SportsInterests />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:clubId" element={<ClubDetail />} />
              <Route path="/sports-buddy" element={<SportsBuddy />} />
              <Route path="/my-certificates" element={<MyCertificates />} />
              <Route path="/hall-of-athletes" element={<HallOfAthletes />} />
            </Route>
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/seasons" element={<AdminSeasons />} />
              <Route path="/admin/sports" element={<AdminSports />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/hizb" element={<AdminHizb />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/proficiency" element={<AdminProficiency />} />
              <Route path="/admin/competition" element={<AdminCompetition />} />
              <Route path="/admin/results-entry" element={<AdminResultsEntry />} />
              <Route path="/admin/talent" element={<AdminTalentIdentification />} />
              <Route path="/admin/clubs" element={<AdminClubs />} />
              <Route path="/admin/certifications" element={<AdminCertifications />} />
            </Route>
            <Route
              path="/captain/selection"
              element={
                <CaptainRoute>
                  <div className="min-h-screen bg-background">
                    <main className="max-w-5xl mx-auto p-4 md:p-6">
                      <CaptainSelection />
                    </main>
                  </div>
                </CaptainRoute>
              }
            />
            <Route path="/certificates/:id" element={
              <ProtectedRoute><div className="min-h-screen bg-background"><CertificateView /></div></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
