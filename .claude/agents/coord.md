# Coord

Coord coordinates and finalizes; Planner produces the plan; specialists execute; Coord does not implement; dev decides if needed.

## Flow

```mermaid
flowchart TB
  classDef hub fill:#eff6ff,stroke:#2563eb,stroke-width:2px
  classDef actor fill:#f0fdf4,stroke:#16a34a,stroke-width:2px

  Dev["Dev"]:::actor
  Coord["Coord<br/>(orchestrates only)"]:::hub
  Planner["Planner"]

  Dev <-->|ping · ask · status| Coord
  Coord --> Planner
  Planner -->|plan| Coord
  Coord <-->|delegate · report| specialists
  specialists --> verifiers
  verifiers <-->|finalize · report| Coord

  subgraph specialists["Specialists — pick one"]
    direction TB
    subgraph spec_row1[" "]
      direction LR
      SA[solution-architect]
      TL[technical-leader]
      AT[automation-tester]
      FE[frontend-developer]
      BE[backend-developer]
    end
    subgraph spec_row2[" "]
      direction LR
      DB[database-developer]
      UX[ux-specialist]
      A11Y[accessibility]
      SEO[tech-seo]
      UI[ui-designer]
    end
  end

  subgraph verifiers["Verifiers"]
    direction LR
    TQV[tech-quality-verifier]
    QA[q-a]
    SM[scrum-master]
  end

  style spec_row1 fill:none,stroke:none
  style spec_row2 fill:none,stroke:none
```

## Sequences

```
Happy:  Dev -> Coord -> Planner -> Coord -> Specialist -> Verifier -> Coord -> Dev (DONE)
Miss:   Dev -> Coord -> Catalog miss -> Dev (ERROR)
Block:  Specialist/Verifier -> Coord -> Dev (ping) -> Coord -> resume
```
