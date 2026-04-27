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
import MockInterviewHome from "./pages/MockInterviewHome";
import MockInterviewSession from "./pages/MockInterviewSession";
import MockInterviewResult from "./pages/MockInterviewResult";

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
        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <MockInterviewHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-interview/session/:sessionId"
          element={
            <ProtectedRoute>
              <MockInterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-interview/result/:sessionId"
          element={
            <ProtectedRoute>
              <MockInterviewResult />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
