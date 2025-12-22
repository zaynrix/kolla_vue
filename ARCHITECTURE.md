# Frontend Architecture Documentation

## Overview

This project follows the **MVVM (Model-View-ViewModel)** architectural pattern combined with **Clean Architecture** principles. The architecture ensures clear separation of concerns, high testability, and easy modifiability.

## Architecture Layers

### 1. Model Layer (`/src/stores`)

**Purpose**: Centralized reactive state management using Pinia.

**Responsibilities**:
- Store domain models (Workflows, Objectives, Users, Notifications)
- Manage application state reactively
- No UI or technical dependencies for high testability
- Priority calculation logic (immediate: ≤8h, medium-term: ≤32h, long-term: >32h)

**Stores**:
- `workflow.ts` - Workflow state management
- `objective.ts` - Objective/Task state management with priority logic
- `user.ts` - User and role management
- `notification.ts` - Notification state management

**Key Features**:
- Reactive state updates via Vue reactivity system
- Observer pattern for real-time updates
- Domain models independent of UI

### 2. ViewModel Layer (`/src/composables`)

**Purpose**: Business logic and data transformation between Model and View.

**Responsibilities**:
- Encapsulate reusable business logic
- Handle data fetching and API communication
- Transform data for presentation
- Event handling and state updates

**Composables**:
- `usePriority.ts` - Priority calculation based on deadline and duration
- `useWorkflow.ts` - Workflow operations, filtering, and management
- `useObjective.ts` - Objective operations, filtering, and prioritization
- `useApi.ts` - Dependency injection for API services

**Key Features**:
- Dependency Injection via `provide/inject` for testability
- Reusable logic across components
- Observer pattern for reactive updates

### 3. View Layer (`/src/components`)

**Purpose**: UI presentation and user interaction.

**Structure**: **Container-Presenter Pattern** (Smart/Dumb Components)

#### Presenters (`/src/components/presenters`)
**Dumb Components** - Pure presentation, no business logic
- Receive props and emit events
- Highly reusable and testable
- Examples: `ObjectiveCard.vue`, `ObjectiveList.vue`, `WorkflowCard.vue`

#### Containers (`/src/components/containers`)
**Smart Components** - Handle state and business logic
- Use ViewModel composables
- Delegate presentation to Presenters
- Examples: `ObjectiveListContainer.vue`, `WorkflowListContainer.vue`

**Key Features**:
- Strategy pattern via slots for flexible rendering (table, cards, diagrams)
- Component composition for reusability
- Clear separation of concerns

## Service Layer (`/src/services`)

**Purpose**: Backend communication and API abstraction.

**Structure**:
- `api/client.ts` - HTTP client with error handling
- `api/workflowApi.ts` - Workflow API service
- `api/objectiveApi.ts` - Objective API service
- `api/index.ts` - Service factory with dependency injection

**Key Features**:
- Dependency Injection for testability (mockable)
- Type-safe API calls
- Centralized error handling
- Support for REST API communication

## Type System (`/src/types`)

**Purpose**: Type definitions for domain models and API contracts.

**Files**:
- `domain.ts` - Domain models (Objective, Workflow, User, Notification, etc.)
- `api.ts` - API DTOs (CreateObjectiveRequest, UpdateObjectiveRequest, etc.)

## Key Patterns

### 1. Container-Presenter Pattern
- **Container**: Handles state, business logic, data fetching
- **Presenter**: Pure presentation, receives props, emits events
- **Benefit**: Separation of concerns, testability, reusability

### 2. Dependency Injection
- API services injected via `provide/inject`
- Enables mocking in tests
- Flexible service configuration

### 3. Observer Pattern
- Vue reactivity system for real-time updates
- Model → ViewModel → View reactive flow
- Automatic UI updates on state changes

### 4. Strategy Pattern
- Flexible rendering via slots
- Different views (table, cards, diagrams) without component changes
- Example: `ObjectiveList` with slot-based renderer

### 5. Component Composition
- Reusable UI components via slots
- Flexible component composition
- Example: `ObjectiveCard` with action slot

## Data Flow

```
Backend API → API Service → ViewModel (Composable) → Model (Store) → View (Component)
                                                          ↓
                                                    Reactive Update
                                                          ↓
                                                    View Updates Automatically
```

## Priority Calculation

Priority is calculated based on hours until deadline:
- **IMMEDIATE**: ≤8 hours
- **MEDIUM_TERM**: ≤32 hours
- **LONG_TERM**: >32 hours

This logic is implemented in:
- `stores/objective.ts` - Store-level priority calculation
- `composables/usePriority.ts` - Composable for priority calculation

## Testing Strategy

### Unit Tests
- **Stores**: Test state management and actions
- **Composables**: Test business logic with mocked API services
- **Presenters**: Test rendering with props and events

### Integration Tests
- **Containers**: Test integration between ViewModel and View
- **API Services**: Test with mocked HTTP client

### Mocking
- API services can be mocked via dependency injection
- Use `provideApi()` with mock services in tests

## Environment Configuration

API base URL is configured via environment variable:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Default: `http://localhost:8080/api`

## File Structure

```
src/
├── components/
│   ├── containers/       # Smart components (state + logic)
│   └── presenters/       # Dumb components (presentation only)
├── composables/          # ViewModel layer (business logic)
├── services/
│   └── api/             # API service layer
├── stores/              # Model layer (Pinia stores)
├── types/               # TypeScript type definitions
│   ├── domain.ts        # Domain models
│   └── api.ts          # API DTOs
└── main.ts             # Application entry point
```

## Usage Examples

### Using a Container Component

```vue
<template>
  <ObjectiveListContainer
    :workflow-id="workflowId"
    :show-prioritized="true"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>
```

### Using Composables

```typescript
import { useWorkflow } from '@/composables/useWorkflow'

const { workflows, loading, loadWorkflows } = useWorkflow()
await loadWorkflows()
```

### Custom Renderer Strategy

```vue
<ObjectiveListContainer>
  <template #renderer="{ objectives, onEdit, onDelete }">
    <!-- Custom table renderer -->
    <table>
      <tr v-for="obj in objectives" :key="obj.id">
        <td>{{ obj.title }}</td>
        <td><button @click="onEdit(obj.id)">Edit</button></td>
      </tr>
    </table>
  </template>
</ObjectiveListContainer>
```

## Benefits

1. **Modifiability**: GUI changes affect only View layer (new GUI in <2h)
2. **Testability**: Clear separation allows unit testing of each layer
3. **Reusability**: Composables and Presenters are highly reusable
4. **Maintainability**: Clear structure and separation of concerns
5. **Scalability**: Architecture supports growth and new features



