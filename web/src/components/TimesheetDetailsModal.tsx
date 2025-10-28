import { useNavigate } from "react-router-dom"
import { formatInTimeZone } from "date-fns-tz"

export default function TimesheetDetailsModal({
  data,
  onClose,
}: {
  data: any
  onClose: () => void
}) {
  if (!data) return null


  const formatDate = (date: string | Date) =>
    formatInTimeZone(new Date(date), "Australia/Melbourne", "dd MMM yyyy")
  const formatCurrency = (value: number) =>
    `$${(value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "UNPROCESSED":
        return "bg-yellow-100 text-yellow-700"
      case "PROCESSED":
        return "bg-blue-100 text-blue-700"
      case "PAID":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const showPayslipButton =
    data.status === "PROCESSED" || data.status === "PAID"
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Timesheet Details
          </h2>

          {data.status && (
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClasses(
                data.status
              )}`}
            >
              {data.status}
            </span>
          )}
        </div>

        {data.status !== "UNPROCESSED" && (
          <div
            className={`mb-5 px-4 py-2 rounded-md text-sm font-medium ${data.status === "PROCESSED"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-green-50 text-green-700 border border-green-200"
              }`}
          >
            This timesheet has been {data.status.toLowerCase()} and cannot be
            modified.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-500">Employee</p>
            <p className="font-medium text-gray-800">
              {data.employee
                ? `${data.employee.firstName} ${data.employee.lastName}`
                : data.employeeId}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Allowances</p>
            <p className="font-medium text-gray-800">
              {formatCurrency(data.allowances)}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Period Start</p>
            <p className="font-medium text-gray-800">
              {formatDate(data.periodStart)}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Period End</p>
            <p className="font-medium text-gray-800">
              {formatDate(data.periodEnd)}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Total Entries</p>
            <p className="font-medium text-gray-800">
              {data.entries?.length || 0}
            </p>
          </div>
        </div>

        <h3 className="font-semibold mb-2 text-gray-800">Entries</h3>
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Start</th>
              <th className="p-2 text-left">End</th>
              <th className="p-2 text-left">Break (mins)</th>
              <th className="p-2 text-left">Worked Hours</th>
            </tr>
          </thead>
          <tbody>
            {data.entries?.map((entry: any, idx: number) => {
              const start = new Date(`1970-01-01T${entry.start}`)
              const end = new Date(`1970-01-01T${entry.end}`)
              const worked =
                (end.getTime() - start.getTime()) / 3600000 -
                (entry.unpaidBreakMins || 0) / 60
              return (
                <tr key={idx} className="border-t">
                  <td className="p-2">{formatDate(entry.date)}</td>
                  <td className="p-2">{entry.start}</td>
                  <td className="p-2">{entry.end}</td>
                  <td className="p-2">{entry.unpaidBreakMins}</td>
                  <td className="p-2">
                    {worked > 0 ? worked.toFixed(2) : "0.00"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-6">
          {showPayslipButton && data.payrunId ? (
            <button
              onClick={() => navigate(`/payslips/${data.employeeId}/${data.payrunId}`)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              View Payslip
            </button>
          ) : (
            <div />
          )}


          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
