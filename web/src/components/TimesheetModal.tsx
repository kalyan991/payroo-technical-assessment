import { useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTimesheet, updateTimesheet } from "../api/timesheets.api"
import { getAllEmployees } from "../api/employees.api"
import toast from "react-hot-toast"
import { formatInTimeZone } from 'date-fns-tz'

export default function TimesheetModal({
  onClose,
  editData = null,
}: {
  onClose: () => void
  editData?: any | null
}) {
  const queryClient = useQueryClient()

  const { data: employees } = useQuery({
    queryKey: ["employeesList"],
    queryFn: () => getAllEmployees(),
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: "",
      periodStart: "",
      periodEnd: "",
      entries: [{ date: "", start: "", end: "", unpaidBreakMins: 0 }],
      allowances: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "entries" })

  useEffect(() => {
    if (editData) {
      reset({
        employeeId: editData.employeeId,
        periodStart: editData.periodStart?.split("T")[0],
        periodEnd: editData.periodEnd?.split("T")[0],
        allowances: editData.allowances || 0,
        entries:
          editData.entries?.map((e: any) => ({
            date: e.date.split("T")[0],
            start: e.start,
            end: e.end,
            unpaidBreakMins: e.unpaidBreakMins || 0,
          })) || [{ date: "", start: "", end: "", unpaidBreakMins: 0 }],
      })
    }
  }, [editData, reset])

  const isReadOnly = useMemo(() => {
    if (!editData) return false
    return editData.status && editData.status !== "UNPROCESSED"
  }, [editData])

  const timesheetMutation = useMutation({
    mutationFn: (values: any) => {
      if (editData) {
        return updateTimesheet(editData.id, values)
      } else {
        return createTimesheet(values)
      }
    },
    onSuccess: () => {
      toast.success(editData ? "Timesheet updated successfully" : "Timesheet added successfully")
      queryClient.invalidateQueries({ queryKey: ["timesheetsList"] })
      onClose()
      reset()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err.message || "Failed to save timesheet"
      toast.error(msg)
    },
  })

  const handleFormSubmit = (values: any) => {
    if (isReadOnly) return

    const startDate = new Date(values.periodStart)
    const endDate = new Date(values.periodEnd)
    if (endDate <= startDate) {
      toast.error("Period end date must be later than the start date.")
      return
    }

    for (let i = 0; i < values.entries.length; i++) {
      const entry = values.entries[i]
      if (!entry.start || !entry.end) continue

      const startTime = new Date(`1970-01-01T${entry.start}`)
      const endTime = new Date(`1970-01-01T${entry.end}`)

      if (endTime <= startTime) {
        toast.error(`Entry ${i + 1}: End time must be later than start time.`)
        return
      }
    }

    const payload = {
      ...values,
      periodStart: formatInTimeZone(new Date(values.periodStart), 'Australia/Melbourne', 'yyyy-MM-dd'),
      periodEnd: formatInTimeZone(new Date(values.periodEnd), 'Australia/Melbourne', 'yyyy-MM-dd'),
      allowances: Number(values.allowances) || 0,
      entries: values.entries.map((e: any) => ({
        date: formatInTimeZone(new Date(e.date), 'Australia/Melbourne', 'yyyy-MM-dd'),
        start: e.start,
        end: e.end,
        unpaidBreakMins: Number(e.unpaidBreakMins) || 0,
      })),
    }

    timesheetMutation.mutate(payload)
  }


  const employeeList = employees?.data || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editData ? "Edit Timesheet" : "Add Timesheet"}
        </h2>

        {editData && (
          <div
            className={`mb-5 px-4 py-2 rounded-md text-sm font-medium ${editData.status === "UNPROCESSED"
              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
              : editData.status === "PROCESSED"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-green-50 text-green-700 border border-green-200"
              }`}
          >
            Status: {editData.status}
            {isReadOnly && (
              <span className="ml-2 font-normal text-gray-600">
                — This timesheet has been processed and cannot be edited.
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Employee</label>
              <select
                {...register("employeeId", { required: "Select an employee" })}
                disabled={!!editData}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${editData ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              >
                {editData ? (
                  <option value={editData.employeeId}>
                    {editData.employee
                      ? `${editData.employee.firstName} ${editData.employee.lastName}`
                      : editData.employeeId}
                  </option>
                ) : (
                  <option value="">Select employee</option>
                )}
                {!editData &&
                  employeeList.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
              </select>
              {errors.employeeId && (
                <p className="text-red-500 text-xs mt-1">{String(errors.employeeId.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Allowances</label>
              <input
                type="number"
                step="0.01"
                {...register("allowances", { valueAsNumber: true })}
                disabled={isReadOnly}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Period Start</label>
              <input
                type="date"
                {...register("periodStart", { required: "Required" })}
                disabled={isReadOnly}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Period End</label>
              <input
                type="date"
                {...register("periodEnd", { required: "Required" })}
                disabled={isReadOnly}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Entries</h3>
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Start</th>
                  <th className="p-2">End</th>
                  <th className="p-2">Break (mins)</th>
                  {!isReadOnly && <th className="p-2 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {fields.map((item, index) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">
                      <input
                        type="date"
                        {...register(`entries.${index}.date`, { required: "Required" })}
                        disabled={isReadOnly}
                        className={`border border-gray-300 rounded-md px-2 py-1 w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        {...register(`entries.${index}.start`, { required: "Required" })}
                        disabled={isReadOnly}
                        className={`border border-gray-300 rounded-md px-2 py-1 w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        {...register(`entries.${index}.end`, { required: "Required" })}
                        disabled={isReadOnly}
                        className={`border border-gray-300 rounded-md px-2 py-1 w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        {...register(`entries.${index}.unpaidBreakMins`, { valueAsNumber: true })}
                        disabled={isReadOnly}
                        className={`border border-gray-300 rounded-md px-2 py-1 w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                          }`}
                      />
                    </td>
                    {!isReadOnly && (
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isReadOnly && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => append({ date: "", start: "", end: "", unpaidBreakMins: 0 })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Entry
                </button>
              </div>
            )}
          </div>


          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Close
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                disabled={timesheetMutation.isPending}
                className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                {timesheetMutation.isPending ? "Saving..." : editData ? "Update" : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
