# UKG Pro WFM MCP Server

A reasoning, hydration, orchestration, and execution layer for the UKG Pro Workforce Management API ecosystem.

This project transforms UKG Pro WFM from disconnected REST endpoints into a self-sufficient operational intelligence layer capable of understanding natural language requests, resolving missing information, traversing object relationships, hydrating partial payloads, validating completeness, and returning full answers.

## Core Principle

Search and list endpoints are discovery only.

The server does not return partial answers when additional authoritative detail exists.

## Core Capabilities

- Natural language understanding
- Missing input resolution
- Universal object hydration
- Relationship traversal
- Confidence scoring
- Audit logging
- Write safety controls
- Endpoint graph intelligence

## Supported Domains

- Attendance
- Common Resources
- Employee Self Service
- Forecasting
- Healthcare Productivity
- HCM
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

## Execution Pipeline

Natural Language
→ Intent Detection
→ Entity Extraction
→ Missing Input Resolution
→ Discovery Endpoints
→ Candidate Ranking
→ Primary Endpoint Execution
→ Response Graph Parsing
→ Object Hydration
→ Dependency Traversal
→ Completeness Validation
→ Confidence Scoring
→ Response Formatting
→ Audit Logging

## Quick Start

cp .env.example .env
npm install
npm run build
npm run dev

## Environment Variables

UKG_BASE_URL=
UKG_CLIENT_ID=
UKG_CLIENT_SECRET=
UKG_APP_KEY=
UKG_USERNAME=
UKG_PASSWORD=
UKG_AUTH_MODE=client_credentials

## Testing

npm test

## Scorecard

npm run scorecard

Outputs:
- docs/endpoint-scorecard.json
- docs/tool-risk-matrix.json

## Purpose

This is not a thin OpenAPI wrapper.

This is a UKG Pro WFM reasoning, hydration, and execution layer.
