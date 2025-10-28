export function calculateHours(entries: any[]) {
    let totalMinutes = 0
    for (const e of entries) {
        const [startH, startM] = e.start.split(":").map(Number)
        const [endH, endM] = e.end.split(":").map(Number)
        const worked = (endH * 60 + endM) - (startH * 60 + startM) - e.unpaidBreakMins
        totalMinutes += worked
    }
    const totalHours = totalMinutes / 60
    const normalHours = Math.min(38, totalHours)
    const overtimeHours = Math.max(0, totalHours - 38)
    return { normalHours, overtimeHours }
}

export function calculateGross(normalHours: number, overtimeHours: number, baseRate: number, allowances: number) {
    return normalHours * baseRate + overtimeHours * baseRate * 1.5 + allowances
}

export function calculateTax(gross: number) {
    let tax = 0
    if (gross > 5000) tax += (gross - 5000) * 0.45 + 0.37 * 2000 + 0.325 * 1500 + 0.19 * 600 + 0.1 * 530
    else if (gross > 3000) tax += (gross - 3000) * 0.37 + 0.325 * 1500 + 0.19 * 600 + 0.1 * 530
    else if (gross > 1500) tax += (gross - 1500) * 0.325 + 0.19 * 600 + 0.1 * 530
    else if (gross > 900) tax += (gross - 900) * 0.19 + 0.1 * 530
    else if (gross > 370) tax += (gross - 370) * 0.1
    return parseFloat(tax.toFixed(2))
}

export function calculateSuper(gross: number) {
    return parseFloat((gross * 0.115).toFixed(2))
}

export function calculateNet(gross: number, tax: number) {
    return parseFloat((gross - tax).toFixed(2))
}
