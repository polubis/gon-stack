---
version: 1.0
updated: 10.02.2026
---

# Romantic Vibe Profile Dimension

## 1. Purpose

The **romantic vibe** is a compact profile dimension that describes how a person tends to behave in a romantic relationship. It is set once during profile creation and used later to:

- Inform matchmaking / compatibility insights.
- Tailor question selection and tone in game sessions.
- Give each user a simple language for “how I am in relationships”.

For the MVP, romantic vibe is a lightweight, numeric representation built from a small set of questions.

## 2. Traits Included in MVP

The romantic vibe is modeled as the following traits:

- **Communication style** (direct vs subtle)
- **Emotional openness** (reserved vs expressive)
- **Initiative in romance** (passive vs proactive)
- **Playful vs serious tone**
- **Planning vs spontaneity**
- **Physical affection comfort**
- **Togetherness vs independence**
- **Conflict style** (avoidant vs confronting)

Each trait is captured via 1–2 short questions during profile creation.

## 3. Example Questions per Trait

These are example question wordings for the MVP. Exact copy can be refined later, but the structure (intent and answer types) should stay similar.

### 3.1 Communication Style

- **Q1:** “When something bothers you, how likely are you to bring it up directly?”  
  - Scale: 1–5 (1 = Very unlikely, 5 = Very likely)
- **Q2:** “I prefer hints and vibes over direct talks about problems.”  
  - Scale: 1–5 (reverse-scored)

### 3.2 Emotional Openness

- **Q1:** “How comfortable are you sharing your fears and insecurities with a partner?”  
  - Scale: 1–5 (1 = Not comfortable, 5 = Very comfortable)
- **Q2:** “I like to keep my deeper feelings to myself.”  
  - Scale: 1–5 (reverse-scored)

### 3.3 Initiative in Romance

- **Q1:** “How often do you like to be the one who plans romantic activities?”  
  - Options: Never / Sometimes / Often / Very often
- **Q2:** “In an ideal relationship, who usually starts romantic gestures?”  
  - Options: Mostly my partner / We take turns / Mostly me

### 3.4 Playful vs Serious Tone

- **Q1:** “How important is playful teasing and jokes in your relationship?”  
  - Scale: 1–5 (1 = Not important, 5 = Very important)
- **Q2:** “In conflicts, I prefer to keep things light and defuse with humor.”  
  - Scale: 1–5

### 3.5 Planning vs Spontaneity

- **Q1:** “On a free weekend, I prefer…”  
  - Options: Planned dates and activities / A mix of planned and spontaneous / Mostly spontaneous decisions
- **Q2:** “Last-minute surprises make me feel…”  
  - Options: Stressed / Neutral / Excited

### 3.6 Physical Affection Comfort

- **Q1:** “How comfortable are you with physical affection (hugs, cuddles, kisses) in private?”  
  - Scale: 1–5
- **Q2:** “Public displays of affection (PDA) are…”  
  - Options: Uncomfortable / Okay in small doses / Totally fine / I enjoy them a lot

### 3.7 Togetherness vs Independence

- **Q1:** “How many evenings per week do you ideally like to spend together?”  
  - Numeric: 0–7
- **Q2:** “In a relationship, personal alone time is…”  
  - Options: Not important / Somewhat important / Very important

### 3.8 Conflict Style

- **Q1:** “When conflict appears, I tend to…”  
  - Options: Avoid and hope it passes / Wait a bit, then talk / Talk about it quickly and directly
- **Q2:** “Raised voices in arguments make me want to…”  
  - Options: Shut down / Stay but feel tense / Keep talking to resolve it

## 4. Data Model (MVP)

For the MVP, the app:

- Stores each trait as a **numeric score** (e.g. normalized to 0–100) derived from the answers above.
- Keeps the raw answers if needed for analytics, but uses the trait scores for:
  - Simple profile summaries (e.g. “direct communicator, playful, highly affectionate”).
  - Potential future tuning of game questions or compatibility insights.

This definition is intentionally minimal and can be extended with more traits, questions, or richer interpretations in later iterations.

