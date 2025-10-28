import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllTimesheets, deleteTimesheet } from "../api/timesheets.api"
import TimesheetModal from "../components/TimesheetModal"
import TimesheetDetailsModal from "../components/TimesheetDetailsModal"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatInTimeZone } from "date-fns-tz"

export default function TimesheetsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedTimesheet, setSelectedTimesheet] = useState<any | null>(null)
  const [editTimesheet, setEditTimesheet] = useState<any | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["timesheetsList", page],
    queryFn: () => getAllTimesheets(page, limit),
    placeholderData: (previousData: any) => previousData,
  })

  const timesheets = data?.data || []
  const totalPages = data?.totalPages || 1

  const deleteMutation = useMutation({
    mutationFn: deleteTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheetsList"] })
      toast.success("Timesheet deleted successfully")
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err.message || "Failed to delete timesheet"
      toast.error(msg)
    },
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Timesheets</h1>
        <button
          onClick={() => {
            setEditTimesheet(null)
            setShowModal(true)
          }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} /> Add Timesheet
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading timesheets...</div>
      ) : !timesheets.length ? (
        <div className="text-gray-500 text-sm">No timesheets yet</div>
      ) : (
        <>
          <table className="w-full bg-white rounded-md shadow border border-gray-100">
            <thead className="bg-gray-100 text-gray-700 text-sm">
              <tr>
                <th className="p-2 text-left">Employee</th>
                <th className="p-2 text-left">Period</th>
                <th className="p-2 text-left">Entries</th>
                <th className="p-2 text-left">Allowances</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((t: any) => (
                <tr key={t.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="p-2">
                    {t.employee?.firstName} {t.employee?.lastName}
                  </td>
                  <td className="p-2">
                    {formatInTimeZone(new Date(t.periodStart), 'Australia/Melbourne', 'dd MMM yyyy')} –{" "}
                    {formatInTimeZone(new Date(t.periodEnd), 'Australia/Melbourne', 'dd MMM yyyy')}
                  </td>
                  <td className="p-2">{t.entries?.length || 0}</td>
                  <td className="p-2">${t.allowances?.toFixed(2) || 0}</td>

                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${t.status === "UNPROCESSED"
                        ? "bg-yellow-100 text-yellow-700"
                        : t.status === "PROCESSED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                        }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-2 text-center">
                    <div className="flex justify-center gap-3">

                      <div className="relative group inline-block">
                        <button
                          onClick={() => {
                            if (t.status === "UNPROCESSED") {
                              setEditTimesheet(t)
                              setShowModal(true)
                            }
                          }}
                          disabled={t.status !== "UNPROCESSED"}
                          className={`${t.status === "UNPROCESSED"
                            ? "text-green-600 hover:text-green-800"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          <Pencil size={16} />
                        </button>

                        {t.status !== "UNPROCESSED" && (
                          <span className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            Timesheet already processed
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedTimesheet(t)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <TimesheetModal
          onClose={() => {
            setShowModal(false)
            setEditTimesheet(null)
          }}
          editData={editTimesheet}
        />
      )}

      {selectedTimesheet && (
        <TimesheetDetailsModal
          data={selectedTimesheet}
          onClose={() => setSelectedTimesheet(null)}
        />
      )}
    </div>
  )
}
