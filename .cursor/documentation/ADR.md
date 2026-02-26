# Architectural Decision Record: Linux-Inspired Micro-Frontends Architecture

## Status

**Proposed** - This ADR documents the architectural decisions for the 4Focus application's micro-frontends architecture inspired by Linux system design.

## Context

The 4Focus application is being restructured to follow a Linux-inspired micro-frontends architecture. This approach provides clear separation of concerns, modularity, and scalability while maintaining a cohesive user experience.

## Decision

We will implement a Linux-inspired micro-frontends architecture with the following core components:

### 1. Shells (User Space Applications)

**Location**: `src/shells/`

Shells are isolated, independent applications representing a complete user-facing module or "feature story". They are the equivalent of user-space applications in an operating system. Each shell is a black box with its own internal logic.

**Current Implementation**:

- `src/shells/main/` - Main application shell containing dashboard, tasks, and account features

**Characteristics**:

- **Self-contained**: Manages its own internal routing, state, and UI.
- **Isolated**: Has no direct knowledge of other shells.
- **Communicates via IPC**: Interacts with the system and other shells only through the defined `ipc` contracts and by using services provided by the `kernel` and `cross-shell` layers.

### 2. Kernel (System Core)

**Location**: `src/kernel/`

The Kernel is the absolute core of the system. It provides the foundational, low-level services required for the application to function. Shells typically do not interact with the kernel directly; instead, they use the more abstract, user-facing services provided by the `cross-shell` layer.

**Responsibilities (What goes here?):**

- **Core Services**: `src/kernel/db/` - Database connections and clients.
- **Global Styles & Layouts**: `src/kernel/style/` - The outermost app layout and global CSS resets.
- **Environment Loading**: Bootstrapping environment variables.
- **Authentication Core**: Low-level authentication state management and client setup.

### 3. IPC (Inter-Process Communication)

**Location**: `src/ipc/`

The IPC layer defines the contracts for how different parts of the system communicate. It is the "API" of the frontend, ensuring type-safe and reliable data exchange between shells, the kernel, and the backend. It contains no executable code, only definitions.

**Responsibilities (What goes here?):**

- **API Contracts**: `src/ipc/api/` - Zod schemas and type definitions for all API endpoints.
- **Environment Contracts**: `src/ipc/env/` - Type definitions for environment variables (`env.d.ts`).
- **Event Contracts**: Definitions for any cross-shell events (e.g., via a message bus).

### 4. Cross-Shell (Shared Kernel Services)

**Location**: `src/cross-shell/`

This layer contains domain-specific features, components, and hooks that are designed to be shared and used across multiple shells. It is the "user-facing" part of the kernel, providing abstractions that shells can consume directly.

**Responsibilities (What goes here?):**

- **Shared Domain Features**: `src/cross-shell/focus-session/` - Logic and UI for a core business concept used in multiple shells.

### 5. Libraries (System Libraries)

**Location**: `src/lib/` and `packages/`

Libraries are domain-agnostic, reusable code modules:

#### Current Libraries:

- **Clean API v2**: Type-safe API client with validation

#### Characteristics:

- Completely domain-agnostic
- Highly reusable across different shells
- Well-tested and stable
- Version-controlled independently

### 4. Shared Features (Kernel Extensions)

**Location**: `src/shared/`

For features that need to be shared between shells but are domain-specific:

#### Decision Framework for Shared Features:

**When to put in `src/shared/`:**

- ✅ Feature is used by multiple shells
- ✅ Feature contains domain-specific business logic
- ✅ Feature needs to maintain state consistency across shells

**When to put in `src/lib/` or `packages/`:**

- ✅ Code is completely domain-agnostic
- ✅ Code can be used in any application context
- ✅ Code has no business logic dependencies
- ✅ Code is a pure utility or primitive

**When to duplicate in each shell:**

- ✅ Feature is shell-specific but similar to others
- ✅ Feature needs different implementations per shell
- ✅ Feature is experimental and may diverge

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    4Focus Application                       │
├─────────────────────────────────────────────────────────────┤
│  Shells (User Space Applications) - src/shells/             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Main Shell  │  │ Admin Shell │  │ Mobile Shell│  ...     │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Consumes)      │ (Consumes)             │
├──────────────────┼─────────────────┼─────────────────────────┤
│  Cross-Shell (Shared Services) - src/cross-shell/           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ FocusSession│  │   NavBar    │  │  use-auth   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                  ▲                 ▲                        │
│                  │ (Abstracts)     │ (Abstracts)            │
├──────────────────┴─────────────────┴─────────────────────────┤
│  Kernel (System Core) - src/kernel/                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ DB Client   │  │ Auth State  │  │ Global CSS  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  IPC (Contracts Layer) - src/ipc/                           │
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

### Shell Development

1. **Isolation**: A shell should never import from another shell (`../../shells/other-shell`).
2. **Communication**: Use only `cross-shell` services and `ipc` contracts. Avoid direct kernel access where possible.
3. **State Management**: Each shell manages its own state independently
4. **Routing**: Use kernel routing definitions but implement shell-specific navigation

### Kernel Development

1. **Stability**: Kernel APIs should be stable and well-versioned, as changes can have wide-ranging effects.
2. **Minimality**: The kernel should remain as small as possible. Prefer implementing features in the `cross-shell` layer if they are not fundamental system services.
3. **Documentation**: All kernel services must be well-documented
4. **Testing**: Comprehensive testing for all kernel services
5. **Backward Compatibility**: Maintain backward compatibility when possible.

### Cross-Shell Development

1. **Abstraction**: Services in this layer should provide clean, easy-to-use abstractions over core kernel logic.
2. **Domain-Specific**: Code here is specific to the 4Focus domain but reusable across features.

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
├── shells/                    # User Space Applications (Isolated Features)
│   └── main/
├── kernel/                    # System Core (Low-level services)
│   ├── db/
│   └── style/
├── ipc/                       # Communication Contracts (Types, Schemas)
│   ├── api/
│   └── env/
├── cross-shell/               # Shared Kernel Services (Consumed by Shells)
│   └── focus-session/
├── lib/                       # System Libraries (Domain-agnostic)
│   └── clean-api-v2/
    └── ui/
```

## Benefits

1. **Modularity**: Clear separation of concerns and responsibilities
2. **Scalability**: Easy to add new shells and features
3. **Team Independence**: Different teams can work on different shells
4. **Maintainability**: Isolated codebases are easier to maintain
5. **Testing**: Each component can be tested independently
6. **Deployment**: Independent deployment of shells and kernel updates

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

1. **Micro-frontend Deployment**: Consider independent deployment of shells
2. **Cross-Shell Communication**: Implement an event bus defined in `ipc` for decoupled shell-to-shell communication.
3. **Shared State Management**: Consider a global state solution managed within the `cross-shell` layer.
4. **Performance**: Optimize bundle splitting and lazy loading
5. **Monitoring**: Implement comprehensive monitoring and observability

## Conclusion

This Linux-inspired architecture provides a solid foundation for scalable, maintainable micro-frontends while maintaining the benefits of a monolithic development experience. The clear separation between shells, kernel, cross-shell, ipc, and libraries ensures that the system remains flexible and extensible as it grows.
