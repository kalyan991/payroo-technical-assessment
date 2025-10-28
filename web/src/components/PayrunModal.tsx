import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPayrun } from "../api/payruns.api"
import toast from "react-hot-toast"
import { formatInTimeZone } from 'date-fns-tz'

export default function PayrunModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset } = useForm()

  const payrunMutation = useMutation({
    mutationFn: createPayrun,
    onSuccess: () => {
      toast.success("Payrun created successfully")
      queryClient.invalidateQueries({ queryKey: ["payrunList"] })
      onClose()
      reset()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || "Failed to create payrun")
    },
  })

  const handleSavePayrun = (values: any) => {
    const objData = {
      periodStart: formatInTimeZone(new Date(values.periodStart), 'Australia/Melbourne', 'yyyy-MM-dd'),
      periodEnd: formatInTimeZone(new Date(values.periodEnd), 'Australia/Melbourne', 'yyyy-MM-dd'),
    }
    payrunMutation.mutate(objData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">Create Payrun</h2>

        <form onSubmit={handleSubmit(handleSavePayrun)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Start
            </label>
            <input
              type="date"
              {...register("periodStart", { required: true })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period End
            </label>
            <input
              type="date"
              {...register("periodEnd", { required: true })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={payrunMutation.isPending}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              {payrunMutation.isPending ? "Creating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
