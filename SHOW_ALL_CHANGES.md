# 📋 ALLE ÄNDERUNGEN - Vollständige Übersicht

## 🆕 NEUE DATEIEN (7 Dateien)

### Backend API Services
1. ✅ `src/services/api/roleApi.ts` (59 Zeilen)
   - RoleApiService Klasse
   - Endpoints: GetAllRoles, GetRole, CreateRole, SetRoleDisplayName, SetRoleDescription, SetRoleAdminFlag, DeleteRole

2. ✅ `src/services/api/actorApi.ts` (60 Zeilen)
   - ActorApiService Klasse
   - Endpoints: GetAllActors, GetActor, CreateActor, SetActorNickname, SetActorRole, GetAssignments, DeleteActor

3. ✅ `src/services/api/assignmentApi.ts` (94 Zeilen)
   - AssignmentApiService Klasse
   - Endpoints: GetAllAssignments, GetAssignment, CreateAssignment, SetAssignmentDisplayName, SetAssignmentDescription, SetAssignmentStartDate, SetAssignmentDeadlineDate, SetAssignmentAssignee, SetAssignmentPriority, SetAssignmentStatus, DeleteAssignment

4. ✅ `src/services/api/mappers.ts` (173 Zeilen)
   - Mapping-Funktionen zwischen Backend-DTOs und Frontend-Domain-Models
   - mapPriorityFromBackend/ToBackend
   - mapStatusFromBackend/ToBackend
   - mapAssignmentToWorkStep/FromWorkStep
   - mapActorToUser
   - mapRoleDtoToRole

### Mock API Services
5. ✅ `src/services/api/mockRoleApi.ts` (100+ Zeilen)
   - MockRoleApiService für Prototyping

6. ✅ `src/services/api/mockActorApi.ts` (100+ Zeilen)
   - MockActorApiService für Prototyping

7. ✅ `src/services/api/mockAssignmentApi.ts` (150+ Zeilen)
   - MockAssignmentApiService für Prototyping

## 🔄 AKTUALISIERTE DATEIEN (4 Dateien)

### 1. `src/services/api/index.ts`
**Änderungen:**
- ✅ Neue Services importiert (RoleApiService, ActorApiService, AssignmentApiService)
- ✅ Neue Mock-Services importiert
- ✅ ApiServices Interface erweitert um: role, actor, assignment
- ✅ createApiServices() erweitert um neue Services
- ✅ createMockApiServices() erweitert um Mock-Services

### 2. `src/services/api/workflowApi.ts`
**Änderungen:**
- ✅ getAllWorkflows() → verwendet `/Objective/GetAllObjectives`
- ✅ getWorkflowById() → verwendet `/Objective/GetObjective/{id}`
- ✅ createWorkflow() → verwendet `/Objective/CreateObjective`
- ✅ updateWorkflow() → verwendet `/Objective/SetObjectiveDisplayName` und `/Objective/SetObjectiveDescription`
- ✅ deleteWorkflow() → verwendet `/Objective/DeleteObjective`

### 3. `src/services/api/workStepApi.ts`
**Änderungen:**
- ✅ getAllWorkSteps() → verwendet `/Assignment/GetAllAssignments`
- ✅ getWorkStepById() → verwendet `/Assignment/GetAssignment/{id}`
- ✅ createWorkStep() → verwendet `/Assignment/CreateAssignment`
- ✅ updateWorkStep() → verwendet mehrere PATCH-Endpoints:
  - SetAssignmentDisplayName
  - SetAssignmentDescription
  - SetAssignmentAssignee
  - SetAssignmentStatus
  - SetAssignmentPriority
- ✅ assignWorkStep() → verwendet `/Assignment/SetAssignmentAssignee`
- ✅ getAvailableActors() → verwendet `/Actor/GetAllActors` und `/Role/GetRole`
- ✅ deleteWorkStep() → verwendet `/Assignment/DeleteAssignment`
- ✅ getWorkStepsByWorkflow() → verwendet `/Objective/GetObjectiveAssignments`
- ✅ getAssignedWorkSteps() → verwendet `/Actor/GetAssignments`

### 4. `src/composables/useObjective.ts`
**Änderungen:**
- ✅ loadObjectives() → mapped ObjectiveDto zu Objective Domain Model
- ✅ loadObjectivesByWorkflow() → verwendet getObjectiveAssignments()
- ✅ createObjective() → mapped CreateObjectiveRequest zu CreateObjectiveDtoRequest
- ✅ updateObjective() → verwendet SetObjectiveDisplayName und SetObjectiveDescription

### 5. `src/types/api.ts`
**Neue Types hinzugefügt:**
- ✅ RoleDto, CreateRoleRequest, UpdateRoleDisplayNameRequest, UpdateRoleDescriptionRequest, UpdateRoleAdminFlagRequest
- ✅ ActorDto, CreateActorRequest, UpdateActorNicknameRequest, UpdateActorRoleRequest
- ✅ ObjectiveDto, CreateObjectiveDtoRequest, UpdateObjectiveDisplayNameRequest, UpdateObjectiveDescriptionRequest
- ✅ AssignmentDto, CreateAssignmentRequest, UpdateAssignmentDisplayNameRequest, UpdateAssignmentDescriptionRequest, UpdateAssignmentStartDateRequest, UpdateAssignmentDeadlineDateRequest, UpdateAssignmentAssigneeRequest, UpdateAssignmentPriorityRequest, UpdateAssignmentStatusRequest

## 📊 ENDPOINT-MAPPING

| Backend Endpoint | Frontend Service | Methode |
|-----------------|------------------|---------|
| `/Role/GetAllRoles` | `api.role.getAllRoles()` | GET |
| `/Role/GetRole/{guid}` | `api.role.getRole(guid)` | GET |
| `/Role/CreateRole` | `api.role.createRole(request)` | POST |
| `/Role/SetRoleDisplayName/{guid}` | `api.role.setRoleDisplayName(guid, name)` | PATCH |
| `/Role/SetRoleDescription/{guid}` | `api.role.setRoleDescription(guid, desc)` | PATCH |
| `/Role/SetRoleAdminFlag/{guid}` | `api.role.setRoleAdminFlag(guid, isAdmin)` | PATCH |
| `/Role/DeleteRole/{guid}` | `api.role.deleteRole(guid)` | DELETE |
| `/Actor/GetAllActors` | `api.actor.getAllActors()` | GET |
| `/Actor/GetActor/{guid}` | `api.actor.getActor(guid)` | GET |
| `/Actor/CreateActor` | `api.actor.createActor(request)` | POST |
| `/Actor/SetActorNickname/{guid}` | `api.actor.setActorNickname(guid, nickname)` | PATCH |
| `/Actor/SetActorRole/{guid}` | `api.actor.setActorRole(guid, roleGuid)` | PATCH |
| `/Actor/GetAssignments` | `api.actor.getAssignments()` | GET |
| `/Actor/DeleteActor/{guid}` | `api.actor.deleteActor(guid)` | DELETE |
| `/Objective/GetAllObjectives` | `api.objective.getAllObjectives()` | GET |
| `/Objective/GetObjective/{guid}` | `api.objective.getObjective(guid)` | GET |
| `/Objective/GetObjectiveAssignments/{guid}` | `api.objective.getObjectiveAssignments(guid)` | GET |
| `/Objective/CreateObjective` | `api.objective.createObjective(request)` | POST |
| `/Objective/SetObjectiveDisplayName/{guid}` | `api.objective.setObjectiveDisplayName(guid, name)` | PATCH |
| `/Objective/SetObjectiveDescription/{guid}` | `api.objective.setObjectiveDescription(guid, desc)` | PATCH |
| `/Objective/DeleteObjective/{guid}` | `api.objective.deleteObjective(guid)` | DELETE |
| `/Assignment/GetAllAssignments` | `api.assignment.getAllAssignments()` | GET |
| `/Assignment/GetAssignment/{guid}` | `api.assignment.getAssignment(guid)` | GET |
| `/Assignment/CreateAssignment` | `api.assignment.createAssignment(request)` | POST |
| `/Assignment/SetAssignmentDisplayName/{guid}` | `api.assignment.setAssignmentDisplayName(guid, name)` | PATCH |
| `/Assignment/SetAssignmentDescription/{guid}` | `api.assignment.setAssignmentDescription(guid, desc)` | PATCH |
| `/Assignment/SetAssignmentStartDate/{guid}` | `api.assignment.setAssignmentStartDate(guid, date)` | PATCH |
| `/Assignment/SetAssignmentDeadlineDate/{guid}` | `api.assignment.setAssignmentDeadlineDate(guid, date)` | PATCH |
| `/Assignment/SetAssignmentAssignee/{guid}` | `api.assignment.setAssignmentAssignee(guid, actorGuid)` | PATCH |
| `/Assignment/SetAssignmentPriority/{guid}` | `api.assignment.setAssignmentPriority(guid, priority)` | PATCH |
| `/Assignment/SetAssignmentStatus/{guid}` | `api.assignment.setAssignmentStatus(guid, status)` | PATCH |
| `/Assignment/DeleteAssignment/{guid}` | `api.assignment.deleteAssignment(guid)` | DELETE |

## 🎯 STATUS

### ✅ Vollständig implementiert
- [x] Alle 30+ Backend-Endpoints integriert
- [x] DTO ↔ Domain Model Mapping
- [x] Mock-Services für Prototyping
- [x] TypeScript-Typen definiert
- [x] Dependency Injection unterstützt

### ⚠️ Aktueller Zustand
- Mock-API ist aktiv (Standard für Prototyping)
- Neue Services sind bereit, aber noch nicht in UI verwendet
- Bestehende Features funktionieren weiterhin

## 📁 Dateistruktur

```
src/services/api/
├── index.ts                    ✅ Aktualisiert
├── client.ts                   
├── types.ts                    
├── roleApi.ts                  ✅ NEU
├── actorApi.ts                 ✅ NEU
├── assignmentApi.ts            ✅ NEU
├── objectiveApi.ts             
├── workflowApi.ts              ✅ Aktualisiert
├── workStepApi.ts              ✅ Aktualisiert
├── mappers.ts                  ✅ NEU
├── mockApiClient.ts            
├── mockWorkflowApi.ts          
├── mockWorkStepApi.ts          
├── mockRoleApi.ts              ✅ NEU
├── mockActorApi.ts             ✅ NEU
└── mockAssignmentApi.ts        ✅ NEU
```

## 🚀 Verwendung

```typescript
import { useApi } from '@/composables/useApi'

const api = useApi()

// Alle neuen Services verfügbar:
api.role.getAllRoles()
api.actor.getAllActors()
api.assignment.getAllAssignments()

// Bestehende Services (aktualisiert):
api.workflow.getAllWorkflows()  // Verwendet Objective-Endpoints
api.workStep.getAllWorkSteps()  // Verwendet Assignment-Endpoints
```

## 📝 Konfiguration

**`.env.local`**:
```env
VITE_USE_MOCK_API=true  # Standard: Mock-API
VITE_API_BASE_URL=http://localhost:8080/api
```

**Für echte Backend-API**:
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8080/api
```

