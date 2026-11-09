import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

const AdminApp = lazy(() => import('@/admin/AdminApp'));

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-ink" />}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
