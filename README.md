<p align="center">
  <img src="docs/assets/ukg-mcp-hero.svg" alt="UKG Pro WFM MCP Server" width="100%">
</p>

<h1 align="center">UKG Pro WFM MCP Server</h1>

<p align="center">
  <strong>Self-sufficient reasoning, hydration, orchestration, and execution layer for the UKG Pro Workforce Management API ecosystem.</strong>
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="MCP Server" src="https://img.shields.io/badge/MCP-Server-2ECC71?style=for-the-badge">
  <img alt="UKG Pro WFM" src="https://img.shields.io/badge/UKG%20Pro-WFM-111827?style=for-the-badge">
  <img alt="Status" src="https://img.shields.io/badge/Status-Active-22C55E?style=for-the-badge">
</p>

---

## What This Is

This is not a thin OpenAPI wrapper.

This server is designed to behave like a UKG Pro WFM reasoning layer. It accepts natural language, determines what the user is really asking, resolves missing inputs, discovers the correct API path, hydrates partial objects, traverses references, validates completeness, scores confidence, and returns full operational answers.

---

## Core Rule

> Search and list endpoints are discovery only. They are not final truth.

If an API response contains IDs, references, partial objects, child references, parent references, profile references, or linked configuration, the server must hydrate those objects before answering.

---

## Execution Model

<table>
  <tr>
    <th>Traditional API Flow</th>
    <th>UKG Pro WFM MCP Flow</th>
  </tr>
  <tr>
    <td>User request</td>
    <td>Natural language request</td>
  </tr>
  <tr>
    <td>Pick endpoint manually</td>
    <td>Detect intent and entities</td>
  </tr>
  <tr>
    <td>Call one API</td>
    <td>Resolve missing inputs</td>
  </tr>
  <tr>
    <td>Return raw result</td>
    <td>Discover, hydrate, validate, and answer</td>
  </tr>
</table>

---

## Capabilities

| Capability | Purpose |
|---|---|
| Natural language routing | Understands operational questions without requiring endpoint knowledge |
| Missing input resolution | Finds IDs, refs, dates, employees, groups, profiles, and related objects |
| Discovery-only enforcement | Prevents list/search responses from being treated as final truth |
| Universal hydration | Pulls full detail for every reachable partial object |
| Object graph traversal | Follows parent, child, profile, group, org, and setup references |
| Completeness validation | Calculates whether the answer is complete enough to return |
| Confidence scoring | Classifies answers as CERTAIN, HIGH, MEDIUM, LOW, or BLOCKED |
| Write safety | Requires hydration, dry-run, explicit confirmation, and re-read after writes |
| Audit logging | Records source chain, duration, confidence, and affected objects |

---

## Supported Domains

| Domain | Coverage Intent |
|---|---|
| Attendance | Events, patterns, and attendance-related operational context |
| Common Resources | Shared objects, lookup values, Hyperfinds, and common references |
| Employee Self Service | Employee-facing objects and request flows |
| Forecasting | Forecast-related workforce planning data |
| Healthcare Productivity | Productivity and staffing context |
| HCM | HCM-connected workforce data |
| Leave | Leave cases, requests, balances, and related context |
| People | Person, employee, manager, job, and org details |
| Person Assignments | Assignments, roles, and workforce relationships |
| Platform | Tenant, metadata, and platform-level capabilities |
| Scheduling | Schedules, shifts, coverage, and schedule analysis |
| Scheduling Setup | Scheduling configuration and setup references |
| Timekeeping | Timekeeping objects and operational time data |
| Timekeeping Setup | Pay rules, work rules, pay codes, and setup metadata |
| Timekeeping Timecards | Timecards, punches, exceptions, totals, approvals |
| Timekeeping Bulk Operations | Controlled bulk workflows with guardrails |
| Universal Device Manager | Device and clock-related operational context |
| Webhook Events | Event subscriptions and event payload normalization |

---

## Hydration Behavior

Traditional API result:

<pre><code>{
  "id": 1234,
  "name": "Hillcrest South"
}</code></pre>

Server behavior:

<pre><code>Resolve object
→ Discover detail endpoint
→ Retrieve complete object
→ Detect references
→ Hydrate references
→ Traverse relationships
→ Validate completeness
→ Return final answer</code></pre>

This applies to every object type, not just Known Places.

---

## Confidence Levels

| Level | Meaning |
|---|---|
| CERTAIN | Unique immutable identifier, full hydration, no unresolved dependencies, no conflicts |
| HIGH | Strong candidate, full target detail, minor non-critical references unavailable |
| MEDIUM | Likely answer, but some relevant references remain unresolved |
| LOW | Ambiguous or incomplete |
| BLOCKED | Cannot proceed safely because required data, access, or endpoint is unavailable |

---

## Architecture

<table>
  <tr>
    <th>Layer</th>
    <th>Responsibilities</th>
  </tr>
  <tr>
    <td>Catalog</td>
    <td>OpenAPI ingestion, endpoint normalization, classification, endpoint graph</td>
  </tr>
  <tr>
    <td>Reasoning Engine</td>
    <td>Intent detection, entity extraction, missing input resolution, candidate ranking</td>
  </tr>
  <tr>
    <td>Hydration Engine</td>
    <td>Response graph parsing, dependency traversal, object hydration, completeness validation</td>
  </tr>
  <tr>
    <td>API Client</td>
    <td>Authentication, retries, pagination, rate limits, request tracing</td>
  </tr>
  <tr>
    <td>Tool Layer</td>
    <td>MCP tool registration, workflow composition, write safety, final answer formatting</td>
  </tr>
</table>

---

## Execution Pipeline

<pre><code>Natural Language
→ Intent Detection
→ Entity Extraction
→ Missing Input Resolution
→ Discovery Endpoint
→ Candidate Ranking
→ Primary Endpoint
→ Response Graph Parsing
→ Hydration Engine
→ Completeness Validation
→ Confidence Scoring
→ Business Interpretation
→ Response Formatting
→ Audit Logging</code></pre>

---

## Primary Tool

### ukg_wfm_ask

Use this for natural language requests.

Examples:

<pre><code>Show me the complete employee profile for employee 12345 and hydrate all manager and organizational references.

Explain every exception on employee 12345's timecard for last week.

Investigate why employee 12345 failed geofence validation yesterday.

Compare scheduled versus actual worked hours for ICU employees this pay period.

Hydrate the Emergency Department employee group and identify all connected profiles and references.</code></pre>

---

## Write Safety

Every write operation follows the same lifecycle:

<pre><code>Resolve Inputs
→ Hydrate Target
→ Hydrate Dependencies
→ Dry Run
→ Explicit Confirmation
→ Execute
→ Rehydrate
→ Return Before/After State</code></pre>

Write, delete, and bulk operations cannot execute from:

- name-only matches
- search results
- partial objects
- inferred identities
- ambiguous references

Only fully hydrated targets are eligible for mutation.

---

## Installation

Clone the repository:

<pre><code>git clone https://github.com/kronosguy/UKG_Pro_WFM_MCP_Server.git
cd UKG_Pro_WFM_MCP_Server</code></pre>

Install dependencies:

<pre><code>npm install</code></pre>

Configure environment:

<pre><code>cp .env.example .env</code></pre>

Required environment variables:

<pre><code>UKG_BASE_URL=
UKG_CLIENT_ID=
UKG_CLIENT_SECRET=
UKG_APP_KEY=
UKG_USERNAME=
UKG_PASSWORD=
UKG_AUTH_MODE=client_credentials</code></pre>

Start development server:

<pre><code>npm run dev</code></pre>

Build production:

<pre><code>npm run build</code></pre>

Run tests:

<pre><code>npm test</code></pre>

---

## Scorecard

Generate endpoint intelligence and risk outputs:

<pre><code>npm run scorecard</code></pre>

Outputs:

- docs/endpoint-scorecard.json
- docs/tool-risk-matrix.json

---

## Project Goals

This project exists to eliminate three common problems in workforce management integrations:

1. Partial answers
2. Manual endpoint selection
3. Missing relationship awareness

The server's responsibility is not merely to call APIs.

Its responsibility is to understand the request, discover what information is missing, retrieve that information, validate it, and return the most complete answer possible from the available system of record.
