---
title: Dictionary
type: dictionary
scope: shared
order: 1
deps:
  refs: refs.md
---

# Dictionary

## Actors

- **[anonymous]** - Visitor without a signed-in account.
- **[user]** - Person with an account on the platform.

## Roles

- **[recruiter]** - Platform role for recruitment staff.
- **[interviewer]** - Platform role for conducting sessions.
- **[candidate]** - Platform role for exam participants.
- **[admin]** - Platform role with full application access.

## Knowledge bank

- **[knowledge_bank]** - Directory-like container for organizing **[concept]** entries.
- **[concept]** - Memo-like description of an area of knowledge that should be covered; node in a **[knowledge_bank]** graph with metadata.

## Questions

- **[question]** - Specific question derived from a linked **[concept]**.
- **[question_type]** - Format of a **[question]** answer input.
  - `single_choice` - Single option from choices labeled a, b, c, d.
  - `multi_choice` - One or more options from a choice set.
  - `open_question` - Free-text answer.
  - `linking` - Answer formed by linking items together.

## Tests

- **[test]** - Assessment template that links **[question]** entries.

## Exam

- **[exam]** - Live session instance of a **[test]**.
- **[exam_attempt]** - One participant's run of an **[exam]**.
- **[exam_statistics]** - Metrics and results data for an **[exam]**.

## Note creation

- **[interview_notes]** - Notes captured after an **[exam]**.
- **[interview_transcript]** - Transcript of the session after an **[exam]**.
- **[report]** - Summary document produced from post-exam information.
- **[feedback]** - Candidate-facing message derived from exam outcomes.

## Organization

- **[organization]** - Group where **[recruiter]** and **[interviewer]** share **[test]**, **[question]**, and **[knowledge_bank]** resources.

## Platform

- **[encrypted_data]** - Platform data protected by encryption.
- **[anonymous_data_trail]** - Activity record stored without real names.
- **[cookie_consent]** - User confirmation of cookies and policy terms.
- **[privacy_policy]** - Document describing platform data handling and user privacy.
