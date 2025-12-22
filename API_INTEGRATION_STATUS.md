# API Integration Status

## ✅ Completed Backend API Integration

Alle Backend-Endpoints wurden integriert:

### 1. Role API (`/Role/`)
- ✅ `GET GetAllRoles`
- ✅ `GET GetRole/{guid}`
- ✅ `POST CreateRole`
- ✅ `PATCH SetRoleDisplayName`
- ✅ `PATCH SetRoleDescription`
- ✅ `PATCH SetRoleAdminFlag`
- ✅ `DELETE DeleteRole`

### 2. Actor API (`/Actor/`)
- ✅ `GET GetAllActors`
- ✅ `GET GetActor/{guid}`
- ✅ `POST CreateActor`
- ✅ `PATCH SetActorNickname`
- ✅ `PATCH SetActorRole`
- ✅ `GET GetAssignments`
- ✅ `DELETE DeleteActor`

### 3. Objective API (`/Objective/`)
- ✅ `GET GetAllObjectives`
- ✅ `GET GetObjective/{guid}`
- ✅ `GET GetObjectiveAssignments/{guid}`
- ✅ `POST CreateObjective`
- ✅ `PATCH SetObjectiveDisplayName`
- ✅ `PATCH SetObjectiveDescription`
- ✅ `DELETE DeleteObjective`

### 4. Assignment API (`/Assignment/`)
- ✅ `GET GetAllAssignments`
- ✅ `GET GetAssignment/{guid}`
- ✅ `POST CreateAssignment`
- ✅ `PATCH SetAssignmentDisplayName`
- ✅ `PATCH SetAssignmentDescription`
- ✅ `PATCH SetAssignmentStartDate`
- ✅ `PATCH SetAssignmentDeadlineDate`
- ✅ `PATCH SetAssignmentAssignee`
- ✅ `PATCH SetAssignmentPriority`
- ✅ `PATCH SetAssignmentStatus`
- ✅ `DELETE DeleteAssignment`

## 🔧 Current Configuration

**Standard: Mock API aktiv** (für Prototyping)

Die Anwendung verwendet standardmäßig Mock-Services. Um die echte Backend-API zu verwenden:

### Option 1: Environment Variable setzen

Erstelle eine `.env` Datei im Projekt-Root:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8080/api
```

### Option 2: In der Browser-Konsole prüfen

Öffne die Browser-Konsole (F12) und prüfe:
- Werden Mock-Services verwendet?
- Werden echte API-Calls gemacht?

## 📝 Warum sehe ich keine Änderungen?

1. **Mock-API ist aktiv**: Standardmäßig werden Mock-Services verwendet
2. **Backend nicht erreichbar**: Wenn `VITE_USE_MOCK_API=false` gesetzt ist, aber das Backend nicht läuft
3. **Browser-Cache**: Hard Refresh (Ctrl+Shift+R / Cmd+Shift+R) durchführen
4. **Dev-Server neu starten**: Nach Änderungen an `.env` Datei

## 🚀 Nächste Schritte

1. **Für Prototyping**: Mock-API verwenden (Standard) ✅
2. **Für echte Backend-Integration**: 
   - `.env` Datei erstellen mit `VITE_USE_MOCK_API=false`
   - Backend-Server starten
   - Dev-Server neu starten

## 📁 Neue Dateien

- `src/services/api/roleApi.ts` - Role API Service
- `src/services/api/actorApi.ts` - Actor API Service
- `src/services/api/assignmentApi.ts` - Assignment API Service
- `src/services/api/mappers.ts` - DTO ↔ Domain Model Mapper
- `src/services/api/mockRoleApi.ts` - Mock Role API
- `src/services/api/mockActorApi.ts` - Mock Actor API
- `src/services/api/mockAssignmentApi.ts` - Mock Assignment API

## 🔄 Aktualisierte Dateien

- `src/services/api/index.ts` - Neue Services integriert
- `src/services/api/workflowApi.ts` - Verwendet Objective-Endpoints
- `src/services/api/workStepApi.ts` - Verwendet Assignment-Endpoints
- `src/composables/useObjective.ts` - Aktualisiert für neue API-Struktur
- `src/types/api.ts` - Neue DTOs hinzugefügt



