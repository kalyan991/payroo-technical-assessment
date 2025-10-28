import axiosClient from "./axiosClient"

export async function getAllPayruns() {
  const res = await axiosClient.get("/payruns")
  return res.data
}

export async function createPayrun(data: any) {
  const res = await axiosClient.post("/payruns", data)
  return res.data
}

export async function getPayrunById(id: string) {
  const res = await axiosClient.get(`/payruns/${id}`)
  return res.data
}