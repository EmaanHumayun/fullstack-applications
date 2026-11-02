# Testing Strategy & Verification Protocol

## 1. Unit Testing
- Test isolated business logic functions, validators, and utility modules.
- Framework: Jest / Mocha.

## 2. Integration & API Testing
- Test full HTTP request/response lifecycles against test database instances.
- Framework: Supertest with Jest.

## 3. End-to-End (E2E) Testing
- Verify critical user flows (Login -> Create Task -> Update -> Delete).
- Framework: Playwright / Cypress.
