import axiosClient from "./axiosClient"

export async function getPayslipDetails(employeeId: string, payrunId: string) {
  const res = await axiosClient.get(`/payslips/${employeeId}/${payrunId}`)
  return res.data
}
