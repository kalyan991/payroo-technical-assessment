## DECISIONS.md

### 1. Project Design Choices

- **Full-Stack TypeScript:**  
  TypeScript was used for both frontend and backend to keep a single language and strong typing across the entire project.

- **Backend (Express + Prisma):**    
  Prisma ORM makes it easy to define models, run migrations, and safely query the PostgreSQL database.  
  The backend runs as an **AWS Lambda function with ECR**, which helps reduce cost and maintenance.

- **Frontend (React + Vite):**  
  Vite offers faster development builds.  
  React Query was used for API data management, and Tailwind CSS for styling.

- **Database (PostgreSQL):**  
  PostgreSQL hosted on AWS RDS provides a reliable and scalable relational database.  
  It fits well with payroll data that includes employees, timesheets, and payruns.

- **Hosting Setup:**  
  - **Backend:** Deployed to AWS Lambda Function URL.  
  - **Frontend:** Hosted on AWS S3 with CloudFront for global CDN delivery.  
  - **Database:** AWS RDS (PostgreSQL).  
  This combination keeps the system serverless, cost-effective, and highly available.

---

### 2. Trade-offs and Key Decisions

- **Using Lambda Instead of EC2:**  
  Lambda was preferred because it requires no manual server management and scales automatically.  
  The trade-off is that it can have small delays on the first request (cold start).

- **Simple Authentication:**  
  A basic session-based token system was added for login and route protection.  
  A more advanced JWT or OAuth setup can be added later if user roles expand.

- **Testing Focus:**  
  The main focus was on unit and API tests for payroll calculations and validation.  
  UI tests were skipped to keep the scope within the expected time limit.

- **PDF Generation:**  
 The payslip summary is converted into PDF using `pdfkit` and stored in S3.


---

### 3. Future Improvements

- Add proper API authentication using the JWT token.
- Add user roles (Admin / Employee).  
- Add GitHub Actions for automated testing and deployment.    
- Add metrics and structured logging for better monitoring.  
- Add email functionality to send emails to the employees with payslip summary.
- Add select employee feature on the payrun page to run the payrun for selected employees.  
- I’m very interested in designing and implementing the payment functionality. As a Stripe-certified developer holding three(3) Stripe certifications, this feature will be a great opportunity to demonstrate my expertise in the payments domain.

---

**© 2025 — Payroo Mini Payrun Project**  
*Simplified Design and Implementation Summary by Neella Kalyan Sai.*
