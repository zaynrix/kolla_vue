# Frontend Architecture Documentation

## Overview

This project follows the **MVVM (Model-View-ViewModel)** architectural pattern combined with **Clean Architecture** principles. The architecture ensures clear separation of concerns, high testability, and easy modifiability.

## Architecture Layers

### 1. Model Layer (`/src/stores`)

**Purpose**: Business logic and domain data. Models contain the core business logic and state that is independent of any UI.

**Responsibilities**:
- Store domain models (Workflows, Objectives, Users, Notifications)
- Manage application state reactively
- Contain business logic (priority calculation, validation, etc.)
- No UI or View dependencies for high testability
- Priority calculation logic (immediate: ≤8h, medium-term: ≤32h, long-term: >32h)

**MVVM Principle**: Models are accessed only through ViewModels. Views never directly access Models.

**Stores (Models)**:
- `workflow.ts` - Workflow Model: stores workflow state and business logic
- `workStep.ts` - WorkStep Model: stores work step state with priority logic
- `objective.ts` - Objective Model: stores objective state with priority calculation
- `user.ts` - User Model: stores user and role state
- `notification.ts` - Notification Model: stores notification state

**Key Features**:
- Reactive state updates via Vue reactivity system
- Observer pattern for real-time updates
- Domain models independent of UI and Views
- Pure business logic, no presentation concerns

### 2. ViewModel Layer (`/src/composables`)

**Purpose**: Presentation logic and state management that connects Views to Models. ViewModels expose reactive state and commands that Views bind to.

**Responsibilities**:
- Expose reactive state to Views (computed properties, refs)
- Expose commands/actions that Views can call
- Transform Model data for presentation
- Handle data fetching and API communication
- Manage View-specific state (loading, errors, filters)
- Coordinate between Views and Models

**MVVM Principle**: ViewModels are the bridge between Views and Models. Views only interact with ViewModels, never directly with Models.

**Composables (ViewModels)**:
- `useWorkflow.ts` - Workflow ViewModel: exposes workflows state, loading, error, and commands (load, create, update, delete)
- `useObjective.ts` - Objective ViewModel: exposes objectives state, filtering, prioritization, and commands
- `useWorkStep.ts` - WorkStep ViewModel: exposes work steps state and commands
- `useActor.ts` - Actor ViewModel: exposes actors state and commands
- `useRole.ts` - Role ViewModel: exposes roles state and commands
- `usePriority.ts` - Priority calculation ViewModel helper
- `useWorkflowManager.ts` - WorkflowManager ViewModel: exposes manager-specific state and commands
- `useAuthorization.ts` - Authorization ViewModel: exposes authorization checks
- `useApi.ts` - Dependency injection for API services

**Key Features**:
- Expose reactive state via computed properties and refs
- Expose commands as functions that Views can call
- Dependency Injection via `provide/inject` for testability
- Reusable across multiple Views
- Observer pattern for reactive updates (Vue reactivity)
- No direct DOM manipulation (MVVM principle)

### 3. View Layer (`/src/components` and `/src/views`)

**Purpose**: Pure UI presentation and user interaction. Views are purely presentational and bind to ViewModels.

**MVVM Principle**: Views contain only templates and minimal presentation logic. All business logic and state management is handled by ViewModels.

#### View Components (`/src/components/containers`)
**View Components** - Presentational components that bind to ViewModels
- Use ViewModel composables to access state and commands
- Contain only template and minimal presentation logic
- Delegate all business logic to ViewModels
- Examples: `WorkflowListContainer.vue`, `ObjectiveListContainer.vue`, `WorkflowDetailsPanel.vue`

#### Reusable UI Components (`/src/components/presenters`)
**Reusable UI Components** - Pure presentation components
- Receive props and emit events only
- No business logic, no ViewModel dependencies
- Highly reusable and testable
- Examples: `ObjectiveCard.vue`, `ObjectiveList.vue`, `WorkflowCard.vue`, `WorkStepCard.vue`

#### Page Views (`/src/views`)
**Page Views** - Top-level route components
- Orchestrate View components
- Use ViewModels for page-level state
- Examples: `WorkflowsView.vue`, `ActorDashboardView.vue`, `WorkflowManagerDashboardView.vue`

**Key Features**:
- Views are purely presentational (MVVM principle)
- All state and commands come from ViewModels
- Strategy pattern via slots for flexible rendering (table, cards, diagrams)
- Component composition for reusability
- Clear separation: View ↔ ViewModel ↔ Model

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

**Purpose**: TypeScript type definitions for domain models and API contracts.

**MVVM Note**: TypeScript types are compile-time only and can be imported in any layer (View, ViewModel, Model) for type safety. This does NOT violate MVVM principles. The MVVM restriction applies to **runtime Models (Stores)**, not type definitions.

**Files**:
- `domain.ts` - Domain model type definitions (interfaces, enums: Workflow, WorkStep, User, Notification, Priority, TaskStatus, etc.)
- `api.ts` - API DTO type definitions (CreateWorkflowRequest, UpdateWorkStepRequest, etc.)
- `authorization.ts` - Authorization type definitions (Permission, AuthorizationResult, etc.)

**Usage**:
- ✅ **Views can import types** for props, events, and local variables
- ✅ **ViewModels can import types** for function parameters and return types
- ✅ **Models can import types** for store state and actions
- ❌ **Views should NOT import Stores** (runtime Models) - use ViewModels instead

## Key Patterns

### 1. MVVM (Model-View-ViewModel) Pattern
- **Model**: Business logic and domain data (Stores)
- **View**: Pure presentation (Components/Views)
- **ViewModel**: Presentation logic and state (Composables)
- **Data Binding**: Views bind to ViewModels via Vue reactivity
- **Benefit**: Clear separation of concerns, testability, maintainability

**MVVM Data Flow**:
```
View (Component) 
  ↓ binds to
ViewModel (Composable) 
  ↓ uses
Model (Store)
```

**Rules**:
- Views only interact with ViewModels, never directly with Models (Stores)
- ViewModels expose reactive state and commands to Views
- Models (Stores) contain business logic and are accessed only through ViewModels
- **TypeScript types** can be imported in any layer for type safety (compile-time only, no runtime dependency)

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

## MVVM Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                          │
│  (Components/Views - Pure Presentation)                    │
│                                                             │
│  View Component binds to ViewModel via:                    │
│  - Reactive state: {{ viewModel.data }}                    │
│  - Commands: @click="viewModel.command()"                  │
└────────────────────────────┬────────────────────────────────┘
                             │ binds to
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      VIEWMODEL LAYER                         │
│  (Composables - Presentation Logic)                         │
│                                                             │
│  ViewModel exposes:                                         │
│  - Reactive state (computed, ref)                          │
│  - Commands (functions)                                     │
│  - Transforms Model data for View                          │
└────────────────────────────┬────────────────────────────────┘
                             │ uses
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        MODEL LAYER                          │
│  (Stores - Business Logic & Data)                          │
│                                                             │
│  Model contains:                                            │
│  - Domain state                                            │
│  - Business logic                                          │
│  - No UI dependencies                                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    Backend API (via Services)
```

**Reactive Updates**:
1. User action in View → calls ViewModel command
2. ViewModel command → updates Model
3. Model change → reactive update propagates to ViewModel
4. ViewModel change → reactive update propagates to View
5. View automatically updates (Vue reactivity)

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
├── views/               # Page Views (top-level route components)
│   ├── WorkflowsView.vue
│   ├── ActorDashboardView.vue
│   └── WorkflowManagerDashboardView.vue
├── components/
│   ├── containers/      # View Components (bind to ViewModels)
│   │   ├── WorkflowListContainer.vue
│   │   ├── ObjectiveListContainer.vue
│   │   └── WorkflowDetailsPanel.vue
│   └── presenters/      # Reusable UI Components (pure presentation)
│       ├── WorkflowCard.vue
│       ├── ObjectiveCard.vue
│       └── WorkStepCard.vue
├── composables/         # ViewModel Layer (presentation logic)
│   ├── useWorkflow.ts   # Workflow ViewModel
│   ├── useObjective.ts  # Objective ViewModel
│   ├── useWorkStep.ts   # WorkStep ViewModel
│   └── useApi.ts        # Dependency injection
├── stores/              # Model Layer (business logic & data)
│   ├── workflow.ts      # Workflow Model
│   ├── workStep.ts      # WorkStep Model
│   └── objective.ts     # Objective Model
├── services/
│   └── api/            # API Service Layer
├── types/              # TypeScript type definitions (shared across all layers)
│   ├── domain.ts       # Domain model types (interfaces, enums)
│   ├── api.ts         # API DTO types
│   └── authorization.ts # Authorization types
└── main.ts            # Application entry point
```

## MVVM Usage Examples

### View Component Using ViewModel (MVVM Pattern)

```vue
<template>
  <!-- View: Pure presentation, binds to ViewModel -->
  <div class="workflow-list-view">
    <div v-if="viewModel.loading">Loading...</div>
    <div v-else-if="viewModel.error">Error: {{ viewModel.error.message }}</div>
    <div v-else>
      <WorkflowCard
        v-for="workflow in viewModel.workflows"
        :key="workflow.id"
        :workflow="workflow"
        @edit="viewModel.handleEdit"
        @delete="viewModel.handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useWorkflow } from '@/composables/useWorkflow' // ViewModel
import WorkflowCard from '@/components/presenters/WorkflowCard.vue' // Reusable UI

// ViewModel: Exposes state and commands
const viewModel = useWorkflow()

// Load data on mount
onMounted(() => {
  viewModel.loadWorkflows()
})
</script>
```

### ViewModel Implementation (Composable)

```typescript
// ViewModel: useWorkflow.ts
import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow' // Model
import { useApi } from './useApi'

export function useWorkflow() {
  const store = useWorkflowStore() // Access Model
  const api = useApi()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Expose reactive state to View
  const workflows = computed(() => store.workflows)
  
  // Expose commands to View
  const loadWorkflows = async () => {
    loading.value = true
    try {
      const data = await api.workflow.getAllWorkflows()
      store.setWorkflows(data) // Update Model
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return {
    // Reactive state
    workflows,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    // Commands
    loadWorkflows,
  }
}
```

### Model Implementation (Store)

```typescript
// Model: workflow.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workflow } from '@/types/domain'

export const useWorkflowStore = defineStore('workflow', () => {
  // Domain state
  const workflows = ref<Workflow[]>([])

  // Business logic
  function setWorkflows(newWorkflows: Workflow[]) {
    workflows.value = newWorkflows
  }

  return {
    workflows,
    setWorkflows,
  }
})
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



