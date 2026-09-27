import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout for internal platform tools
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
// Pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { EnhancePage } from './pages/EnhancePage';
import { GalleryPage } from './pages/GalleryPage';
import { UseCasesPage } from './pages/UseCasesPage';
import { AboutPage } from './pages/AboutPage';

// Wrapper for platform tool pages
const PlatformLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background bg-earth-decor text-foreground font-sans selection:bg-primary/15 selection:text-foreground relative">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10 pt-[var(--nav-height)]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* ── Flagship TerraSR Landing Page with 3D WebGL Earth ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Platform Tool Pages ── */}
        <Route
          path="/platform"
          element={
            <PlatformLayout>
              <EnhancePage />
            </PlatformLayout>
          }
        />
        <Route
          path="/enhance"
          element={
            <PlatformLayout>
              <EnhancePage />
            </PlatformLayout>
          }
        />

        <Route
          path="/use-cases"
          element={
            <PlatformLayout>
              <UseCasesPage />
            </PlatformLayout>
          }
        />
        <Route
          path="/gallery"
          element={
            <PlatformLayout>
              <GalleryPage />
            </PlatformLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PlatformLayout>
              <AboutPage />
            </PlatformLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PlatformLayout>
              <HomePage />
            </PlatformLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
