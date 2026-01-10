## Abhakbare Anforderungen

### Workflow/Objective (aka „Aufgabe“ im Dokument)
- [x] Ein Workflow besteht aus wenigen sequenziellen Tasks (Task 1 → Task 2 → …).  
- [x] Am Workflow ist ein Fertigstellungstermin (Deadline) sichtbar/hinterlegt.  
- [x] In der Workflow-Übersicht/Detailansicht ist sichtbar: wie viele Tasks erledigt sind.  
- [x] In der Workflow-Übersicht/Detailansicht ist sichtbar: wie viele Tasks noch offen sind.  

### Task-Grundmodell (aka „Arbeitsschritt“ im Dokument)
- [x] Jeder Task hat eine Dauer in Stunden (als Feld/Info).  
- [x] Jeder Task wird pro Workflow nur einmal durchlaufen (kein mehrfaches Wiederholen desselben Tasks im selben Workflow im Prototyp).  
- [x] Jeder Task hat (im Prototyp) genau eine Rolle.  

### Rollen, Berechtigungen, „qualifizierte“ Bearbeitung
- [x] Es gibt Berechtigungsmanagement: Ein Nutzer ohne Berechtigung kann einen bestimmten Task nicht bearbeiten/öffnen.  
- [x] Bestimmte Tasks sind nur durch bestimmte Akteure/Rollen durchführbar (das wird technisch erzwungen).  
- [ ] Für einen Task können mehrere Akteure als mögliche Bearbeiter hinterlegt sein (mehr als ein Kandidat ist möglich).  (Backend Aufgabe)

### Persönliche Task-Liste & automatische Weitergabe
- [x] Jeder Akteur hat eine persönliche Liste seiner zugewiesenen Tasks.  
- [ ] Wenn ein Akteur seinen Task erledigt, wird der nächste Task automatisch beim nächsten zuständigen Akteur in dessen Liste eingeplant und angezeigt. (Wir haben anders Szenario) 

### Automatische Priorisierung (Dringlichkeit) in der persönlichen Liste
- [x] Tasks in der persönlichen Liste sind nach Dringlichkeit priorisiert/sortiert.  
- [x] Dringlichkeit wird aus (a) Workflow-Deadline und (b) Dauer der noch offenen Tasks abgeleitet.  
- [x] Dringlichkeit = „sofort“, wenn Restdauer bis Deadline ≤ 8 Stunden.  
- [x] Dringlichkeit = „mittelfristig“, wenn Restdauer bis Deadline > 8 und ≤ 32 Stunden.  
- [x] Dringlichkeit = „langfristig“ sonst.  

### Workflowmanager (Deadline-Tracking + Eingriff)
- [x] Es gibt die Rolle/Ansicht „Workflowmanager“.  
- [x] Workflowmanager kann die Task-Liste jedes Akteurs ansehen.  
- [x] Workflowmanager kann Prioritäten manuell setzen und damit die automatische Priorisierung überschreiben.  
- [x] Wenn ein Akteur seine Liste gerade offen hat, wird sie bei Änderungen durch den Workflowmanager automatisch aktualisiert.  

### Benachrichtigungen / Live-Updates (konkret prüfbar)
- [x] Wenn während der Workflowmanager einen Workflow ansieht ein Task erledigt wird, bekommt der Workflowmanager eine Benachrichtigung und/oder die Ansicht aktualisiert automatisch.  
- [x] Es existiert im System ein Benachrichtigungsmechanismus (z. B. Notification-Bereich, Toast, Badge, Auto-Update-Indikator), der bei relevanten Ereignissen tatsächlich ausgelöst wird.  

### Usability (als UI-Features überprüfbar)
- [x] Akteur sieht jederzeit Anzahl und Priorisierung seiner offenen Tasks.  
- [x] Akteur kann zwischen mindestens zwei Darstellungen dafür wechseln (z. B. Liste + alternative Darstellung wie Hervorhebung/Diagramm).  
- [x] Diese Übersicht ist jederzeit ohne Interaktion aktuell (kein manuelles Refresh nötig).  
- [x] Workflowmanager-Tracking bleibt bei ca. 20 Tasks pro Workflow „auf einen Blick“ aktuell (keine veraltete Anzeige).  

### Performance/Security (messbar)
- [x] Zugriff auf die persönliche Task-Liste erfolgt innerhalb von 0,5 Sekunden (bei verfügbarem System).  

### Mandantenfähigkeit & Plattform
- [] Die App ist mandantenfähig (Mandant/Workspace/Organisation als Trennung erkennbar). (NOOOO) 
- [x] Die App ist eine Web-Applikation.  
- [x] Die Web-App ist auf unterschiedlichen Devices nutzbar (responsive/Device-angepasst).  

### Fehler / Bugs

- [x] **My-Work-Steps (View: Cards):** Unten ist helle Schrift auf hellem Hintergrund (zu geringer Kontrast, schlecht lesbar).  
- [x] **My-Work-Steps (View: Table):** Title unten gar nicht lesbar; Title steht/landet bei „Priority“ (Layout/Spaltenzuordnung kaputt).  
- [x] **Home / Navigation (Rechte):** Nicht‑Admin‑User sehen das WorkflowManager-Dashboard und können dahin navigieren (fehlende Zugriffskontrolle/Route-Guard).  
- [x] **My Work Steps → Create New Work Step → Create:** Nach „Create“ passiert nichts (kein neuer Eintrag, kein Feedback); nach Reload kommt „file not found“ (Routing/Deploy/Reload-Problem).  
- [x] **WorkflowManager Dashboard → neuen Workflow anlegen → Workflow auswählen → Add Work Step:** Meldung „failed to create work step“ (teilweise trotzdem später erstellt → inkonsistentes Fehlerhandling/Retry).  
- [x] **Users / Roles:** Schrift oben im blauen Kästchen sollte weiß sein (UI-Inkonsistenz/Lesbarkeit).  
- [x] **Top-Bar:** Notifications-Icon wirkt „komisch“ und ist nicht klar als Notification-Button erkennbar (UI/UX).  
- [x] **My Work Steps → Reassign:** Reassign funktioniert nicht (User auswählen, Task auswählen, Reassign → keine Änderung/kein Feedback).  
- [x] **My Work Steps (Cards):** Task-Cards unten zu klein; Inhalte werden abgeschnitten/halb sichtbar.  
- [x] **GitHub Pages / Refresh auf Subroute:** Häufig Fehler-Screen beim Reload auf Subpages (z. B. `/my-work-steps`) → vermutlich SPA-Routing/404-Fallback-Problem.  
- [ ] **Benachrichtigungen:** Funktionieren effektiv nicht bzw. sind nur lokal im Frontend gespeichert und nicht persistiert (nach Reload weg); außerdem unklar, wie man eine Benachrichtigung auslöst/versendet.  
- [x] **Deadlines:** Deadline wird zwar gesetzt, aber nicht in Aufgabenübersicht/Aufgabendetail angezeigt (fehlende Anzeige).  
- [x] **Duration:** Duration ist immer 8h (Wert wird nicht korrekt gespeichert/übernommen oder Default überschreibt).  
- [x] **Start Date / End Date:** Werden nicht gespeichert (stehen immer auf „aktuell“).  
- [x] **Priority (Eingabe):** Priority sollte nicht manuell vergebbar sein (UI/Logik: Feld entfernen bei Create/Update).  
- [x] **Priority (Berechnung):** Priority wird falsch berechnet (abweichend von der spezifizierten Berechnung).  
- [x] **Sequence number:** Immer Default-Wert (wird nicht gesetzt/gespeichert).  
- [x] **Update allgemein:** Updates funktionieren generell nicht (Bearbeiten/Änderungen werden nicht übernommen).  
- [x] **Task erstellen:** Keine Role auswählbar außer „no role“ (Roles werden nicht geladen/zugewiesen).  
- [x] **Assign to (bei Task erstellen):** Assign funktioniert nicht; „no users available“ (User-Liste wird nicht geladen/keine Datenbindung).
