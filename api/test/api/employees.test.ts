import request from "supertest"
import app from "../../src/index"

describe("Employees API", () => {
      jest.setTimeout(20000)
    it("GET /employees should return seeded employees", async () => {
        const res = await request(app).get("/employees")
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBeGreaterThanOrEqual(2)
        expect(res.body.data[0]).toHaveProperty("firstName")
    })

    it("POST /employees should validate payload", async () => {
        const res = await request(app)
            .post("/employees")
            .send({ firstName: "Incomplete" })
        expect(res.status).toBeGreaterThanOrEqual(400)
    })
})
