import {
  calculateTax,
  calculateGross,
  calculateSuper,
  calculateNet,
} from "../src/domain/payrunLogic"

describe("Payrun calculation logic", () => {
  test("Tax bracket edge cases", () => {
    expect(calculateTax(0)).toBe(0)
    expect(calculateTax(370)).toBe(0) // Edge case of 0% bracket
    expect(calculateTax(370.01)).toBeCloseTo((370.01 - 370) * 0.1, 2)
    expect(calculateTax(900)).toBeCloseTo(53, 2)
    expect(calculateTax(900.01)).toBeCloseTo(53 + (0.01 * 0.19), 2)
    expect(calculateTax(1500)).toBeCloseTo(167, 2)
  })

  test("Overtime gross calculation (Bob Singh example from the document)", () => {
    // 38 normal + 7 overtime at 1.5 rate + 0 allowances
    const gross = calculateGross(38, 7, 48, 0)
    expect(gross).toBeCloseTo(2328, 2)
  })

  test("Gross and net calculation (Alice Chen example from the document)", () => {
    const gross = calculateGross(37, 0, 35, 30)
    expect(gross).toBeCloseTo(1325, 2)

    const tax = calculateTax(gross)
    expect(tax).toBeCloseTo(133.75, 2)

    const superAmt = calculateSuper(gross)
    expect(superAmt).toBeCloseTo(152.38, 2)

    const net = calculateNet(gross, tax)
    expect(net).toBeCloseTo(1191.25, 2)
  })

  test("Super calculation correct", () => {
    expect(calculateSuper(2328)).toBeCloseTo(267.72, 2)
  })
})
