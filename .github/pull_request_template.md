## Description
Provide a concise explanation of what this pull request changes and the rationale behind it.

## Related Issues
Closes #(issue_number)

## Checklist
- [ ] Code strictly maintains 100% offline / air-gap compliance (zero cloud egress).
- [ ] No mock data introduced (telemetry-derived evidence only).
- [ ] Automated tests added/updated and passing cleanly (`py -3.14 -m pytest backend/tests ml/tests`).
- [ ] Air-gap verification passed (`py -3.14 infrastructure/verify_airgap.py`).
- [ ] Frontend builds cleanly with zero errors (`npm run build`).

## Test Evidence
Attach output summary or screenshot verifying passing test suite.
