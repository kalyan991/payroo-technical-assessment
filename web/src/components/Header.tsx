import { Link, useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { logoutUser } from "../api/auth.api"
import { useEffect, useState } from "react"

export default function HeaderBar() {
    const location = useLocation()
    if (location.pathname === "/login") return null
    const navigate = useNavigate()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = sessionStorage.getItem("token")
        setIsLoggedIn(!!token)
    }, [location.pathname]) // re-check on route change

    const { mutate: doLogout, isPending } = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            setIsLoggedIn(false)
            navigate("/login")
        },
        onError: (err) => {
            console.error("Logout failed:", err)
            setIsLoggedIn(false)
            navigate("/login")
        },
    })

    const handleLogout = () => {
        doLogout()
    }

    const menuItemClass = (path: string) =>
        `px-3 py-2 rounded-md text-sm font-medium ${location.pathname === path
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-blue-50"
        }`

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
                <div
                    onClick={() => navigate("/employees")}
                    className="text-xl font-semibold text-blue-700 cursor-pointer"
                >
                    Payroo
                </div>

                <div className="flex gap-2 items-center">
                    <Link className={menuItemClass("/employees")} to="/employees">
                        Employees
                    </Link>
                    <Link className={menuItemClass("/timesheets")} to="/timesheets">
                        Timesheets
                    </Link>
                    <Link className={menuItemClass("/payruns")} to="/payruns">
                        Payruns
                    </Link>

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            disabled={isPending}
                            className={`ml-4 px-3 py-2 rounded-md text-sm font-medium ${isPending
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                                }`}
                        >
                            {isPending ? "Logging out..." : "Logout"}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
