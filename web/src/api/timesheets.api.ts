import axiosClient from "./axiosClient"

export const getAllTimesheets = async (page = 1, limit = 10) => {
  const res = await axiosClient.get(`/timesheets?page=${page}&limit=${limit}`)
  return res.data
}

export const createTimesheet = async (data: any) => {
  const res = await axiosClient.post("/timesheets", data)
  return res.data
}

export const updateTimesheet = async (id: string, data: any) => {
  const res = await axiosClient.put(`/timesheets/${id}`, data)
  return res.data
}

export const deleteTimesheet = async (id: string) => {
  const res = await axiosClient.delete(`/timesheets/${id}`)
  return res.data
}
