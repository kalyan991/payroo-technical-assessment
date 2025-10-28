import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { loginUser } from "../api/auth.api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (token) navigate("/employees")
  }, [navigate])

  const { mutate: doLogin, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      if (data?.token) {
        sessionStorage.setItem("token", data.token)
        navigate("/employees")
      } else {
        setError("Invalid response from server")
      }
    },
    onError: (err: any) => {
      console.error(err)
      setError(err.response?.data?.error || "Login failed")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    doLogin({ email, password })
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 overflow-hidden">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md px-8 py-10 border border-gray-100">
        <h1 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          Payroo
        </h1>
        <h2 className="text-lg font-semibold text-center mb-2">Login</h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-2 rounded-md text-white text-sm font-medium transition ${isPending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
