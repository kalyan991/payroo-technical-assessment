import QueryProvider from "./context/QueryProvider"
import AppRoutes from "./routes/AppRoutes"
import HeaderBar from "./components/Header"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <HeaderBar />
          <div className="flex-1 p-6">
            <AppRoutes />
          </div>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        </div>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
