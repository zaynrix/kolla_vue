# arc42 Dokumentation - Kolla Projekt

## 1. Einleitung und Ziele

### 1.1 Anforderungen an das System

**Projektziel**: Entwurf einer Softwarearchitektur für ein kollaboratives Aufgabenmanagementsystem (Kolla) mit folgenden Hauptanforderungen:

- Unterstützung von **Workflows** mit sequenziellen Arbeitsschritten
- **Individuelle Arbeitsplanung** für Akteure
- **Priorisierung** basierend auf Dringlichkeit (≤8h/≤32h/>32h)
- **Fortschrittsüberwachung** für Workflowmanager
- **Berechtigungsmanagement** für qualifikationsabhängige Arbeitsschritte
- **Benachrichtigungen** bei Änderungen
- **Mandantenfähigkeit** (Multi-Tenancy)
- **Hohe Wartbarkeit**: GUI und Logik unabhängig änderbar
- **Langfristige Erweiterbarkeit**: Systeme als Akteure

### 1.2 Qualitätsziele

| Qualitätsziel | Priorität | Beschreibung |
|--------------|-----------|--------------|
| **Modifiability** | Sehr hoch | Neues GUI integrieren ≤2h, GUI ändern ≤1h, Logik ändern ≤4h |
| **Testbarkeit** | Sehr hoch | Unit-Tests für jede Komponente, automatisiert, ≤2h Aufwand |
| **Usability** | Sehr hoch | Mindestens 2 verschiedene Darstellungen, automatisch aktuell |
| **Security** | Hoch | Berechtigte Akteure, Zugriff ≤0.5s |
| **Portability** | Mittel | GUI portierbar auf neue Plattformen (PDA, Handy, Web) ≤4h |

### 1.3 Stakeholder

- **Entwickler**: Benötigen modifizierbare, testbare Architektur
- **Workflowmanager**: Benötigen Deadline-Tracking und Priorisierung
- **Akteure**: Benötigen Übersicht über zugewiesene Arbeitsschritte
- **Systemadministratoren**: Benötigen Sicherheit und Skalierbarkeit

---

## 2. Randbedingungen

### 2.1 Technische Randbedingungen

- **Plattform**: Web-Applikation (muss auf unterschiedlichen Geräten funktionieren)
- **Frontend-Framework**: Vue 3 mit TypeScript
- **Build-Tool**: Vite
- **State Management**: Pinia
- **Prototyp**: Anwendungslogik wird provisorisch simuliert
- **Persistenz**: Muss im Architekturentwurf berücksichtigt, aber nicht prototypisch implementiert werden

### 2.2 Organisatorische Randbedingungen

- **Prototyp**: GUI prototypisch entwickeln (nicht final)
- **Flexible Schnittstelle**: Zwischen GUI und Anwendungslogik entwerfen & prototypisch entwickeln
- **Architekturentscheidungen**: Müssen in arc42 begründet werden

### 2.3 Konventionen

- **Code-Stil**: TypeScript mit strikten Typen
- **Architektur-Pattern**: MVVM (Model-View-ViewModel) + Clean Architecture
- **Komponenten-Pattern**: Container-Presenter Pattern

---

## 3. Kontextabgrenzung

### 3.1 Systemkontext

```
┌─────────────────────────────────────────────────────────────┐
│                        Kolla System                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │  Persistence │     │
│  │   (Vue 3)    │◄─┤   (REST API) │◄─┤   (DB)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │  Browser │      │   API    │      │ Database │
    │   User   │      │  Server  │      │   (N/A   │
    │          │      │          │      │  Prototyp)│
    └──────────┘      └──────────┘      └──────────┘
```

### 3.2 Facheinheiten

- **Workflow Management**: Verwaltung von Workflows und Arbeitsschritten
- **Actor Management**: Verwaltung von Akteuren und Zuweisungen
- **Notification Service**: Benachrichtigungen bei Änderungen
- **Authorization Service**: Berechtigungsprüfung

### 3.3 Technische Einheiten

- **Frontend**: Vue 3 Single Page Application
- **Backend API**: REST API (simuliert im Prototyp)
- **WebSocket/Polling**: Für Real-time Updates (vorbereitet, nicht implementiert)

---

## 4. Lösungskonzept

### 4.1 Architektur-Überblick

Das System folgt einer **MVVM (Model-View-ViewModel)** Architektur kombiniert mit **Clean Architecture** Prinzipien:

```
┌─────────────────────────────────────────────────────────────┐
│                        VIEW LAYER                            │
│  (Pure Presentation - Templates only)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   View       │  │  Reusable    │  │  Page Views  │     │
│  │ Components   │  │  UI Components│  │              │     │
│  │ (bind to VM) │  │  (pure props) │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ binds to (reactive state & commands)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    VIEWMODEL LAYER                          │
│  (Presentation Logic - Composables)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Composables │  │   Services   │  │   Helpers    │     │
│  │  (expose     │  │  (API, Auth) │  │              │     │
│  │   state &    │  │              │  │              │     │
│  │   commands)   │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ uses (business logic & data)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       MODEL LAYER                            │
│  (Business Logic & Domain Data)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Stores    │  │   Domain     │  │     DTOs     │     │
│  │   (Pinia)    │  │   Models     │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technologie-Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS mit Design System
- **Testing**: Vitest (vorbereitet)

---

## 5. Bausteinsicht

### 5.1 Level 1: Systemübersicht

```
┌─────────────────────────────────────────────────────────────┐
│                      Kolla Frontend                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   View       │  │  ViewModel   │  │    Model     │     │
│  │   Layer      │◄─┤    Layer     │◄─┤    Layer     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   UI     │      │ Business │      │   State  │
    │ Components│     │  Logic   │      │Management│
    └──────────┘      └──────────┘      └──────────┘
```

### 5.2 Level 2: Bausteine

#### 5.2.1 View Layer

**MVVM Prinzip**: Views sind rein präsentational. Sie binden nur an ViewModels und enthalten keine Business-Logik.

**View Components** (`src/components/containers/`):
- `WorkflowListContainer.vue`: View Component für Workflow-Liste (bindet an `useWorkflow` ViewModel)
- `WorkflowDetailsPanel.vue`: View Component für Workflow-Details (bindet an `useWorkflow` ViewModel)
- `CreateWorkflowForm.vue`: View Component für Workflow-Erstellung (bindet an `useWorkflow` ViewModel)
- `CreateWorkStepForm.vue`: View Component für Work Step-Erstellung (bindet an `useWorkStep` ViewModel)
- `ObjectiveListContainer.vue`: View Component für Objective-Liste (bindet an `useObjective` ViewModel)
- `NotificationPanel.vue`: View Component für Benachrichtigungen (bindet an `useNotification` ViewModel)

**Reusable UI Components** (`src/components/presenters/`):
- `WorkflowCard.vue`: Reusable UI Component - reine Präsentation (Props + Events)
- `WorkStepCard.vue`: Reusable UI Component - reine Präsentation (Props + Events)
- `WorkStepBoard.vue`: Reusable UI Component - Präsentation eines Kanban-Boards
- `ObjectiveCard.vue`: Reusable UI Component - Präsentation einer Objective-Karte
- `UserSelector.vue`: Reusable UI Component - Präsentation eines User-Selectors

**Page Views** (`src/views/`):
- `ActorDashboardView.vue`: Page View - Dashboard für Akteure (orchestriert View Components)
- `WorkflowManagerDashboardView.vue`: Page View - Dashboard für Workflowmanager
- `WorkflowsView.vue`: Page View - Übersicht aller Workflows

#### 5.2.2 ViewModel Layer

**MVVM Prinzip**: ViewModels exponieren reaktiven State und Commands für Views. Sie transformieren Model-Daten für die Präsentation.

**Composables (ViewModels)** (`src/composables/`):
- `useWorkflow.ts`: Workflow ViewModel - exponiert workflows State, loading, error, und Commands (load, create, update, delete)
- `useWorkStep.ts`: WorkStep ViewModel - exponiert work steps State und Commands, automatische Zuweisung
- `useObjective.ts`: Objective ViewModel - exponiert objectives State, Filtering, Priorisierung und Commands
- `useActor.ts`: Actor ViewModel - exponiert actors State und Commands
- `useRole.ts`: Role ViewModel - exponiert roles State und Commands
- `useWorkflowManager.ts`: WorkflowManager ViewModel - exponiert manager-spezifischen State und Commands
- `useAuthorization.ts`: Authorization ViewModel - exponiert Berechtigungsprüfungen
- `usePriority.ts`: Priority ViewModel Helper - Prioritätsberechnung für Präsentation
- `useApi.ts`: Dependency Injection für API Services

**Services** (`src/services/`):
- `api/`: API Services (REST API Client, Mock API) - werden von ViewModels verwendet
- `authorization/`: Authorization Service - wird von ViewModels verwendet

#### 5.2.3 Model Layer

**MVVM Prinzip**: Models enthalten Business-Logik und Domain-Daten. Sie werden nur über ViewModels zugänglich gemacht, nie direkt von Views.

**Stores (Models)** (`src/stores/`):
- `workflow.ts`: Workflow Model - Business-Logik und State für Workflows
- `workStep.ts`: WorkStep Model - Business-Logik und State für Work Steps mit Priorisierung
- `objective.ts`: Objective Model - Business-Logik und State für Objectives mit Prioritätsberechnung
- `user.ts`: User Model - Business-Logik und State für User und Rollen
- `notification.ts`: Notification Model - Business-Logik und State für Benachrichtigungen

**Domain Model Types** (`src/types/domain.ts`):
- TypeScript type definitions (interfaces, enums) für Domain Models
- `Workflow`: Workflow-Entität (Type Definition)
- `WorkStep`: Arbeitsschritt-Entität (Type Definition)
- `Objective`: Objective-Entität (Type Definition)
- `User`: Benutzer-Entität (Type Definition)
- `Actor`: Akteur-Entität (Type Definition)
- `Notification`: Benachrichtigungs-Entität (Type Definition)
- `Priority`, `TaskStatus`, `Role`: Enums für Domain-Logik
- `SystemActor`: System-Akteur (für zukünftige Erweiterung)

**API DTO Types** (`src/types/api.ts`):
- TypeScript type definitions für API-Kommunikation
- `CreateWorkflowRequest`, `UpdateWorkStepRequest`, etc.
- Data Transfer Objects für API-Kommunikation

**Authorization Types** (`src/types/authorization.ts`):
- TypeScript type definitions für Berechtigungen
- `Permission`, `AuthorizationResult`, `IAuthorizationService`

**MVVM Hinweis**: TypeScript Types sind compile-time only und können in jeder Schicht (View, ViewModel, Model) importiert werden. Dies verletzt NICHT MVVM-Prinzipien. Die MVVM-Restriktion gilt nur für **runtime Models (Stores)**, nicht für Type-Definitionen.

### 5.3 Schnittstellen

#### 5.3.1 View ↔ ViewModel (MVVM Data Binding)

**MVVM Prinzip**: Views binden nur an ViewModels, nie direkt an Models.

- **View Components** verwenden **ViewModels (Composables)** via `use*()` Hooks
  - Binden an reaktiven State: `{{ viewModel.data }}`
  - Rufen Commands auf: `@click="viewModel.command()"`
- **Reusable UI Components** erhalten Props und emittieren Events (keine ViewModel-Abhängigkeit)
- **Page Views** orchestrieren View Components und verwenden ViewModels für Page-Level State

**Beispiel**:
```vue
<!-- View Component -->
<script setup>
const viewModel = useWorkflow() // ViewModel
</script>
<template>
  <div v-if="viewModel.loading">Loading...</div>
  <WorkflowCard 
    v-for="w in viewModel.workflows" 
    :workflow="w"
    @edit="viewModel.handleEdit"
  />
</template>
```

#### 5.3.2 ViewModel ↔ Model

**MVVM Prinzip**: ViewModels verwenden Models für Business-Logik und Daten.

- **ViewModels (Composables)** verwenden **Models (Stores)** via `use*Store()` Hooks
- **ViewModels** transformieren Model-Daten für Präsentation
- **Services** werden von ViewModels verwendet für API-Kommunikation
- **Dependency Injection** via `provide/inject` für Testbarkeit

**Beispiel**:
```typescript
// ViewModel
export function useWorkflow() {
  const store = useWorkflowStore() // Model
  const workflows = computed(() => store.workflows) // Transform für View
  const loadWorkflows = async () => {
    const data = await api.workflow.getAllWorkflows()
    store.setWorkflows(data) // Update Model
  }
  return { workflows, loadWorkflows }
}
```

#### 5.3.3 Model ↔ External

- **Models (Stores)** enthalten Business-Logik, keine direkte API-Kommunikation
- **API Services** werden von ViewModels verwendet
- **API Client** kommuniziert mit Backend (REST API)
- **Mock API** simuliert Backend für Prototyp

---

## 6. Laufzeitsicht

### 6.1 Szenario: Work Step abschließen und automatisch zuweisen

```
Actor                    ViewModel              Model              API
 │                         │                     │                 │
 │ 1. Complete WorkStep    │                     │                 │
 ├────────────────────────>│                     │                 │
 │                         │                     │                 │
 │                         │ 2. Update Status    │                 │
 │                         ├─────────────────────>│                 │
 │                         │                     │                 │
 │                         │ 3. API Call         │                 │
 │                         ├───────────────────────────────────────>│
 │                         │                     │                 │
 │                         │ 4. Response         │                 │
 │                         │<───────────────────────────────────────┤
 │                         │                     │                 │
 │                         │ 5. Update Store     │                 │
 │                         ├─────────────────────>│                 │
 │                         │                     │                 │
 │                         │ 6. Find Next Step   │                 │
 │                         │                     │                 │
 │                         │ 7. Assign Next      │                 │
 │                         ├───────────────────────────────────────>│
 │                         │                     │                 │
 │                         │ 8. Notify Actor     │                 │
 │                         ├─────────────────────>│                 │
 │                         │                     │                 │
 │ 9. UI Updates           │                     │                 │
 │<────────────────────────┤                     │                 │
 │                         │                     │                 │
```

### 6.2 Szenario: Workflowmanager Deadline-Tracking

```
WorkflowManager          ViewModel              Model
 │                         │                     │
 │ 1. View Dashboard       │                     │
 ├────────────────────────>│                     │
 │                         │                     │
 │                         │ 2. Get Progress     │
 │                         ├─────────────────────>│
 │                         │                     │
 │                         │ 3. Calculate        │
 │                         │    Progress          │
 │                         │                     │
 │                         │ 4. Return Progress  │
 │                         │<─────────────────────┤
 │                         │                     │
 │ 5. Display Progress     │                     │
 │<────────────────────────┤                     │
 │                         │                     │
 │ 6. Watch for Changes    │                     │
 │                         │                     │
 │ 7. Auto-Update          │                     │
 │<────────────────────────┤                     │
 │                         │                     │
```

---

## 7. Verteilungssicht

### 7.1 Deployment-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vue 3 Single Page Application          │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │   View   │  │ViewModel │  │  Model   │          │   │
│  │  │  Layer   │  │  Layer   │  │  Layer   │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │ WebSocket (geplant)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server (Backend)                          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ REST API │  │Business  │  │Database │                   │
│  │          │  │ Logic    │  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Kommunikation

- **Frontend ↔ Backend**: REST API (HTTP/HTTPS)
- **Real-time Updates**: WebSocket oder Polling (vorbereitet, nicht implementiert)
- **Prototyp**: Mock API simuliert Backend

---

## 8. Querschnittliche Konzepte

### 8.1 Sicherheit

**Architekturentscheidung**: Rollenbasierte Zugriffskontrolle (RBAC)

**Implementierung**:
- `AuthorizationService`: Zentrale Berechtigungsprüfung
- Zugriffsprüfung ≤0.5s (synchron, keine DB-Abfrage)
- Rollen: WORKFLOW_MANAGER, TEAM_MEMBER, ADMIN
- Multi-Tenancy Support vorbereitet

**Begründung**: 
- Erfüllt Security-Anforderung (≤0.5s)
- Einfache Implementierung für Prototyp
- Erweiterbar für komplexere Berechtigungen

### 8.2 Fehlerbehandlung

**Architekturentscheidung**: Try-Catch in Composables, Error States in Stores

**Implementierung**:
- Error States in Stores (`error: ref<Error | null>`)
- Try-Catch in Composables
- User-freundliche Fehlermeldungen

### 8.3 Logging

**Architekturentscheidung**: Console-Logging für Prototyp

**Implementierung**:
- `console.log`, `console.error` für Debugging
- Für Produktion: Strukturiertes Logging vorbereitet

### 8.4 Internationalisierung

**Architekturentscheidung**: Hardcoded Strings (Deutsch/Englisch gemischt)

**Implementierung**:
- Für Prototyp: Hardcoded Strings
- Für Produktion: i18n vorbereitet (nicht implementiert)

### 8.5 Konfiguration

**Architekturentscheidung**: Environment Variables

**Implementierung**:
- `import.meta.env.VITE_API_BASE_URL` für API-URL
- Konfiguration in `vite.config.ts`

---

## 9. Architekturentscheidungen

### 9.1 Entscheidung: MVVM-Architektur

**Kontext**: Benötigt klare Trennung zwischen UI und Business Logic

**Entscheidung**: MVVM (Model-View-ViewModel) Pattern

**Konsequenzen**:
- ✅ **Vorteile**:
  - Klare Trennung von Concerns
  - Hohe Testbarkeit (ViewModel isoliert testbar)
  - Wiederverwendbare Business Logic
  - Einfache GUI-Änderungen ohne Logik-Änderungen
- ⚠️ **Nachteile**:
  - Mehr Boilerplate-Code
  - Lernkurve für Entwickler

**Alternativen erwogen**:
- **MVC**: Zu eng gekoppelt, weniger flexibel
- **MVP**: Ähnlich, aber MVVM besser für reaktive Frameworks

**Begründung**: Erfüllt Modifiability-Anforderungen (GUI ändern ≤1h, Logik ändern ≤4h)

---

### 9.2 Entscheidung: MVVM Architektur mit View-ViewModel Trennung

**Kontext**: Benötigt klare Trennung zwischen UI und Business-Logik für Modifiability

**Entscheidung**: MVVM Pattern mit View-ViewModel-Modell Trennung

**Konsequenzen**:
- ✅ **Vorteile**:
  - Views sind rein präsentational (nur Templates)
  - ViewModels kapseln Präsentationslogik und State
  - Models enthalten Business-Logik unabhängig von UI
  - Einfache Unit-Tests für jede Schicht
  - GUI portierbar ohne Logik-Änderungen (Views können ausgetauscht werden)
  - ViewModels können von mehreren Views wiederverwendet werden
- ⚠️ **Nachteile**:
  - Mehr Abstraktionsebenen
  - Potenzielle Over-Engineering für sehr einfache Komponenten

**Alternativen erwogen**:
- **MVC**: Zu eng gekoppelt, weniger flexibel
- **MVP**: Ähnlich, aber MVVM besser für reaktive Frameworks wie Vue
- **Container-Presenter**: MVP-Variante, weniger klar als MVVM

**Begründung**: Erfüllt Modifiability & Portability-Anforderungen (GUI portierbar ≤4h, GUI ändern ≤1h, Logik ändern ≤4h)

---

### 9.3 Entscheidung: Pinia für State Management

**Kontext**: Benötigt reaktives State Management

**Entscheidung**: Pinia (offizieller Vue 3 State Manager)

**Konsequenzen**:
- ✅ **Vorteile**:
  - Offiziell unterstützt (Vue 3)
  - TypeScript-Support
  - DevTools Integration
  - Einfache API
  - Reaktive Updates automatisch
- ⚠️ **Nachteile**:
  - Vue-spezifisch (weniger portabel)

**Alternativen erwogen**:
- **Vuex**: Legacy, weniger TypeScript-Support
- **Redux**: Zu komplex für dieses Projekt
- **Zustand**: Nicht Vue-native

**Begründung**: Erfüllt Usability-Anforderung (automatisch aktuelle Übersicht)

---

### 9.4 Entscheidung: Dependency Injection für Services

**Kontext**: Benötigt testbare Services (Mock für Tests)

**Entscheidung**: Vue `provide/inject` für Dependency Injection

**Konsequenzen**:
- ✅ **Vorteile**:
  - Einfache Mocking für Tests
  - Lose Kopplung
  - Testbarkeit erhöht
- ⚠️ **Nachteile**:
  - Mehr Boilerplate
  - Weniger explizit als Constructor Injection

**Alternativen erwogen**:
- **Constructor Injection**: Nicht Vue-idiomatisch
- **Global Services**: Zu eng gekoppelt, schwer testbar

**Begründung**: Erfüllt Testbarkeit-Anforderung (Unit-Tests ≤2h)

---

### 9.5 Entscheidung: Composables für Business Logic

**Kontext**: Benötigt wiederverwendbare Business Logic

**Entscheidung**: Vue Composables (Composition API)

**Konsequenzen**:
- ✅ **Vorteile**:
  - Wiederverwendbare Logic
  - Vue-idiomatisch
  - Einfache Tests (reine Funktionen)
  - TypeScript-Support
- ⚠️ **Nachteile**:
  - Vue-spezifisch

**Alternativen erwogen**:
- **Classes**: Weniger Vue-idiomatisch
- **Functions**: Ähnlich, aber Composables besser integriert

**Begründung**: Erfüllt Modifiability-Anforderung (Logik ändern ≤4h)

---

### 9.6 Entscheidung: Mock API für Prototyp

**Kontext**: Backend nicht verfügbar für Prototyp

**Entscheidung**: Mock API Client simuliert Backend

**Konsequenzen**:
- ✅ **Vorteile**:
  - Unabhängige Entwicklung
  - Schnelle Prototyp-Entwicklung
  - Einfache Tests
- ⚠️ **Nachteile**:
  - Nicht produktionsreif
  - Muss später durch echtes Backend ersetzt werden

**Alternativen erwogen**:
- **Echtes Backend**: Zu aufwendig für Prototyp
- **LocalStorage**: Zu einfach, nicht realistisch

**Begründung**: Erfüllt Prototyp-Anforderung (Anwendungslogik provisorisch simuliert)

---

### 9.7 Entscheidung: Vue Reactivity für Real-time Updates

**Kontext**: Benötigt automatische UI-Updates ohne Reload

**Entscheidung**: Vue Reactivity System (automatische Updates)

**Konsequenzen**:
- ✅ **Vorteile**:
  - Automatische Updates bei Store-Änderungen
  - Keine manuellen Refreshs nötig
  - Erfüllt Usability-Anforderung
- ⚠️ **Nachteile**:
  - Vue-spezifisch
  - Für echte Real-time Updates (Multi-User) benötigt WebSocket

**Alternativen erwogen**:
- **Polling**: Zu ineffizient
- **WebSocket**: Zu komplex für Prototyp

**Begründung**: Erfüllt Usability-Anforderung (automatisch aktuelle Übersicht)

---

### 9.8 Entscheidung: TypeScript für Type Safety

**Kontext**: Benötigt Type Safety für große Codebase

**Entscheidung**: TypeScript statt JavaScript

**Konsequenzen**:
- ✅ **Vorteile**:
  - Type Safety
  - Bessere IDE-Unterstützung
  - Weniger Runtime-Fehler
  - Bessere Dokumentation (Types als Dokumentation)
- ⚠️ **Nachteile**:
  - Mehr Boilerplate
  - Lernkurve

**Alternativen erwogen**:
- **JavaScript**: Weniger Type Safety
- **Flow**: Weniger verbreitet

**Begründung**: Erfüllt Wartbarkeits-Anforderung (hohe Wartbarkeit)

---

### 9.9 Entscheidung: Responsive Design für Portability

**Kontext**: Muss auf unterschiedlichen Geräten funktionieren

**Entscheidung**: Responsive CSS mit Media Queries

**Konsequenzen**:
- ✅ **Vorteile**:
  - Funktioniert auf Desktop, Tablet, Mobile
  - Erfüllt Portability-Anforderung
- ⚠️ **Nachteile**:
  - Mehr CSS-Code
  - Komplexere Layouts

**Alternativen erwogen**:
- **Separate Mobile App**: Zu aufwendig
- **Desktop-only**: Erfüllt Anforderung nicht

**Begründung**: Erfüllt Portability-Anforderung (GUI portierbar ≤4h)

---

### 9.10 Entscheidung: SystemActor Interface für zukünftige Erweiterung

**Kontext**: Langfristig sollen Systeme als Akteure dienen können

**Entscheidung**: `SystemActor` Interface vorbereitet, `Actor = User | SystemActor`

**Konsequenzen**:
- ✅ **Vorteile**:
  - Architektur vorbereitet für zukünftige Erweiterung
  - Keine Breaking Changes nötig
- ⚠️ **Nachteile**:
  - Nicht im Prototyp implementiert

**Alternativen erwogen**:
- **Nur User**: Würde zukünftige Erweiterung erschweren

**Begründung**: Erfüllt Projektziel (langfristig Systeme als Akteure)

---

## 10. Qualitätsanforderungen

### 10.1 Modifiability

**Anforderung**: 
- Neues GUI integrieren ≤2h
- GUI ändern ≤1h
- Logik ändern ≤4h

**Umsetzung**:
- ✅ Container-Presenter Pattern trennt GUI von Logik
- ✅ Composables kapseln Business Logic
- ✅ Dependency Injection ermöglicht einfaches Mocking

**Nachweis**: Architektur unterstützt isolierte Änderungen ohne Auswirkungen auf andere Komponenten

---

### 10.2 Testbarkeit

**Anforderung**: Unit-Tests für jede Komponente, automatisiert, ≤2h

**Umsetzung**:
- ✅ Vitest Test-Framework vorhanden
- ✅ Stores sind isoliert testbar (reine Funktionen)
- ✅ Composables sind isoliert testbar
- ⚠️ Tests noch nicht vollständig implementiert

**Nachweis**: Architektur unterstützt Unit-Tests, Test-Framework konfiguriert

---

### 10.3 Usability

**Anforderung**: 
- Mindestens 2 verschiedene Darstellungen
- Automatisch aktuelle Übersicht

**Umsetzung**:
- ✅ **3 Darstellungen**: Board View, Card View, Table View
- ✅ Vue Reactivity aktualisiert automatisch
- ✅ Workflowmanager Deadline-Tracking mit Real-time Updates

**Nachweis**: `ActorDashboardView.vue` bietet 3 verschiedene Views, alle automatisch aktualisiert

---

### 10.4 Security

**Anforderung**: Berechtigte Akteure, Zugriff ≤0.5s

**Umsetzung**:
- ✅ Authorization Service mit synchroner Prüfung
- ✅ Rollenbasierte Zugriffskontrolle
- ✅ Multi-Tenancy Support vorbereitet

**Nachweis**: `authorizationService.canAccessWorkStep()` ist synchron, <0.5s

---

### 10.5 Portability

**Anforderung**: GUI portierbar auf neue Plattformen ≤4h

**Umsetzung**:
- ✅ Container-Presenter Pattern trennt GUI komplett
- ✅ Responsive Design für verschiedene Geräte
- ✅ Web-Applikation funktioniert auf Desktop, Tablet, Mobile

**Nachweis**: Architektur unterstützt Portierung ohne Logik-Änderungen

---

## 11. Risiken und technische Schulden

### 11.1 Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Maßnahme |
|--------|-------------------|------------|----------|
| Backend API ändert sich | Mittel | Hoch | API Client abstrahiert, Mock API kann angepasst werden |
| Performance bei vielen Work Steps | Niedrig | Mittel | Pagination vorbereitet, nicht implementiert |
| Multi-User Real-time Updates | Mittel | Mittel | WebSocket vorbereitet, nicht implementiert |

### 11.2 Technische Schulden

- **Unit-Tests**: Tests für Stores/Composables fehlen
- **WebSocket**: Real-time Updates für Multi-User nicht implementiert
- **Persistenz**: Nur Mock, echtes Backend fehlt
- **Multi-Tenancy**: Architektur vorbereitet, vollständige Implementierung fehlt

---

## 12. Glossar

- **Workflow**: Sequenzieller Ablauf von Arbeitsschritten
- **Work Step**: Einzelner Arbeitsschritt in einem Workflow
- **Actor**: Benutzer oder System, das Arbeitsschritte ausführt
- **Workflowmanager**: Benutzer, der Workflows verwaltet und überwacht
- **Priorisierung**: Einordnung nach Dringlichkeit (sofort/mittelfristig/langfristig)
- **MVVM**: Model-View-ViewModel Architektur-Pattern
- **Composable**: Wiederverwendbare Vue 3 Composition API Funktion
- **Store**: Pinia State Management Einheit
- **Container Component**: Smart Component mit Business Logic
- **Presenter Component**: Dumb Component nur für Präsentation

---

## Anhang

### A. Quellen

- Vue 3 Dokumentation: https://vuejs.org/
- Pinia Dokumentation: https://pinia.vuejs.org/
- arc42 Template: https://arc42.org/
- Clean Architecture: Robert C. Martin

### B. Änderungshistorie

| Version | Datum | Autor | Änderung |
|---------|-------|-------|----------|
| 1.0 | 2024 | Entwicklerteam | Erste arc42 Dokumentation |



