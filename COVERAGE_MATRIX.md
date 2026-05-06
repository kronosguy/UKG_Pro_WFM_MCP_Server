# Coverage Matrix

## Purpose

This matrix defines how the UKG WFM Academy covers enterprise workforce management capabilities across business operations, technical implementation, governance, analytics, automation, and certification readiness.

Coverage is organized by domain, capability, primary repository, implementation artifacts, labs, and certification alignment.

## Coverage Levels

```text
Foundation   Introduces concepts, vocabulary, operating model, and business context
Practitioner Builds repeatable workflows, labs, troubleshooting, and domain deliverables
Advanced     Adds automation, analytics, integration, governance, and scalable controls
Architect    Designs enterprise systems, reference architecture, rollout models, and capstones
```

## Core WFM Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Timekeeping | `ukg-wfm-timekeeping-architecture` | Practitioner | timecard lifecycle, exception taxonomy, payroll readiness checklist | payroll readiness monitoring workflow | WFM Operations Analyst |
| Scheduling | `ukg-wfm-scheduling-operations` | Practitioner | scheduling operating model, staffing review workflow, schedule quality scorecard | facility schedule risk review | WFM Operations Analyst |
| Attestation | `ukg-wfm-attestation-frameworks` | Advanced | attestation control matrix, exception workflow, audit evidence model | attestation exception review process | WFM Governance Lead |
| Accruals | `ukg-wfm-accruals-governance` | Practitioner | accrual policy map, adjustment workflow, balance reconciliation model | balance dispute triage workflow | UKG Configuration Analyst |
| Attendance | `ukg-wfm-attendance-management` | Practitioner | occurrence model, review workflow, manager scorecard | attendance event review simulation | UKG Configuration Analyst |
| Pay Rules | `ukg-wfm-pay-rules-governance` | Advanced | pay rule inventory, test matrix, regression suite | governed pay rule change simulation | UKG Configuration Analyst |
| Hyperfinds | `ukg-wfm-hyperfinds` | Practitioner | hyperfind catalog, naming standard, validation checklist | enterprise query library build | UKG Configuration Analyst |
| Access Profiles | `ukg-wfm-access-profiles` | Advanced | role matrix, access request workflow, recertification model | access review simulation | WFM Governance Lead |
| Device Management | `ukg-wfm-device-management` | Practitioner | device inventory, support runbook, escalation matrix | time capture outage response | WFM Operations Analyst |
| Leave Management | `ukg-wfm-leave-management` | Practitioner | leave coordination model, payroll impact checklist, reporting spec | leave-to-timecard reconciliation | WFM Operations Analyst |

## Geofence And Mobility Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Geofence Governance | `ukg-wfm-geofence-governance` | Architect | governance model, approval matrix, audit report spec | geofence intelligence platform | Enterprise WFM Architect |
| Known Locations | `ukg-wfm-known-locations` | Practitioner | location catalog, intake form, validation checklist | known location lifecycle workflow | WFM Governance Lead |
| Known IP Ranges | `ukg-wfm-known-ip-ranges` | Practitioner | IP inventory, network validation checklist, ownership matrix | trusted network validation workflow | WFM Governance Lead |
| GPS Validation | `ukg-wfm-geofence-governance` | Advanced | GPS evidence standard, radius rules, exception categories | GPS failure triage simulation | WFM Governance Lead |
| Mobile Punch | `ukg-wfm-mobile-punch-troubleshooting` | Practitioner | support decision tree, incident template, resolution taxonomy | mobile punch troubleshooting queue | WFM Operations Analyst |
| Device Troubleshooting | `ukg-wfm-device-troubleshooting` | Practitioner | device triage checklist, escalation model, trend report spec | recurring device issue investigation | WFM Operations Analyst |
| VPN Behavior | `ukg-wfm-known-ip-ranges` | Advanced | VPN impact analysis, trusted network decision rules | VPN exception investigation | UKG API Engineer |
| Wi-Fi Behavior | `ukg-wfm-known-ip-ranges` | Advanced | Wi-Fi ownership map, facility network validation | facility Wi-Fi punch validation | WFM Governance Lead |
| Geofence Analytics | `ukg-wfm-geofence-analytics` | Advanced | KPI model, exception dashboard, remediation workflow | geofence exception scorecard | Workforce Analytics Engineer |

## APIs And Integrations Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| REST APIs | `ukg-wfm-api-foundations` | Advanced | endpoint catalog, request patterns, error model | API explorer build | UKG API Engineer |
| OpenAPI | `ukg-wfm-openapi-engineering` | Advanced | OpenAPI specification, contract review checklist, mock server | API contract documentation lab | UKG API Engineer |
| Authentication | `ukg-wfm-authentication-patterns` | Advanced | token handling model, credential checklist, incident runbook | secure auth workflow lab | UKG API Engineer |
| Service Accounts | `ukg-wfm-service-account-governance` | Advanced | service account register, rotation workflow, access review | service account lifecycle lab | WFM Governance Lead |
| Integration Architecture | `ukg-wfm-integration-architecture` | Architect | reference architecture, data flow map, monitoring spec | enterprise integration design review | Enterprise WFM Architect |
| Webhooks | `ukg-wfm-webhooks` | Advanced | event catalog, receiver design, replay strategy | event-driven workflow lab | UKG API Engineer |
| Middleware | `ukg-wfm-middleware-patterns` | Architect | middleware patterns, queue strategy, failure runbook | resilient middleware simulation | Enterprise WFM Architect |
| Python SDKs | `ukg-wfm-python-sdk-labs` | Advanced | Python client, CLI, tests, examples | reusable SDK build | UKG API Engineer |

## Analytics And Reporting Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Workforce KPIs | `ukg-wfm-workforce-analytics` | Practitioner | KPI catalog, metric definitions, dashboard wireframe | KPI scorecard build | Workforce Analytics Engineer |
| BigQuery | `ukg-wfm-bigquery-pipelines` | Advanced | schema, SQL transformations, quality checks | analytics pipeline build | Workforce Analytics Engineer |
| Power BI | `ukg-wfm-powerbi-reporting` | Advanced | semantic model, measure catalog, report specification | executive dashboard build | Workforce Analytics Engineer |
| Payroll Risk | `ukg-wfm-payroll-risk-analytics` | Advanced | risk model, exception aging logic, remediation checklist | payroll risk engine build | Workforce Analytics Engineer |
| Staffing Analytics | `ukg-wfm-staffing-analytics` | Advanced | coverage risk model, staffing dashboard, escalation rules | staffing risk scorecard | Workforce Analytics Engineer |
| Compliance Reporting | `ukg-wfm-compliance-reporting` | Advanced | report catalog, evidence checklist, control dashboard | compliance reporting model | WFM Governance Lead |
| Exception Reporting | `ukg-wfm-exception-reporting` | Practitioner | exception taxonomy, aging model, escalation workflow | exception aging dashboard | WFM Operations Analyst |
| Productivity Metrics | `ukg-wfm-productivity-metrics` | Advanced | productivity metric catalog, variance model, scorecard spec | productivity scorecard lab | Workforce Analytics Engineer |

## Power Platform Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Power Apps | `ukg-wfm-power-platform` | Practitioner | app specification, screen model, data model | workforce operations app build | Workforce Automation Engineer |
| Power Apps Governance | `ukg-wfm-power-apps-governance` | Advanced | app governance framework, permission matrix, support model | app review board simulation | Workforce Automation Engineer |
| Power Automate | `ukg-wfm-power-automate-orchestration` | Advanced | flow architecture, approval workflow, monitoring model | approval orchestration lab | Workforce Automation Engineer |
| SharePoint Lists | `ukg-wfm-sharepoint-operational-lists` | Practitioner | list schema, views, permissions, retention model | operational list design lab | Workforce Automation Engineer |
| Governance Applications | `ukg-wfm-governance-applications` | Advanced | app architecture, audit trail, approval matrix | governance intake app build | Workforce Automation Engineer |
| Operational Applications | `ukg-wfm-operational-applications` | Advanced | task model, notification flow, operations dashboard spec | exception routing app lab | Workforce Automation Engineer |

## Workforce Operations Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Operational Intelligence | `ukg-wfm-operational-intelligence` | Advanced | operating signal catalog, dashboard architecture, escalation model | operational signal model lab | Enterprise WFM Architect |
| Command Center | `ukg-wfm-command-center` | Architect | command center architecture, executive dashboard, simulation package | command center build | Enterprise WFM Architect |
| SLA Monitoring | `ukg-wfm-sla-monitoring` | Advanced | SLA catalog, breach logic, escalation workflow | SLA monitoring scorecard | WFM Governance Lead |
| Exception Aging | `ukg-wfm-exception-aging` | Practitioner | aging model, remediation workflow, manager scorecard | exception remediation lab | WFM Operations Analyst |
| Staffing Risk | `ukg-wfm-staffing-risk-monitoring` | Advanced | risk score model, thresholds, dashboard specification | staffing risk monitoring lab | Workforce Analytics Engineer |
| Operational Scorecards | `ukg-wfm-operational-scorecards` | Advanced | scorecard framework, KPI dictionary, market and facility views | market scorecard build | Workforce Analytics Engineer |
| Executive Dashboards | `ukg-wfm-executive-dashboards` | Architect | executive dashboard spec, metric governance, presentation model | executive review package | Enterprise WFM Architect |

## Governance, Security, And Compliance Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Access Governance | `ukg-wfm-access-governance` | Architect | access framework, role matrix, review checklist | access recertification simulation | WFM Governance Lead |
| Audit Frameworks | `ukg-wfm-audit-frameworks` | Architect | control matrix, evidence catalog, audit response playbook | audit readiness package | WFM Governance Lead |
| Change Management | `ukg-wfm-change-management` | Advanced | change request model, impact assessment, release documentation | pay rule change review | WFM Governance Lead |
| Naming Standards | `ukg-wfm-naming-standards` | Practitioner | naming standard, asset catalog, review checklist | asset naming cleanup lab | UKG Configuration Analyst |
| Enterprise Standards | `ukg-wfm-enterprise-standards` | Architect | standards manual, exception process, design authority charter | standards review board simulation | Enterprise WFM Architect |
| Compliance Controls | `ukg-wfm-compliance-controls` | Advanced | compliance library, owner matrix, monitoring model | control monitoring lab | WFM Governance Lead |
| Data Governance | `ukg-wfm-data-governance` | Architect | data dictionary, lineage model, quality rule catalog | metric definition governance lab | Enterprise WFM Architect |

## Enterprise Implementation Coverage

| Capability | Primary Repository | Coverage Level | Implementation Artifacts | Lab System | Certification Alignment |
| --- | --- | --- | --- | --- | --- |
| Implementation Playbooks | `ukg-wfm-implementation-playbooks` | Architect | implementation playbook, governance calendar, risk register | enterprise implementation simulation | Enterprise WFM Architect |
| Market Rollout | `ukg-wfm-market-rollout` | Architect | rollout wave plan, readiness dashboard, support plan | 45-facility rollout model | Enterprise WFM Architect |
| Facility Readiness | `ukg-wfm-facility-readiness` | Practitioner | readiness checklist, facility scorecard, signoff model | facility readiness assessment | WFM Operations Analyst |
| Testing Strategy | `ukg-wfm-testing-strategy` | Advanced | test strategy, scenario library, regression matrix | payroll regression test lab | UKG Configuration Analyst |
| Cutover Readiness | `ukg-wfm-cutover-readiness` | Architect | cutover plan, go/no-go checklist, rollback model | go-live readiness review | Enterprise WFM Architect |
| Post-Go-Live Support | `ukg-wfm-post-go-live-support` | Advanced | hypercare model, incident taxonomy, transition checklist | hypercare operations simulation | WFM Operations Analyst |

## Capstone Coverage

| Capstone | Domains Integrated | Primary Outcomes | Portfolio Artifacts |
| --- | --- | --- | --- |
| Workforce Operations Command Center | operations, analytics, governance, automation | executive visibility and operational control | command center architecture, dashboard specs, escalation model |
| Geofence Intelligence Platform | mobility, analytics, Power Platform, governance | location governance and exception intelligence | intake workflow, location catalog, KPI model, audit evidence |
| UKG API Developer Portal | APIs, OpenAPI, service accounts, middleware | reusable integration enablement | API catalog, OpenAPI specs, SDK, governance checklist |
| Payroll Risk Monitoring Engine | timekeeping, analytics, compliance, operations | payroll close risk reduction | risk model, scorecard, remediation workflow, executive summary |
| Workforce Analytics Control Tower | BigQuery, Power BI, KPIs, scorecards | enterprise workforce reporting system | semantic model, report specs, quality rules, KPI dictionary |
| Enterprise WFM Governance Framework | access, audit, change, standards, data | controlled and auditable WFM operations | control matrix, governance calendar, evidence model |
| Staffing Optimization System | scheduling, staffing analytics, productivity, operations | staffing risk visibility and intervention | risk scorecard, forecast signals, escalation model |

## Certification Coverage

| Certification Track | Foundation Repos | Practitioner Repos | Advanced Repos | Architect Repos |
| --- | --- | --- | --- | --- |
| WFM Operations Analyst | `ukg-wfm-core-foundations`, `ukg-wfm-healthcare-workforce-operations` | `ukg-wfm-timekeeping-architecture`, `ukg-wfm-scheduling-operations`, `ukg-wfm-exception-aging` | `ukg-wfm-payroll-risk-analytics` | `ukg-wfm-command-center` |
| UKG Configuration Analyst | `ukg-wfm-core-foundations` | `ukg-wfm-hyperfinds`, `ukg-wfm-accruals-governance`, `ukg-wfm-attendance-management` | `ukg-wfm-pay-rules-governance`, `ukg-wfm-testing-strategy` | `ukg-wfm-enterprise-standards` |
| UKG API Engineer | `ukg-wfm-enterprise-architecture-foundations` | `ukg-wfm-api-foundations` | `ukg-wfm-openapi-engineering`, `ukg-wfm-python-sdk-labs`, `ukg-wfm-webhooks` | `ukg-wfm-integration-architecture` |
| Workforce Analytics Engineer | `ukg-wfm-workforce-analytics` | `ukg-wfm-exception-reporting` | `ukg-wfm-bigquery-pipelines`, `ukg-wfm-powerbi-reporting`, `ukg-wfm-staffing-analytics` | `ukg-wfm-executive-dashboards` |
| Workforce Automation Engineer | `ukg-wfm-power-platform` | `ukg-wfm-sharepoint-operational-lists` | `ukg-wfm-power-automate-orchestration`, `ukg-wfm-governance-applications` | `ukg-wfm-operational-intelligence` |
| WFM Governance Lead | `ukg-wfm-core-foundations` | `ukg-wfm-known-locations`, `ukg-wfm-known-ip-ranges` | `ukg-wfm-change-management`, `ukg-wfm-compliance-controls` | `ukg-wfm-access-governance`, `ukg-wfm-audit-frameworks` |
| Enterprise WFM Architect | `ukg-wfm-enterprise-architecture-foundations` | `ukg-wfm-implementation-foundations` | `ukg-wfm-middleware-patterns`, `ukg-wfm-operational-scorecards` | `ukg-wfm-command-center`, `ukg-wfm-implementation-playbooks` |
