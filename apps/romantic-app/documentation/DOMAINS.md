---
version: 1.0
updated: 10.02.2026
---

# Application Domains

This document defines the core domains in the Romantic App application.

---

## 1. User Profile

**Responsibility:** User profile data management and user information.

**Key Concepts:**
- User profile data: name, age, romantic vibe
- Profile creation and updates
- Profile information storage
- User metadata
- Profile completeness tracking

**Out of Scope:**
- Authentication flows (handled by Authentication domain)
- Session management (handled by Authentication domain)
- Access control (handled by Authentication domain)

---

## 2. Authentication

**Responsibility:** User authentication, authorization, and session management.

**Key Concepts:**
- Google OAuth integration
- Email/password authentication
- Login/logout flows
- Session management
- Token handling and refresh
- Access control and authorization
- User identity verification
- Password reset flows

**Out of Scope:**
- User profile data (handled by User Profile domain)

---

## 3. Game Session

**Responsibility:** Managing game rooms and multiplayer sessions.

**Key Concepts:**
- Gaming room creation
- Room joining and leaving
- Player participation tracking
- Session state management
- Real-time synchronization between players
- Session pause/resume functionality

---

## 4. Question

**Responsibility:** Question management and delivery system.

**Key Concepts:**
- Question categories (8 categories + creative types)
- Question types (multiple choice, scale, yes/no, open text, drawing, music, trash talk)
- Difficulty levels (Easy, Medium, Hard)
- Question randomization
- Question loading and presentation

**Categories:**
- Relationship Dynamics
- Self-Discovery
- Sexual Intimacy
- Mutual Respect
- Communication and Conflicts
- Values and Life Goals
- Love Languages and Showing Affection
- Trust and Fidelity
- Creative Expression (Drawing)
- Music & Entertainment
- Fun & Games (Trash Talk)

---

## 5. Answer

**Responsibility:** Answer submission, validation, and storage.

**Key Concepts:**
- Simultaneous answer submission
- Answer validation
- Answer history tracking
- Skip and save functionality
- Time-limited responses (30 seconds to 2 minutes)

---

## 6. Scoring & Compatibility

**Responsibility:** Score calculation, win detection, and compatibility analysis.

**Key Concepts:**
- Point system (+1 for matches, 0 for no answer, -1 for mismatches)
- Difficulty-based scoring
- Win detection (first to 10 points)
- Compatibility calculation
- Category completion bonuses
- Honesty bonuses
- Real-time score updates

---

## 7. Drawing

**Responsibility:** Drawing-based questions and image recognition.

**Key Concepts:**
- Canvas interface with drawing tools
- Drawing submission and capture
- LLM image recognition integration
- Drawing comparison and matching
- Manual confirmation options

**Technical Requirements:**
- Canvas/Drawing library (Fabric.js, Konva.js, or HTML5 Canvas)
- LLM Image Recognition API

---

## 8. Music

**Responsibility:** Music-related questions and YouTube integration.

**Key Concepts:**
- Song name input and matching
- YouTube API integration
- Automatic song playback on match
- Immediate playback (regardless of game completion)

**Technical Requirements:**
- YouTube Data API v3
- YouTube player integration

---

## 9. Trash Talk

**Responsibility:** Word guessing game with voice recognition and validation.

**Key Concepts:**
- 4-word suggestion display
- Secret word selection
- Voice input capture
- LLM-based validation (letter verification, attempt tracking, cheating detection)
- 3-attempt limit
- Point deduction for failures

**Technical Requirements:**
- Voice Recognition API (Web Speech API, Google Cloud Speech-to-Text)
- LLM Text Analysis API

---

## 10. Feedback

**Responsibility:** User feedback collection and analysis.

**Key Concepts:**
- Built-in feedback module
- User insights collection
- Pain point identification
- Suggestion tracking
- Feedback analysis and iteration planning

---

## Domain Interactions

```
Authentication → User Profile (creates user profile after authentication)
Authentication → Game Session (authenticated users can create/join sessions)
User Profile → Game Session (profile data used in sessions)
Game Session → Question → Answer
Answer → Scoring & Compatibility
Question → Drawing/Music/Trash Talk (based on type)
Drawing/Music/Trash Talk → Answer
Scoring & Compatibility → Game Session (win detection)
User Profile → Feedback
```

---
