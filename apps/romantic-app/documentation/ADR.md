# Architectural Decision Record: Modular Monolith Architecture

## Status

**Proposed** - This ADR documents the architectural decisions for the romantic-app's modular monolith architecture.

## Context

The romantic-app is being restructured to follow a modular monolith architecture. This approach provides clear separation of concerns, modularity, and scalability while maintaining a cohesive development experience within a single deployable unit.

## Decision

We will implement a modular monolith architecture with the following core components:

### 1. Modules (Feature Modules)

**Location**: `src/modules/`

Modules are isolated, independent units representing a complete user-facing feature or "feature story". Each module is a self-contained vertical slice of functionality with its own internal logic.

**Current Implementation**:

- `src/modules/main/` - Main application module containing dashboard, tasks, and account features

**Characteristics**:

- **Self-contained**: Manages its own internal routing, state, and UI.
- **Isolated**: Has no direct knowledge of other modules.
- **Communicates via Contracts**: Interacts with the system and other modules only through the defined `contracts` layer and by using services provided by the `core` and `shared` layers.

### 2. Core (Application Core)

**Location**: `src/core/`

The Core is the foundational layer of the system. It provides low-level services required for the application to function. Modules typically do not interact with the core directly; instead, they use the more abstract, feature-facing services provided by the `shared` layer.

**Responsibilities (What goes here?):**

- **Core Services**: `src/core/db/` - Database connections and clients.
- **Global Styles & Layouts**: `src/core/style/` - The outermost app layout and global CSS resets.
- **Environment Loading**: Bootstrapping environment variables.
- **Authentication Core**: Low-level authentication state management and client setup.

### 3. Contracts (Inter-Module Communication)

**Location**: `src/contracts/`

The Contracts layer defines the interfaces for how different parts of the system communicate. It is the "API" of the frontend, ensuring type-safe and reliable data exchange between modules, the core, and the backend. It contains no executable code, only definitions.

**Responsibilities (What goes here?):**

- **API Contracts**: `src/contracts/api/` - Zod schemas and type definitions for all API endpoints.
- **Environment Contracts**: `src/contracts/env/` - Type definitions for environment variables (`env.d.ts`).
- **Event Contracts**: Definitions for any cross-module events (e.g., via a message bus).

### 4. Shared (Cross-Module Services)

**Location**: `src/shared/`

This layer contains domain-specific features, components, and hooks that are designed to be shared and used across multiple modules. It provides abstractions over core services that modules can consume directly.

**Responsibilities (What goes here?):**

- **Shared Domain Features**: `src/shared/focus-session/` - Logic and UI for a core business concept used in multiple modules.

### 5. Libraries (Utility Libraries)

**Location**: `src/lib/` and `packages/`

Libraries are domain-agnostic, reusable code modules:

#### Current Libraries:

- **Clean API v2**: Type-safe API client with validation

#### Characteristics:

- Completely domain-agnostic
- Highly reusable across different modules
- Well-tested and stable
- Version-controlled independently

### 4. Shared Features (Core Extensions)

**Location**: `src/shared/`

For features that need to be shared between modules but are domain-specific:

#### Decision Framework for Shared Features:

**When to put in `src/shared/`:**

- ✅ Feature is used by multiple modules
- ✅ Feature contains domain-specific business logic
- ✅ Feature needs to maintain state consistency across modules

**When to put in `src/lib/` or `packages/`:**

- ✅ Code is completely domain-agnostic
- ✅ Code can be used in any application context
- ✅ Code has no business logic dependencies
- ✅ Code is a pure utility or primitive

**When to duplicate in each module:**

- ✅ Feature is module-specific but similar to others
- ✅ Feature needs different implementations per module
- ✅ Feature is experimental and may diverge

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application                              │
├─────────────────────────────────────────────────────────────┤
│  Modules (Feature Modules) - src/modules/                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Main Module │  │Admin Module │  │Mobile Module│  ...     │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Consumes)      │ (Consumes)             │
├──────────────────┼─────────────────┼─────────────────────────┤
│  Shared (Cross-Module Services) - src/shared/               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ FocusSession│  │   NavBar    │  │  use-auth   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Abstracts)     │ (Abstracts)            │
├──────────────────┴─────────────────┴─────────────────────────┤
│  Core (Application Core) - src/core/                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ DB Client   │  │ Auth State  │  │ Global CSS  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Contracts (Interface Layer) - src/contracts/               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ API Schemas │  │ Event Types │  │ Env Defs    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Libraries (Generic Utils) - src/lib/ & src/components/ui/  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Clean API   │  │ UI Primitives│  │  Utilities  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Guidelines

### Module Development

1. **Isolation**: A module should never import from another module (`../../modules/other-module`).
2. **Communication**: Use only `shared` services and `contracts` definitions. Avoid direct core access where possible.
3. **State Management**: Each module manages its own state independently
4. **Routing**: Use core routing definitions but implement module-specific navigation

### Core Development

1. **Stability**: Core APIs should be stable and well-versioned, as changes can have wide-ranging effects.
2. **Minimality**: The core should remain as small as possible. Prefer implementing features in the `shared` layer if they are not fundamental application services.
3. **Documentation**: All core services must be well-documented
4. **Testing**: Comprehensive testing for all core services
5. **Backward Compatibility**: Maintain backward compatibility when possible.

### Shared Development

1. **Abstraction**: Services in this layer should provide clean, easy-to-use abstractions over core logic.
2. **Domain-Specific**: Code here is specific to the romantic-app domain but reusable across features.

### Library Development

1. **Domain Agnostic**: Libraries should have no business logic
2. **Reusability**: Design for maximum reusability
3. **Testing**: Extensive unit testing
4. **Documentation**: Clear API documentation

### Shared Feature Development

1. **Justification**: Document why a feature needs to be shared
2. **Interface Design**: Design clean, stable interfaces
3. **Versioning**: Use semantic versioning for shared features
4. **Migration Path**: Provide clear migration paths for breaking changes

## File Structure

```
src/
├── modules/                   # Feature Modules (Isolated Features)
│   └── main/
├── core/                      # Application Core (Low-level services)
│   ├── db/
│   └── style/
├── contracts/                 # Communication Contracts (Types, Schemas)
│   ├── api/
│   └── env/
├── shared/                    # Cross-Module Services (Consumed by Modules)
│   └── focus-session/
├── lib/                       # Utility Libraries (Domain-agnostic)
│   └── clean-api-v2/
    └── ui/
```

## Benefits

1. **Modularity**: Clear separation of concerns and responsibilities
2. **Scalability**: Easy to add new modules and features
3. **Team Independence**: Different teams can work on different modules
4. **Maintainability**: Isolated codebases are easier to maintain
5. **Testing**: Each component can be tested independently
6. **Deployment**: Single deployable unit with well-defined internal boundaries

## Risks and Mitigations

### Risks:

1. **Over-engineering**: Risk of creating unnecessary complexity
2. **Communication Overhead**: Coordination between teams
3. **Version Management**: Managing dependencies between components

### Mitigations:

1. **Clear Guidelines**: Well-defined architectural guidelines
2. **Documentation**: Comprehensive documentation and examples
3. **Tooling**: Automated dependency management and versioning
4. **Regular Reviews**: Regular architecture reviews and refactoring

## Future Considerations

1. **Module Extraction**: Consider extracting mature modules into independent services if needed
2. **Cross-Module Communication**: Implement an event bus defined in `contracts` for decoupled module-to-module communication.
3. **Shared State Management**: Consider a global state solution managed within the `shared` layer.
4. **Performance**: Optimize bundle splitting and lazy loading
5. **Monitoring**: Implement comprehensive monitoring and observability

## Conclusion

This modular monolith architecture provides a solid foundation for scalable, maintainable applications while preserving the simplicity and cohesion of a single deployable unit. The clear separation between modules, core, shared, contracts, and libraries ensures that the system remains flexible and extensible as it grows.
