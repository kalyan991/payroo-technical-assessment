import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPayslipDetails } from "../api/payslips.api"
import toast from "react-hot-toast"
import { formatInTimeZone } from "date-fns-tz"

export default function PayslipPage() {
    const { employeeId, payrunId } = useParams()
    const navigate = useNavigate()

    const { data: payslipData, isLoading, isError } = useQuery({
        queryKey: ["payslipDetails", employeeId, payrunId],
        queryFn: () => getPayslipDetails(employeeId!, payrunId!),
        enabled: !!employeeId && !!payrunId,
    })

    if (isLoading) {
        return <div className="text-center text-gray-500 mt-10">Loading payslip details...</div>
    }


    if (isError || !payslipData) {
        toast.error("Unable to fetch payslip details")
        return (
            <div className="text-center mt-10">
                <p className="text-red-500 mb-4">Something went wrong while fetching payslip data.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                    Go Back
                </button>

            </div>

        )
    }

    const emp = payslipData.employee
    const payrun = payslipData.payrun
    const pdfUrl = payslipData.pdfUrl

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Payslip Details</h1>



                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                        Back
                    </button>
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            download={`Payslip-${payrun.employeeId}.pdf`}
                            className="px-4 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                        >
                            Download PDF
                        </a>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                    <p className="text-gray-500">Employee</p>
                    <p className="font-medium text-gray-800">
                        {emp.firstName} {emp.lastName}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500">Employee ID</p>
                    <p className="font-medium text-gray-800">{emp.id}</p>
                </div>
                <div>
                    <p className="text-gray-500">Period</p>
                    <p className="font-medium text-gray-800">
                        {formatInTimeZone(new Date(payrun.periodStart), 'Australia/Melbourne', 'dd MMM yyyy')} –{" "}
                        {formatInTimeZone(new Date(payrun.periodEnd), 'Australia/Melbourne', 'dd MMM yyyy')}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500">Payrun ID</p>
                    <p className="font-medium text-gray-800">{payrun.id}</p>
                </div>
            </div>

            <h3 className="font-medium text-gray-800 mb-2">Earnings Summary</h3>
            <table className="w-full text-sm border border-gray-200 mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-right">Hours</th>
                        <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-t">
                        <td className="p-2">Normal Hours</td>
                        <td className="p-2 text-right">{payslipData.normalHours.toFixed(2)}</td>
                        <td className="p-2 text-right">${(payslipData.gross - payslipData.super).toFixed(2)}</td>
                    </tr>
                    <tr className="border-t">
                        <td className="p-2">Overtime Hours</td>
                        <td className="p-2 text-right">{payslipData.overtimeHours.toFixed(2)}</td>
                        <td className="p-2 text-right">Included in Gross</td>
                    </tr>
                </tbody>
            </table>

            <h3 className="font-medium text-gray-800 mb-2">Summary Breakdown</h3>
            <table className="w-full text-sm border border-gray-200">
                <tbody>
                    <tr className="border-t">
                        <td className="p-2">Gross Pay</td>
                        <td className="p-2 text-right font-medium">${payslipData.gross.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t">
                        <td className="p-2">Tax</td>
                        <td className="p-2 text-right text-red-600">-${payslipData.tax.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t">
                        <td className="p-2">Super</td>
                        <td className="p-2 text-right">${payslipData.super.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t bg-gray-100">
                        <td className="p-2 font-semibold">Net Pay</td>
                        <td className="p-2 text-right font-semibold text-green-700">
                            ${payslipData.net.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-8 text-center text-xs text-gray-500 border-t pt-3">
                This payslip was generated on{" "}
                {formatInTimeZone(new Date(payrun.createdAt), "Australia/Melbourne", "dd MMM yyyy")}

            </div>
        </div>
    )
}
