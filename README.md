# UKG Pro WFM MCP Server

A reasoning, hydration, orchestration, and execution layer for the UKG Pro Workforce Management API ecosystem.

This project transforms UKG Pro WFM from disconnected REST endpoints into a self-sufficient operational intelligence layer capable of understanding natural language requests, resolving missing information, traversing object relationships, hydrating partial payloads, validating completeness, and returning complete operational answers.

---

## Philosophy

Traditional API integrations operate like this:

User Request
-> Endpoint Selection
-> API Response
-> Return Result

This server operates differently:

Natural Language Request
-> Intent Detection
-> Missing Input Resolution
-> Endpoint Discovery
-> Candidate Selection
-> Object Hydration
-> Relationship Traversal
-> Completeness Validation
-> Confidence Scoring
-> Full Response Generation

The objective is simple:

Never return a partial answer when additional authoritative information exists.

---

## Core Capabilities

### Natural Language Understanding

The server accepts natural language instead of requiring endpoint knowledge or object identifiers.

Examples:

- Show me the complete details of Hillcrest South including geofence configuration.
- Find the ICU employee group and hydrate all linked organizational references.
- Why did employee 12345 receive an unscheduled exception yesterday?
- Compare scheduled versus actual worked hours for the Emergency Department this week.

### Missing Input Resolution

The server automatically resolves missing information before attempting to answer.

Resolution sources include:

- prior tool results
- tenant metadata
- parent relationships
- child relationships
- search endpoints
- identifier crosswalks
- organizational context
- inferred relationships
- historical lookups

Clarification questions are only asked after all safe resolution paths have been exhausted.

### Universal Object Hydration

Search and list endpoints are treated as discovery mechanisms only.

Traditional API result:

{
  "id": 1234,
  "name": "Hillcrest South"
}

Server behavior:

1. Resolve object
2. Discover detail endpoint
3. Retrieve complete object
4. Discover referenced objects
5. Hydrate references
6. Traverse relationships
7. Validate completeness
8. Return final answer

The hydration engine applies to every object type:

- employees
- managers
- schedules
- punches
- timecards
- employee groups
- known places
- location sets
- Hyperfinds
- pay rules
- work rules
- access profiles
- accruals
- leave cases
- devices
- integrations
- workflow definitions
- business process objects
- future objects introduced by new OpenAPI specifications

### Endpoint Graph Intelligence

The server builds an internal graph of:

Nodes:

- API endpoints
- object types
- identifiers
- domains
- schemas
- tools

Relationships:

- RETURNS
- REQUIRES
- REFERENCES
- HYDRATES
- MUTATES
- LISTS
- SEARCHES
- BELONGS_TO
- HAS_PARENT
- HAS_CHILD

This graph powers:

- endpoint discovery
- hydration routing
- confidence scoring
- missing input resolution
- relationship traversal

### Confidence Engine

Every response receives a confidence classification.

CERTAIN
- unique immutable identifier
- full object hydration
- no unresolved dependencies
- no conflicting records

HIGH
- high confidence candidate
- full detail retrieved
- minor references unavailable

MEDIUM
- likely candidate
- some unresolved references

LOW
- ambiguity exists

BLOCKED
- insufficient information
- permission restrictions
- unavailable endpoint

---

## Supported Domains

- Attendance
- Common Resources
- Employee Self Service
- Forecasting
- Healthcare Productivity
- Human Capital Management
- Leave
- People
- Person Assignments
- Platform
- Scheduling
- Scheduling Setup
- Timekeeping
- Timekeeping Setup
- Timekeeping Timecards
- Timekeeping Bulk Operations
- Universal Device Manager
- Webhook Events

Additional domains are automatically discovered during catalog ingestion.

---

## Architecture

Catalog Layer
- OpenAPI ingestion
- endpoint normalization
- endpoint classification
- graph construction

Reasoning Engine
- intent detection
- entity extraction
- missing input resolution
- candidate ranking
- confidence scoring

Hydration Engine
- response graph parsing
- object hydration
- relationship traversal
- dependency discovery
- completeness validation

API Client
- OAuth authentication
- retry policies
- pagination
- rate limiting
- request tracing
- audit logging

Tool Layer
- MCP tool registration
- execution orchestration
- write safety controls
- workflow composition

---

## Execution Pipeline

Natural Language
↓
Intent Detection
↓
Entity Extraction
↓
Missing Input Resolution
↓
Discovery Endpoints
↓
Candidate Ranking
↓
Primary Endpoint Execution
↓
Response Graph Parsing
↓
Hydration Engine
↓
Completeness Validation
↓
Confidence Scoring
↓
Business Interpretation
↓
Response Formatting
↓
Audit Logging

---

## Installation

Clone Repository

git clone https://github.com/kronosguy/UKG_Pro_WFM_MCP_Server.git
cd UKG_Pro_WFM_MCP_Server

Install Dependencies

npm install

Configure Environment

cp .env.example .env

Environment Variables

UKG_BASE_URL=
UKG_CLIENT_ID=
UKG_CLIENT_SECRET=
UKG_APP_KEY=
UKG_USERNAME=
UKG_PASSWORD=
UKG_AUTH_MODE=client_credentials

Start Development Server

npm run dev

Build Production

npm run build

Execute Tests

npm test

---

## Example Queries

- Show me the complete employee profile for employee 12345 and hydrate all manager and organizational references.
- Explain every exception on employee 12345's timecard for last week.
- Investigate why employee 12345 failed geofence validation yesterday.
- Compare scheduled versus actual worked hours for ICU employees this pay period.
- Hydrate the Emergency Department employee group and identify all connected profiles and references.

---

## Write Safety Controls

Every write operation follows the same lifecycle:

Resolve Inputs
-> Hydrate Target
-> Hydrate Dependencies
-> Dry Run
-> User Confirmation
-> Execute
-> Rehydrate
-> Return Before/After State

Destructive operations cannot execute from:

- names
- search results
- partial objects
- inferred identities

Only fully hydrated targets are eligible for mutation.

---

## Audit Logging

Every operation generates an audit event containing:

- request identifier
- timestamp
- user action
- endpoint chain
- duration
- confidence score
- hydration statistics
- affected objects

---

## Configuration

Scorecard

npm run scorecard

Produces:

- docs/endpoint-scorecard.json
- docs/tool-risk-matrix.json

OpenAPI Refresh

npm run ingest

Graph Rebuild

npm run graph

---

## Project Goals

This project exists to eliminate three common problems in workforce management integrations:

1. Partial answers
2. Manual endpoint selection
3. Missing relationship awareness

The server's responsibility is not merely to call APIs.

Its responsibility is to understand the request, discover what information is missing, retrieve that information, validate it, and return the most complete answer possible from the available system of record.
