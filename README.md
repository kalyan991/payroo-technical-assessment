## README.md

### Project Overview:
This project implements a simplified version of the **Payroo payroll platform**, allowing administrators to:  
- Manage employees and their timesheets  
- Generate pay runs for a given date range  
- View and download individual payslips  

The project is built as a **full-stack TypeScript application** deployed on **AWS**.

---

### Architecture:

#### Frontend (web):
- **Stack:** React + TypeScript + React Query + Tailwind CSS  
- **Routing:** React Router with protected routes (`/employees`, `/timesheets`, `/payruns`, `/payslips/:employeeId/:payrunId`)  
- **Authentication:** Simple session-based token using `ProtectedRoute` wrapper  
- **Pages:**
  - `LoginPage` – user authentication  
  - `EmployeesPage` – manage employee records  
  - `TimesheetsPage` – create and view employee timesheets  
  - `PayrunSummaryPage` – view payrun summaries and totals  
  - `PayslipDetailPage` – view individual employee payslips and generate downloadable PDF payslips that are uploaded to S3. 
- **Deployment:** AWS S3 + CloudFront  
- **Live URL:** [https://d1sxhpkkj1omwr.cloudfront.net](https://d1sxhpkkj1omwr.cloudfront.net)

---

#### Backend (api):
- **Stack:** Node.js (Express + TypeScript + Prisma ORM)  
- **Database:** PostgreSQL (via Prisma ORM)  
- **Business Logic:** Calculation of Gross, Tax, Superannuation, and Net Pay per payrun  
- **Testing:** Jest + Supertest  
- **Deployment:** AWS Lambda (Function URL)  
- **API Base URL:** [https://zftlwlfrqedkieujy5uthsweda0qgeik.lambda-url.ap-southeast-2.on.aws/](https://zftlwlfrqedkieujy5uthsweda0qgeik.lambda-url.ap-southeast-2.on.aws/)

---

### Key Features:
- CRUD operations for Employees and Timesheets  
- Generate Payruns with automatic Gross, Tax, Super, and Net calculations  
- Progressive tax brackets and 38-hour weekly overtime threshold  
- Added Stripe for fund transfer once the payrun for the timesheets is successful.
- Secure API configuration using Helmet + CORS  
- Unit and API tests implemented with Jest and Supertest  
- Deployed using AWS Lambda (serverless backend) and CloudFront (static frontend)

---

### Reference Totals (for verification):
- **Alice:** Gross $1,325 → Tax $133.75 → Super $152.38 → Net $1,191.25  
- **Bob:** Gross $2,328 → Tax $436.10 → Super $267.72 → Net $1,891.90  
- **Totals:** Gross $3,653 → Tax $569.85 → Super $420.10 → Net $3,083.15  

---

---

### Stripe (Payments) — Test mode & secrets

This project integrates Stripe to transfer funds for completed payruns. **Only Stripe test keys must be used.**
lease use the Stripe Connect account IDs provided to you and link them to the employees when creating their profiles. These account IDs ensure smooth and seamless fund transfers.
---


### Repository Structure:
```
PROJECT/
│
├── api/        # Backend (Express + Prisma + Tests)
│   ├── src/
│   ├── prisma/
│   ├── test/
│   └── package.json
│
├── web/        # Frontend (React + Vite + Tailwind)
│   ├── src/
│   ├── public/
│   └── package.json

```

---

### Deployment Summary:
| Component | Service | URL |
|------------|----------|-----|
| **Frontend** | AWS S3 + CloudFront | [https://d1sxhpkkj1omwr.cloudfront.net](https://d1sxhpkkj1omwr.cloudfront.net) |
| **Backend** | AWS Lambda (Function URL) | [https://zftlwlfrqedkieujy5uthsweda0qgeik.lambda-url.ap-southeast-2.on.aws/](https://zftlwlfrqedkieujy5uthsweda0qgeik.lambda-url.ap-southeast-2.on.aws/) |
| **Database** | PostgreSQL (AWS RDS) | Connected via Prisma ORM |

---

**© 2025 — Payroo Mini Payrun Project**  
*Full-Stack Developer Coding Assessment Submission by Neella Kalyan Sai.*
