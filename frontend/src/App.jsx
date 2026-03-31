import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getMe } from "./store/auth.slice";
import AuthPage from "./pages/AuthPage";
import CreateReportPage from "./pages/CreateReportPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ReportDetailPage from "./pages/ReportDetailPage";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <ProtectedRoute>
              <CreateReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <ProtectedRoute>
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
