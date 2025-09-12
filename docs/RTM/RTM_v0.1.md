# Requirements Traceability Matrix (RTM)

| Req ID          | Priority | Test Case IDs                            | Evidence (reports/screens)                         |
|-----------------|----------|------------------------------------------|----------------------------------------------------|
| AUTH_FR001      | Must     | TC-AUTH-001 register success             | qa/postman/reports/newman-auth.html                |
| AUTH_FR002      | Must     | TC-AUTH-010 login ok; 011 invalid        | qa/postman/reports/newman-auth.html                |
| AUTH_FR004      | Must     | TC-AUTH-030 RBAC allow/deny              | qa/postman/reports/newman-auth.html                |
| PET_FR001-004   | Must/Should | TC-PET-001.. CRUD; 010 timeline     | qa/postman/reports/newman-pet.html                 |
| VET_FR001-002   | Should   | TC-VET-001.. CRUD; 010 availability      | qa/postman/reports/newman-vet.html                 |
| APPT_FR002-004  | Must/Should | TC-APPT-010 book; 020 resched; 030 cancel | qa/playwright/reports/html/index.html          |
| HEALTH_FR001-003| Must/Should | TC-HEALTH-001 vaccin; 010 meds      | qa/postman/reports/newman-health.html              |
| PAY_FR001-003   | Should   | TC-PAY-001 flow; 010 status; 020 receipt | qa/postman/reports/newman-pay.html                 |
| REPORT_FR001-003| Should/Stretch | TC-REPORT-001 KPI; 010 schedule  | qa/evidence/report-kpi-screenshot.png              |
