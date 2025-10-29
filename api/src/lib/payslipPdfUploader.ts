import AWS from "aws-sdk"
import PDFDocument from "pdfkit-table"
import fs from "fs"
import os from "os"
import path from "path"
import { formatInTimeZone } from "date-fns-tz"
import prisma from "../lib/prisma"
import "dotenv/config"

/**
 * Generates a formatted payslip PDF and uploads to S3.
 */
export async function generateAndUploadPayslipPDF(
  slip: any,
  periodStartDate: Date,
  periodEndDate: Date
): Promise<string | null> {
  try {
    // Skip if S3 not configured
    if (
      !process.env.CURRENT_ACCESS_KEY_ID ||
      !process.env.CURRENT_SECRET_ACCESS_KEY ||
      !process.env.BUCKET_NAME ||
      !process.env.CURRENT_REGION
    ) {
      console.log("⚠️  S3 environment variables not found — skipping PDF generation.")
      return null
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.CURRENT_ACCESS_KEY_ID,
      secretAccessKey: process.env.CURRENT_SECRET_ACCESS_KEY,
      region: process.env.CURRENT_REGION,
    })

    const tmpPath = path.join(os.tmpdir(), `${slip.id}.pdf`)
    const stream = fs.createWriteStream(tmpPath)
    const doc = new PDFDocument({ margin: 50 })
    doc.pipe(stream)

    // Header
    doc.fontSize(18).text("Payslip", { align: "center" }).moveDown(1.5)

    // Employee info
    doc.fontSize(12)
    doc.text(`Employee: ${slip.employee.firstName} ${slip.employee.lastName}`)
    doc.text(`Employee ID: ${slip.employeeId}`)
    doc.text(
      `Period: ${formatInTimeZone(periodStartDate, "Australia/Melbourne", "dd MMM yyyy")} – ${formatInTimeZone(
        periodEndDate,
        "Australia/Melbourne",
        "dd MMM yyyy"
      )}`
    )
    doc.text(`Generated: ${formatInTimeZone(new Date(), "Australia/Melbourne", "dd MMM yyyy")}`)
    if (slip.stripeTransferId) {
      doc.text(`Stripe Transfer ID: ${slip.stripeTransferId}`)
    }
    doc.moveDown(1.5)
    // Earnings Summary Table
    await doc.table(
      {
        title: "Earnings Summary",
        headers: [
          { label: "Type", property: "type", width: 150 },
          { label: "Hours", property: "hours", width: 100 },
          { label: "Amount", property: "amount", width: 150 },
        ],
        datas: [
          {
            type: "Normal Hours",
            hours: slip.normalHours.toFixed(2),
            amount: `$${(slip.gross - slip.super).toFixed(2)}`,
          },
          { type: "Overtime Hours", hours: slip.overtimeHours.toFixed(2), amount: "Included in Gross" },
        ],
      },
      { prepareHeader: () => doc.font("Helvetica-Bold"), prepareRow: () => doc.font("Helvetica") }
    )

    doc.moveDown(1)

    // Summary Breakdown Table
    await doc.table(
      {
        title: "Summary Breakdown",
        headers: [
          { label: "Component", property: "component", width: 150 },
          { label: "Amount", property: "amount", width: 100 },
        ],
        datas: [
          { component: "Gross Pay", amount: `$${slip.gross.toFixed(2)}` },
          { component: "Tax", amount: `-$${slip.tax.toFixed(2)}` },
          { component: "Super", amount: `$${slip.super.toFixed(2)}` },
          { component: "Net Pay", amount: `$${slip.net.toFixed(2)}` },
        ],
      },
      { prepareHeader: () => doc.font("Helvetica-Bold"), prepareRow: () => doc.font("Helvetica") }
    )

    doc.end()
    await new Promise<void>((resolve) => stream.on("finish", resolve))

    // Upload to S3
    const fileBuffer = fs.readFileSync(tmpPath)
    const s3Key = `payslips/${slip.id}.pdf`
    await s3
      .upload({
        Bucket: process.env.BUCKET_NAME!,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: "application/pdf",
        ACL: "public-read",
        ContentDisposition: `attachment; filename="Payslip-${slip.employeeId}-${formatInTimeZone(periodEndDate, "Australia/Melbourne", "yyyy-MM")}.pdf"`,
      })
      .promise()

    fs.unlinkSync(tmpPath)

    const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.CURRENT_REGION}.amazonaws.com/${s3Key}`

    // Update DB record
    await prisma.payslip.update({
      where: { id: slip.id },
      data: { pdfUrl: s3Url },
    })

    console.log(`Uploaded payslip for ${slip.employeeId}`)
    return s3Url
  } catch (err) {
    console.error("❌ Error generating/uploading payslip PDF:", err)
    return null
  }
}
