import { Link } from "react-router-dom"
import { formatInTimeZone } from 'date-fns-tz'

export default function PayrunSummaryModal({
  data,
  onClose,
}: {
  data: any
  onClose: () => void
}) {
  if (!data) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-5 text-gray-800">Payrun Summary</h2>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Period</p>
            <p className="font-medium text-gray-800">
              {formatInTimeZone(new Date(data.periodStart), 'Australia/Melbourne', 'dd MMM yyyy')} –{" "}
              {formatInTimeZone(new Date(data.periodEnd), 'Australia/Melbourne', 'dd MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total Employees</p>
            <p className="font-medium text-gray-800">{data.payslips?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Gross Total</p>
            <p className="font-medium text-gray-800">${data.totalGross.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Net Total</p>
            <p className="font-medium text-gray-800">${data.totalNet.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2 text-gray-800">Payslip Details</h3>
        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Hours</th>
              <th className="p-2 text-left">Gross</th>
              <th className="p-2 text-left">Tax</th>
              <th className="p-2 text-left">Super</th>
              <th className="p-2 text-left">Net</th>
              <th className="p-2 text-left">Payslip</th>
            </tr>
          </thead>
          <tbody>
            {data.payslips?.map((slip: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2">
                  {slip.employee?.firstName} {slip.employee?.lastName}
                </td>
                <td className="p-2">
                  {(slip.normalHours + slip.overtimeHours).toFixed(2)}
                </td>
                <td className="p-2">${slip.gross.toFixed(2)}</td>
                <td className="p-2">${slip.tax.toFixed(2)}</td>
                <td className="p-2">${slip.super.toFixed(2)}</td>
                <td className="p-2">${slip.net.toFixed(2)}</td>
                <td className="p-2">
                  <Link
                    to={`/payslips/${slip.employeeId}/${data.id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    View Payslip
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
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
