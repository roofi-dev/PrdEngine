# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed, specific, and unambiguous Product Requirements Document (PRD) in Markdown format, based on an initial user prompt and subsequent clarifying answers. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature without any guesswork.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask only the most essential clarifying questions needed to write a clear PRD. Limit questions to 3-5 critical gaps in understanding. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below. The PRD must be highly specific, detailed, and unambiguous. Avoid generic statements — every requirement should be concrete and measurable.
4.  **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to write a clear PRD. Focus on areas where the initial prompt is ambiguous or missing essential context. Common areas that may need clarification:

*   **Problem/Goal:** If unclear - "What problem does this feature solve for the user?"
*   **Core Functionality:** If vague - "What are the key actions a user should be able to perform?"
*   **Target Audience:** If unstated - "Who are the primary and secondary users of this feature?"
*   **Platform/Device:** If ambiguous - "Which platforms should this feature support (web, mobile, desktop)?"
*   **Scope/Boundaries:** If broad - "Are there any specific things this feature *should not* do?"
*   **Success Criteria:** If unstated - "How will we know when this feature is successfully implemented?"
*   **Integration/Dependencies:** If relevant - "Does this feature need to integrate with any existing systems or third-party services?"
*   **Priority/Timeline:** If needed - "Is this an MVP feature or a future enhancement?"

**Important:** Only ask questions when the answer isn't reasonably inferable from the initial prompt. Prioritize questions that would significantly impact the PRD's clarity. Never ask more than 5 questions.

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"
- Each question must be directly tied to a gap in the initial prompt — do not ask generic questions

### Example Format

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Generate additional revenue

2. Who is the target user for this feature?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the expected timeline for this feature?
   A. Urgent (1-2 weeks)
   B. High priority (3-4 weeks)
   C. Standard (1-2 months)
   D. Future consideration (3+ months)
```

## PRD Structure

The generated PRD should include the following sections. Each section must be detailed, specific, and unambiguous:

1.  **Introduction/Overview:** Describe the feature and the problem it solves. State the goal clearly. Include:
    - What the product/feature is (1-2 sentences)
    - Who the target users are (specific personas, not generic "users")
    - What core problem it solves (specific pain points)
    - The value proposition (what makes it different/better)
    - Target platform(s) (web, iOS, Android, desktop, etc.)

2.  **Goals:** List specific, measurable objectives. Each goal must be:
    - Concrete and quantifiable (e.g., "Reduce onboarding time from 10 minutes to under 3 minutes" not "Improve onboarding")
    - Tied to user outcomes, not implementation details
    - Prioritized (P0 = must-have, P1 = should-have, P2 = nice-to-have)

3.  **User Stories:** Detail user narratives in the format:
    - "As a [specific user type], I want to [action] so that [benefit]"
    - Include acceptance criteria for each story (Given/When/Then format where applicable)
    - Cover both happy path and edge cases
    - Group by user role if multiple roles exist

4.  **Functional Requirements:** List specific functionalities the feature must have. Use clear, concise language. Each requirement must:
    - Be numbered (FR-001, FR-002, etc.)
    - Start with "The system shall..." or "The system must..."
    - Be testable (a developer can write a test for it)
    - Include specific business rules where applicable (e.g., "The system shall enforce a minimum password length of 12 characters")
    - Be categorized by module/feature area
    - Mark MVP vs. post-MVP requirements explicitly

5.  **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include. Be specific:
    - List specific features/capabilities that are explicitly excluded
    - Explain why each is out of scope (e.g., "Not needed for MVP", "Deferred to Phase 2")
    - This prevents scope creep and misalignment

6.  **Design Considerations (Optional):** Describe UI/UX requirements:
    - Key user flows (step-by-step)
    - Specific UI components needed (e.g., "A multi-step wizard with progress indicator")
    - Responsive behavior requirements (mobile, tablet, desktop breakpoints)
    - Accessibility requirements (WCAG level, screen reader support, etc.)
    - Reference any existing design system or component library

7.  **Technical Considerations (Optional):** Mention technical constraints and dependencies:
    - Required integrations (e.g., "Must integrate with existing Auth module using OAuth 2.0")
    - Performance requirements (e.g., "Page load under 2 seconds on 3G networks")
    - Security requirements (e.g., "All API endpoints must require JWT authentication")
    - Data storage requirements (e.g., "User data must be encrypted at rest")
    - Third-party services/APIs needed
    - Known constraints or limitations

8.  **Data Model:** Outline the main data entities:
    - List each table/entity with its key columns and data types
    - Specify relationships (one-to-many, many-to-many) with foreign keys
    - Include any indexes needed for performance
    - Note any data migration requirements
    - Example format:
      ```
      Table: users
      - id (UUID, PK)
      - email (VARCHAR(255), UNIQUE, NOT NULL)
      - role (ENUM: 'admin', 'user', 'guest')
      - created_at (TIMESTAMP, DEFAULT NOW())
      Relationships: one-to-many with `orders`
      ```

9.  **Success Metrics:** Define how success will be measured. Each metric must be:
    - Quantifiable (e.g., "Increase user engagement by 10% within 3 months")
    - Tied to a specific tool/method of measurement (e.g., "Measured via Google Analytics")
    - Include baseline and target values where possible
    - Categorized by type (adoption, engagement, performance, business)

10. **Phases / Development Plan:** Propose a phased development plan:
    - Break down into 3-5 phases
    - Each phase must have: name, goal, list of features/tickets, estimated duration
    - Mark which phase is MVP
    - Include dependencies between phases
    - Example:
      ```
      Phase 1 (MVP) — Core Foundation (2-3 weeks)
      Goal: Enable basic user registration and profile creation
      Features: FR-001, FR-002, FR-003
      Dependencies: None

      Phase 2 — Enhanced Features (3-4 weeks)
      Goal: Add social features and notifications
      Features: FR-004, FR-005, FR-006
      Dependencies: Phase 1 complete
      ```

11. **Open Questions:** List any remaining questions or areas needing further clarification:
    - Number each question
    - Explain why it's still open
    - Suggest who might be able to answer it (e.g., "Needs input from design team")

## Detail & Specificity Guidelines

To ensure the PRD is actionable and unambiguous, follow these rules:

- **Be concrete, not generic:** Instead of "The system should handle user authentication," write "The system shall authenticate users via email/password and Google OAuth 2.0. Passwords must be hashed using bcrypt with a cost factor of 12."
- **Include numbers and thresholds:** Specify exact limits, timeouts, pagination sizes, etc. (e.g., "API responses must be returned within 500ms for 95th percentile requests")
- **Define edge cases:** Mention what happens when things go wrong (e.g., "If the payment gateway is unavailable, the system shall queue the transaction and retry 3 times with exponential backoff")
- **Avoid vague language:** Do not use words like "maybe," "possibly," "might," "could," "some," "various." Use definitive language.
- **Specify formats:** When mentioning data, specify the format (e.g., "Dates must be in ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ")
- **Reference specific standards:** Where applicable, reference specific standards (e.g., "REST API following OpenAPI 3.0 specification", "WCAG 2.1 AA compliance")

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose, core logic, and expected behavior without needing to ask follow-up questions.

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/tasks/`
*   **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions before generating
3. Take the user's answers to the clarifying questions and use them to make the PRD more specific
4. Every section must be detailed enough that a junior developer can implement it without asking additional questions
5. If any information is missing after clarifying questions, note it in the "Open Questions" section rather than making assumptions
