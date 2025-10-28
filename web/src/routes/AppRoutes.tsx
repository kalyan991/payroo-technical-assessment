import { Routes, Route, Navigate } from "react-router-dom"
import EmployeesPage from "../pages/EmployeesPage"
import TimesheetsPage from "../pages/TimesheetsPage"
import PayrunSummaryPage from "../pages/PayrunSummaryPage"
import PayslipDetailPage from "../pages/PayslipDetailPage"
import LoginPage from "../pages/LoginPage"
import ProtectedRoute from "../components/ProtectedRoute"

export default function AppRoutes() {
  const isLoggedIn = !!sessionStorage.getItem("token")

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<Navigate to="/employees" />} />

      <Route path="/employees" element={
        <ProtectedRoute>
          <EmployeesPage />
        </ProtectedRoute>
      }
      />
      <Route path="/timesheets" element={
        <ProtectedRoute>
          <TimesheetsPage />
        </ProtectedRoute>
      }
      />
      <Route path="/payruns" element={
        <ProtectedRoute>
          <PayrunSummaryPage />
        </ProtectedRoute>
      }
      />
      <Route path="/payslips/:employeeId/:payrunId" element={
        <ProtectedRoute>
          <PayslipDetailPage />
        </ProtectedRoute>
      }
      />

      <Route path="*" element={
        isLoggedIn ? (
          <Navigate to="/employees" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      }
      />
    </Routes>
  )
}
