import React from 'react'
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const token = sessionStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
