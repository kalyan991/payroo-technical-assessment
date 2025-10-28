import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAllPayruns } from "../api/payruns.api"
import { Plus, Eye } from "lucide-react"
import PayrunModal from "../components/PayrunModal"
import PayrunSummaryModal from "../components/PayrunSummaryModal"
import { formatInTimeZone } from "date-fns-tz"

export default function PayrunsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedPayrun, setSelectedPayrun] = useState<any | null>(null)
  const { data: payrunList, isLoading } = useQuery({
    queryKey: ["payrunList"],
    queryFn: getAllPayruns,
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Payruns</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} /> Create Payrun
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading payruns...</div>
      ) : payrunList?.length === 0 ? (
        <div className="text-gray-500 text-sm">No payruns found</div>
      ) : (
        <table className="w-full bg-white rounded-md shadow border border-gray-100">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-2 text-left">Period</th>
              <th className="p-2 text-left">Total Employees</th>
              <th className="p-2 text-left">Gross</th>
              <th className="p-2 text-left">Tax</th>
              <th className="p-2 text-left">Super</th>
              <th className="p-2 text-left">Net</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {payrunList?.map((run: any) => (
              <tr key={run.id} className="border-t text-sm hover:bg-gray-50">
                <td className="p-2">
                  {formatInTimeZone(new Date(run.periodStart), 'Australia/Melbourne', 'dd MMM yyyy')} –{" "}
                  {formatInTimeZone(new Date(run.periodEnd), 'Australia/Melbourne', 'dd MMM yyyy')}
                </td>
                <td className="p-2">{run.payslips?.length || 0}</td>
                <td className="p-2">${run.totalGross.toFixed(2)}</td>
                <td className="p-2">${run.totalTax.toFixed(2)}</td>
                <td className="p-2">${run.totalSuper.toFixed(2)}</td>
                <td className="p-2">${run.totalNet.toFixed(2)}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => setSelectedPayrun(run)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-center"
                  >
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && <PayrunModal onClose={() => setShowModal(false)} />}

      {selectedPayrun && (
        <PayrunSummaryModal
          data={selectedPayrun}
          onClose={() => setSelectedPayrun(null)}
        />
      )}
    </div>
  )
}
