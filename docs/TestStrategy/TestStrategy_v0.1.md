# Test Strategy — VetCare+

## 1. Goals & Scope
Validate correctness, performance, security, and accessibility across AUTH, PET, VET, APPT, HEALTH, PAY, REPORT.

## 2. Test Types & Tools
- **Functional/UI**: Playwright (HTML report, screenshots/videos)
- **API**: Postman + Newman (HTML report)
- **Performance**: JMeter (100–200 booking spike)
- **Security**: OWASP ZAP baseline
- **Accessibility/Perf**: Lighthouse (axe optional)
- **Backend Unit/API**: Jest + Supertest (owned by backend)

## 3. Environments
Local Docker: API `http://localhost:3000`, Web `http://localhost:5173`, DB Postgres.

## 4. Entry/Exit Criteria
Entry: endpoints exist; UI builds.  
Exit: 0 P1/P2; pass ≥ 95%; A11y keyboard & contrast OK.

## 5. Data & Evidence
HTML reports in `qa/**/reports`, screenshots in `qa/evidence`.

## 6. CI
GitHub Actions (manual) to run Newman + Playwright and upload artifacts.

## 7. Risks
Endpoint instability → retries/mocks; verbose logs; isolate flaky tests.
