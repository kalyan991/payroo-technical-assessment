import axiosClient from "./axiosClient"

export const loginUser = async (email: string, password: string) => {
    const res = await axiosClient.post("/auth/login", { email, password })
    return res.data
}

export const logoutUser = async () => {
    try {
        const res = await axiosClient.post("/auth/logout", {})
        sessionStorage.removeItem("token")
        return res.data
    } catch (err: any) {
        console.error("Logout failed:", err)
        throw err
    }
}

export const getCurrentUser = async () => {
    const res = await axiosClient.get("/auth/me")
    return res.data
}
