import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllEmployees, deleteEmployee } from "../api/employees.api"
import { Pencil, Trash2, Plus } from "lucide-react"
import toast from "react-hot-toast"
import EmployeeModal from "../components/AddEmployeeModal"

export default function EmployeesPage() {
  const [showModal, setShowModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState<any | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["employeesList", page],
    queryFn: () => getAllEmployees(page, limit),
    placeholderData: (previousData: any) => previousData,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeesList"] })
      toast.success("Employee deleted successfully")
    },
    onError: () => toast.error("Failed to delete employee"),
  })

  const handleDelete = (id: string) => deleteMutation.mutate(id)

  const handleEditClick = (emp: any) => {
    setEditEmployee(emp)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditEmployee(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Employees</h1>
        <button
          onClick={() => {
            setEditEmployee(null)
            setShowModal(true)
          }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading employees...</div>
      ) : data?.data?.length === 0 ? (
        <div className="text-gray-500 text-sm">No employees found</div>
      ) : (
        <>
          <table className="w-full bg-white rounded-md shadow border border-gray-100">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Hourly Rate</th>
                <th className="p-2 text-left">Super Rate</th>
                <th className="p-2 text-left">Bank</th>
                <th className="p-2 text-left">Stripe Account Id</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((e: any) => (
                <tr key={e.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2">
                    {e.firstName} {e.lastName}
                  </td>
                  <td className="p-2">${e.baseHourlyRate}</td>
                  <td className="p-2">{(e.superRate * 100).toFixed(1)}%</td>
                  <td className="p-2">
                    {e.bankBsb} / {e.bankAccount}
                  </td>
                  <td className="p-2">
                    {e.stripeAccountId}
                  </td>
                  <td className="p-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(e)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-4 gap-3 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {data?.page} of {data?.totalPages}
            </span>

            <button
              disabled={page === data?.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <EmployeeModal
          onClose={handleCloseModal}
          editData={editEmployee}
        />
      )}
    </div>
  )
}
