import axiosClient from "./axiosClient"

export const getAllEmployees = async (page = 1, limit = 10) => {
    const res = await axiosClient.get(`/employees?page=${page}&limit=${limit}`)
    return res.data
}

export const addNewEmployee = async (data: any) => {
    const res = await axiosClient.post("/employees", data)
    return res.data
}

export const updateEmployee = async (data: any) => {
    const res = await axiosClient.put(`/employees/${data.id}`, data)
    return res.data
}

export const deleteEmployee = async (id: string) => {
    const res = await axiosClient.delete(`/employees/${id}`)
    return res.data
}
