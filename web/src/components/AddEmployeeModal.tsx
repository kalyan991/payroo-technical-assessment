import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addNewEmployee, updateEmployee, } from "../api/employees.api"
import toast from "react-hot-toast"

export default function EmployeeModal({
    onClose,
    editData = null,
}: {
    onClose: () => void
    editData?: any | null
}) {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            id: "",
            firstName: "",
            lastName: "",
            baseHourlyRate: "",
            superRate: "",
            bankBsb: "",
            bankAccount: "",
            stripeAccountId: "",
        },
    })

    useEffect(() => {
        if (editData) {
            reset({
                id: editData.id,
                firstName: editData.firstName,
                lastName: editData.lastName,
                baseHourlyRate: editData.baseHourlyRate,
                superRate: editData.superRate,
                bankBsb: editData.bankBsb,
                bankAccount: editData.bankAccount,
                stripeAccountId: editData.stripeAccountId || "",
            })
        }
    }, [editData, reset])

    const employeeMutation = useMutation({
        mutationFn: (values: any) =>
            editData ? updateEmployee(values) : addNewEmployee(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeesList"] })
            toast.success(editData ? "Employee updated successfully" : "Employee added successfully")
            onClose()
            reset()
        },
        onError: (err: any) => {
            console.error(err)
            toast.error(err?.response?.data?.error || "Failed to save employee")
        },
    })

    const watchedValues = watch()

    const hasChanges = useMemo(() => {
        if (!editData) return false
        const cleanWatched = {
            id: watchedValues.id,
            firstName: watchedValues.firstName,
            lastName: watchedValues.lastName,
            baseHourlyRate: Number(watchedValues.baseHourlyRate),
            superRate: Number(watchedValues.superRate),
            bankBsb: watchedValues.bankBsb,
            bankAccount: watchedValues.bankAccount,
            stripeAccountId: watchedValues.stripeAccountId,
        }
        const cleanEdit = {
            id: editData.id,
            firstName: editData.firstName,
            lastName: editData.lastName,
            baseHourlyRate: Number(editData.baseHourlyRate),
            superRate: Number(editData.superRate),
            bankBsb: editData.bankBsb,
            bankAccount: editData.bankAccount,
            stripeAccountId: editData.stripeAccountId,
        }
        return JSON.stringify(cleanWatched) !== JSON.stringify(cleanEdit)
    }, [watchedValues, editData])

    const handleFormSubmit = (values: any) => {
        const employeeData = {
            id: editData ? editData.id : values.id.trim(),
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            type: "hourly",
            baseHourlyRate: Number(values.baseHourlyRate),
            superRate: Number(values.superRate),
            bank: {
                bsb: values.bankBsb.trim(),
                account: values.bankAccount.trim(),
            },
            stripeAccountId: values.stripeAccountId?.trim() || null,
        }
        employeeMutation.mutate(employeeData)
    }

    const isSubmitEnabled = !employeeMutation.isPending && (
        (!editData && isValid) ||
        (editData && hasChanges)
    )

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                    {editData ? "Edit Employee" : "Add New Employee"}
                </h2>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <input
                                {...register("id", { required: "Employee ID is required" })}
                                disabled={!!editData}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editData ? "bg-gray-100 cursor-not-allowed" : ""
                                    }`}
                            />
                            {errors.id && <p className="text-red-500 text-xs mt-1">{String(errors.id.message)}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                {...register("firstName", { required: "First name is required" })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.firstName.message)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                {...register("lastName", { required: "Last name is required" })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.lastName.message)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Hourly Rate ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register("baseHourlyRate", {
                                    required: "Base rate is required",
                                    min: { value: 1, message: "Rate must be positive" },
                                })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.baseHourlyRate && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.baseHourlyRate.message)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Super Rate (0–1)</label>
                            <input
                                type="number"
                                step="0.001"
                                {...register("superRate", {
                                    required: "Super rate is required",
                                    min: { value: 0, message: "Minimum is 0" },
                                    max: { value: 1, message: "Maximum is 1" },
                                })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.superRate && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.superRate.message)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank BSB</label>
                            <input
                                {...register("bankBsb", {
                                    required: "BSB is required",
                                    pattern: { value: /^[0-9]{3}-?[0-9]{3}$/, message: "Invalid BSB format" },
                                })}
                                placeholder="083-123"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.bankBsb && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.bankBsb.message)}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                            <input
                                {...register("bankAccount", {
                                    required: "Account number is required",
                                    pattern: { value: /^[0-9]{6,12}$/, message: "Invalid account number" },
                                })}
                                placeholder="12345678"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.bankAccount && (
                                <p className="text-red-500 text-xs mt-1">{String(errors.bankAccount.message)}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Account ID</label>
                            <input
                                {...register("stripeAccountId")}
                                placeholder="acct_1XXXXXXX"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

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
                            disabled={!isSubmitEnabled}
                            className={`px-5 py-2 rounded-md text-white ${isSubmitEnabled
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-300 cursor-not-allowed"
                                }`}
                        >
                            {employeeMutation.isPending
                                ? "Saving..."
                                : editData
                                    ? "Update"
                                    : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
