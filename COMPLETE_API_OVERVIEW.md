# 🔍 Komplette API-Übersicht - Alle Änderungen

## 📁 Neue Dateien erstellt

### Backend API Services

1. **`src/services/api/roleApi.ts`** (59 Zeilen)
   - `RoleApiService` Klasse
   - Alle Role-Endpoints implementiert
   - Verwendet: `/Role/GetAllRoles`, `/Role/GetRole/{guid}`, etc.

2. **`src/services/api/actorApi.ts`** (60 Zeilen)
   - `ActorApiService` Klasse
   - Alle Actor-Endpoints implementiert
   - Verwendet: `/Actor/GetAllActors`, `/Actor/GetActor/{guid}`, etc.

3. **`src/services/api/assignmentApi.ts`** (94 Zeilen)
   - `AssignmentApiService` Klasse
   - Alle Assignment-Endpoints implementiert
   - Verwendet: `/Assignment/GetAllAssignments`, `/Assignment/CreateAssignment`, etc.

4. **`src/services/api/mappers.ts`** (150+ Zeilen)
   - Mapping-Funktionen zwischen Backend-DTOs und Frontend-Domain-Models
   - `mapPriorityFromBackend` / `mapPriorityToBackend`
   - `mapStatusFromBackend` / `mapStatusToBackend`
   - `mapAssignmentToWorkStep` / `mapWorkStepToAssignment`
   - `mapActorToUser` / `mapRoleDtoToRole`

### Mock API Services

5. **`src/services/api/mockRoleApi.ts`** (100+ Zeilen)
   - `MockRoleApiService` Klasse
   - Simuliert Role-API für Prototyping

6. **`src/services/api/mockActorApi.ts`** (100+ Zeilen)
   - `MockActorApiService` Klasse
   - Simuliert Actor-API für Prototyping

7. **`src/services/api/mockAssignmentApi.ts`** (150+ Zeilen)
   - `MockAssignmentApiService` Klasse
   - Simuliert Assignment-API für Prototyping

## 🔄 Aktualisierte Dateien

### API Services

1. **`src/services/api/index.ts`**
   ```typescript
   // NEU hinzugefügt:
   - RoleApiService | MockRoleApiService
   - ActorApiService | MockActorApiService
   - AssignmentApiService | MockAssignmentApiService
   
   // In createApiServices():
   role: new RoleApiService(apiClient),
   actor: new ActorApiService(apiClient),
   assignment: new AssignmentApiService(apiClient),
   
   // In createMockApiServices():
   role: new MockRoleApiService(),
   actor: new MockActorApiService(),
   assignment: new MockAssignmentApiService(),
   ```

2. **`src/services/api/workflowApi.ts`**
   - ✅ Verwendet jetzt `/Objective/GetAllObjectives` statt `/workflows`
   - ✅ Verwendet `/Objective/CreateObjective` statt `/workflows`
   - ✅ Verwendet `/Objective/SetObjectiveDisplayName` für Updates
   - ✅ Mapping zwischen Objective (Backend) und Workflow (Frontend)

3. **`src/services/api/workStepApi.ts`**
   - ✅ Verwendet jetzt `/Assignment/GetAllAssignments` statt `/worksteps`
   - ✅ Verwendet `/Assignment/CreateAssignment` statt `/worksteps`
   - ✅ Verwendet `/Assignment/SetAssignmentStatus` für Status-Updates
   - ✅ Verwendet `/Assignment/SetAssignmentPriority` für Priorität
   - ✅ Verwendet `/Assignment/SetAssignmentAssignee` für Zuweisungen
   - ✅ Unterstützt Multi-User-Assignment (string | string[])

4. **`src/services/api/objectiveApi.ts`**
   - ✅ Bereits vorhanden, verwendet Backend-Endpoints
   - ✅ Alle Objective-Endpoints implementiert

### Composables

5. **`src/composables/useObjective.ts`**
   - ✅ Aktualisiert für neue Backend-API-Struktur
   - ✅ Mapping zwischen ObjectiveDto und Objective Domain Model
   - ✅ Verwendet `getAllObjectives()` → gibt GUIDs zurück
   - ✅ Fetcht dann jeden Objective einzeln

### Types

6. **`src/types/api.ts`**
   - ✅ Neue DTOs hinzugefügt:
     - `RoleDto`, `CreateRoleRequest`, `UpdateRoleDisplayNameRequest`, etc.
     - `ActorDto`, `CreateActorRequest`, `UpdateActorNicknameRequest`, etc.
     - `ObjectiveDto`, `CreateObjectiveDtoRequest`, etc.
     - `AssignmentDto`, `CreateAssignmentRequest`, `UpdateAssignmentStatusRequest`, etc.

## 📊 API-Endpoint-Mapping

### Backend → Frontend Mapping

| Backend Endpoint | Frontend Service | Frontend Domain Model |
|-----------------|------------------|----------------------|
| `/Role/*` | `RoleApiService` | `Role` (enum) |
| `/Actor/*` | `ActorApiService` | `User` |
| `/Objective/*` | `ObjectiveApiService` | `Workflow` |
| `/Assignment/*` | `AssignmentApiService` | `WorkStep` |

### Priorität Mapping

| Backend | Frontend |
|---------|----------|
| `0` | `IMMEDIATE` |
| `1` | `MEDIUM_TERM` |
| `2` | `LONG_TERM` |

### Status Mapping

| Backend | Frontend |
|---------|----------|
| `0` | `PENDING` |
| `1` | `IN_PROGRESS` |
| `2` | `COMPLETED` |
| `3` | `BLOCKED` |

## 🔌 Verwendung der neuen Services

### In Composables

```typescript
import { useApi } from '@/composables/useApi'

const api = useApi()

// Role API
const roleGuids = await api.role.getAllRoles()
const role = await api.role.getRole(roleGuid)
await api.role.createRole({ displayName: 'Manager', isAdmin: false })

// Actor API
const actorGuids = await api.actor.getAllActors()
const actor = await api.actor.getActor(actorGuid)
await api.actor.createActor({ nickname: 'John', roleGuid: 'role-1' })

// Assignment API
const assignmentGuids = await api.assignment.getAllAssignments()
const assignment = await api.assignment.getAssignment(assignmentGuid)
await api.assignment.createAssignment({
  displayName: 'Task 1',
  actorGuid: 'actor-1',
  requiredRole: 'TEAM_MEMBER'
})
```

### In Components

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'

const api = useApi()

// Alle neuen Services verfügbar:
// - api.role
// - api.actor
// - api.assignment
// - api.workflow (aktualisiert)
// - api.workStep (aktualisiert)
// - api.objective
</script>
```

## 🎯 Vollständige Endpoint-Liste

### Role Endpoints (`/Role/`)
- ✅ `GET GetAllRoles` → `api.role.getAllRoles()`
- ✅ `GET GetRole/{guid}` → `api.role.getRole(guid)`
- ✅ `POST CreateRole` → `api.role.createRole(request)`
- ✅ `PATCH SetRoleDisplayName/{guid}` → `api.role.setRoleDisplayName(guid, name)`
- ✅ `PATCH SetRoleDescription/{guid}` → `api.role.setRoleDescription(guid, desc)`
- ✅ `PATCH SetRoleAdminFlag/{guid}` → `api.role.setRoleAdminFlag(guid, isAdmin)`
- ✅ `DELETE DeleteRole/{guid}` → `api.role.deleteRole(guid)`

### Actor Endpoints (`/Actor/`)
- ✅ `GET GetAllActors` → `api.actor.getAllActors()`
- ✅ `GET GetActor/{guid}` → `api.actor.getActor(guid)`
- ✅ `POST CreateActor` → `api.actor.createActor(request)`
- ✅ `PATCH SetActorNickname/{guid}` → `api.actor.setActorNickname(guid, nickname)`
- ✅ `PATCH SetActorRole/{guid}` → `api.actor.setActorRole(guid, roleGuid)`
- ✅ `GET GetAssignments` → `api.actor.getAssignments()`
- ✅ `DELETE DeleteActor/{guid}` → `api.actor.deleteActor(guid)`

### Objective Endpoints (`/Objective/`)
- ✅ `GET GetAllObjectives` → `api.objective.getAllObjectives()`
- ✅ `GET GetObjective/{guid}` → `api.objective.getObjective(guid)`
- ✅ `GET GetObjectiveAssignments/{guid}` → `api.objective.getObjectiveAssignments(guid)`
- ✅ `POST CreateObjective` → `api.objective.createObjective(request)`
- ✅ `PATCH SetObjectiveDisplayName/{guid}` → `api.objective.setObjectiveDisplayName(guid, name)`
- ✅ `PATCH SetObjectiveDescription/{guid}` → `api.objective.setObjectiveDescription(guid, desc)`
- ✅ `DELETE DeleteObjective/{guid}` → `api.objective.deleteObjective(guid)`

### Assignment Endpoints (`/Assignment/`)
- ✅ `GET GetAllAssignments` → `api.assignment.getAllAssignments()`
- ✅ `GET GetAssignment/{guid}` → `api.assignment.getAssignment(guid)`
- ✅ `POST CreateAssignment` → `api.assignment.createAssignment(request)`
- ✅ `PATCH SetAssignmentDisplayName/{guid}` → `api.assignment.setAssignmentDisplayName(guid, name)`
- ✅ `PATCH SetAssignmentDescription/{guid}` → `api.assignment.setAssignmentDescription(guid, desc)`
- ✅ `PATCH SetAssignmentStartDate/{guid}` → `api.assignment.setAssignmentStartDate(guid, date)`
- ✅ `PATCH SetAssignmentDeadlineDate/{guid}` → `api.assignment.setAssignmentDeadlineDate(guid, date)`
- ✅ `PATCH SetAssignmentAssignee/{guid}` → `api.assignment.setAssignmentAssignee(guid, actorGuid)`
- ✅ `PATCH SetAssignmentPriority/{guid}` → `api.assignment.setAssignmentPriority(guid, priority)`
- ✅ `PATCH SetAssignmentStatus/{guid}` → `api.assignment.setAssignmentStatus(guid, status)`
- ✅ `DELETE DeleteAssignment/{guid}` → `api.assignment.deleteAssignment(guid)`

## 📝 Konfiguration

### Environment Variables

**`.env.local`** (erstellt):
```env
VITE_USE_MOCK_API=true  # Standard: Mock-API aktiv
VITE_API_BASE_URL=http://localhost:8080/api
```

**Um echte Backend-API zu verwenden**:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🚀 Status

### ✅ Abgeschlossen
- [x] Alle Backend-Endpoints integriert
- [x] Mapping zwischen Backend-DTOs und Frontend-Domain-Models
- [x] Mock-Services für Prototyping
- [x] TypeScript-Typen definiert
- [x] Dependency Injection unterstützt

### ⏳ Noch zu tun (optional)
- [ ] UI-Komponenten für Role-Management
- [ ] UI-Komponenten für Actor-Management
- [ ] Composables für Role/Actor-Operationen
- [ ] Integration in bestehende Views

## 📚 Dateistruktur

```
src/services/api/
├── index.ts                    # ✅ Aktualisiert - Neue Services integriert
├── client.ts                   # HTTP Client (unverändert)
├── types.ts                    # API Config Types (unverändert)
├── roleApi.ts                  # ✅ NEU - Role API Service
├── actorApi.ts                 # ✅ NEU - Actor API Service
├── assignmentApi.ts            # ✅ NEU - Assignment API Service
├── objectiveApi.ts             # ✅ Vorhanden - Objective API Service
├── workflowApi.ts              # ✅ Aktualisiert - Verwendet Objective-Endpoints
├── workStepApi.ts              # ✅ Aktualisiert - Verwendet Assignment-Endpoints
├── mappers.ts                  # ✅ NEU - DTO ↔ Domain Model Mapper
├── mockApiClient.ts            # Mock Client (unverändert)
├── mockWorkflowApi.ts          # Mock Workflow API (unverändert)
├── mockWorkStepApi.ts          # Mock WorkStep API (unverändert)
├── mockRoleApi.ts              # ✅ NEU - Mock Role API
├── mockActorApi.ts             # ✅ NEU - Mock Actor API
└── mockAssignmentApi.ts        # ✅ NEU - Mock Assignment API
```

## 🎨 Verwendung in der Anwendung

### Aktueller Status
- **Mock-API aktiv**: Alle Services verwenden Mock-Implementierungen
- **Backend-Endpoints bereit**: Können aktiviert werden via `VITE_USE_MOCK_API=false`
- **UI-Integration**: Neue Services können in Composables/Components verwendet werden

### Beispiel-Verwendung

```typescript
// In einem Composable
import { useApi } from '@/composables/useApi'

export function useRoleManagement() {
  const api = useApi()
  
  const loadRoles = async () => {
    const roleGuids = await api.role.getAllRoles()
    const roles = await Promise.all(
      roleGuids.map(guid => api.role.getRole(guid))
    )
    return roles
  }
  
  return { loadRoles }
}
```

## ✨ Zusammenfassung

**7 neue Dateien** erstellt:
- 3 Backend API Services (role, actor, assignment)
- 3 Mock API Services (role, actor, assignment)
- 1 Mapper-Datei (DTO ↔ Domain Model)

**4 Dateien** aktualisiert:
- `index.ts` - Neue Services integriert
- `workflowApi.ts` - Verwendet Objective-Endpoints
- `workStepApi.ts` - Verwendet Assignment-Endpoints
- `useObjective.ts` - Aktualisiert für neue API-Struktur

**Alle 30+ Backend-Endpoints** integriert und bereit zur Verwendung! 🎉



