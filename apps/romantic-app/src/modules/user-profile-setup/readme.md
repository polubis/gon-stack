### User Profile & Romantic Vibe – UI Conversation Flow

This document describes the basic profile + romantic vibe multi‑step setup as a real, conversational UI flow.

---

### Overall flow

- **Step 0** – Landing  
- **Step 1** – Basic profile (name + age)  
- **Steps 2–9** – Romantic vibe traits (8 short mini‑steps)  
- **Step 10** – Summary & confirmation  

The copy below is written as if the app is talking to the user.

---

### Step 0 – Landing

- **Screen title**: “Let’s set up your relationship profile”  
- **Subcopy**: “Takes about 3–5 minutes. Your answers stay private in your room.”  

**UI conversation**

- App:  
  “We’ll start with a few basics, then some quick questions about how you are in relationships. Ready?”
- Primary button: **“Let’s go”**

---

### Step 1 – Basic profile

- **Title**: “First, tell us who you are”  
- **Fields**:
  - `Name` (input)
  - `Age` (number input)
- **Helper copy**: “Your partner will see this during games.”  

**UI conversation**

- App: “What should we call you?”  
  - Field: `Name` → User types: “Alex”
- App: “And how old are you, Alex?”  
  - Field: `Age` → User types: “29”
- Progress indicator: `Step 1 of 10 – Basics`
- Primary button: **“Continue”**

---

### Step 2 – Communication style

- **Title**: “How do you talk about problems?”  
- Progress: `Step 2 of 10 – Communication`  
- Layout: 2 stacked questions.  

**Q1 (scale)**  
- App: “When something bothers you, how likely are you to bring it up directly?”  
  - Control: 1–5 slider with labels:
    - 1 = “I almost never bring it up”
    - 5 = “I say it pretty directly”
  - Example user answer: 4

**Q2 (scale, reverse)**  
- App: “I prefer hints and vibes over direct talks about problems.”  
  - Control: 1–5 slider  
    - 1 = “Strongly disagree”
    - 5 = “Strongly agree”
  - Example answer: 2

- Secondary button: “Back”  
- Primary: **“Next trait”**

---

### Step 3 – Emotional openness

- **Title**: “How open are you emotionally?”  
- Progress: `Step 3 of 10 – Emotional openness`  

**Q1 (scale)**  
- App: “How comfortable are you sharing your fears and insecurities with a partner?”  
  - Slider 1–5 (1 = “Not comfortable”, 5 = “Very comfortable”)  
  - Example: 3

**Q2 (scale, reverse)**  
- App: “I like to keep my deeper feelings to myself.”  
  - Slider 1–5  
  - Example: 4

- Buttons as before.

---

### Step 4 – Initiative in romance

- **Title**: “Who usually starts the romance?”  
- Progress: `Step 4 of 10 – Initiative`  

**Q1 (multiple choice)**  
- App: “How often do you like to be the one who plans romantic activities?”  
  - Options:
    - “Never”
    - “Sometimes”
    - “Often”
    - “Very often”
  - Example: “Often”

**Q2 (multiple choice)**  
- App: “In an ideal relationship, who usually starts romantic gestures?”  
  - Options:
    - “Mostly my partner”
    - “We take turns”
    - “Mostly me”
  - Example: “We take turns”

---

### Step 5 – Playful vs serious tone

- **Title**: “Playful or more serious?”  
- Progress: `Step 5 of 10 – Playfulness`  

**Q1 (scale)**  
- App: “How important is playful teasing and jokes in your relationship?”  
  - Slider 1–5  
  - Example: 5

**Q2 (scale)**  
- App: “In conflicts, I prefer to keep things light and defuse with humor.”  
  - Slider 1–5  
  - Example: 3

---

### Step 6 – Planning vs spontaneity

- **Title**: “Planner or spontaneous?”  
- Progress: `Step 6 of 10 – Planning`  

**Q1 (multiple choice)**  
- App: “On a free weekend, I prefer…”  
  - “Planned dates and activities”
  - “A mix of planned and spontaneous”
  - “Mostly spontaneous decisions”
  - Example: “A mix of planned and spontaneous”

**Q2 (multiple choice)**  
- App: “Last‑minute surprises make me feel…”  
  - “Stressed”
  - “Neutral”
  - “Excited”
  - Example: “Excited”

---

### Step 7 – Physical affection comfort

- **Title**: “How do you feel about physical affection?”  
- Progress: `Step 7 of 10 – Affection`  

**Q1 (scale)**  
- App: “How comfortable are you with physical affection (hugs, cuddles, kisses) in private?”  
  - Slider 1–5  
  - Example: 5

**Q2 (multiple choice)**  
- App: “Public displays of affection (PDA) are…”  
  - “Uncomfortable”
  - “Okay in small doses”
  - “Totally fine”
  - “I enjoy them a lot”
  - Example: “Okay in small doses”

---

### Step 8 – Togetherness vs independence

- **Title**: “Time together vs time alone”  
- Progress: `Step 8 of 10 – Togetherness`  

**Q1 (numeric)**  
- App: “How many evenings per week do you ideally like to spend together?”  
  - Numeric stepper `0–7`  
  - Example: `4`

**Q2 (multiple choice)**  
- App: “In a relationship, personal alone time is…”  
  - “Not important”
  - “Somewhat important”
  - “Very important”
  - Example: “Very important”

---

### Step 9 – Conflict style

- **Title**: “When there’s conflict…”  
- Progress: `Step 9 of 10 – Conflict`  

**Q1 (multiple choice)**  
- App: “When conflict appears, I tend to…”  
  - “Avoid and hope it passes”
  - “Wait a bit, then talk”
  - “Talk about it quickly and directly”
  - Example: “Wait a bit, then talk”

**Q2 (multiple choice)**  
- App: “Raised voices in arguments make me want to…”  
  - “Shut down”
  - “Stay but feel tense”
  - “Keep talking to resolve it”
  - Example: “Stay but feel tense”

---

### Step 10 – Summary & confirmation

- **Title**: “Here’s your romantic vibe, Alex”  
- Progress: `Step 10 of 10 – Summary`  

**App shows:**

- Basic profile:
  - Name: Alex
  - Age: 29
- Romantic vibe tags (derived from scores), for example:
  - “Direct communicator”
  - “Emotionally semi‑open”
  - “Playful”
  - “Affectionate, moderate with PDA”
  - “Balanced planner / spontaneous”
  - “Needs alone time”
  - “Talks after a short pause in conflicts”

**UI conversation**

- App:  
  “This is how we’ll describe your relationship style in the game. You can change this later if you want.”
- Buttons:
  - Secondary: “Edit answers”
  - Primary: **“Save profile & start playing”**

