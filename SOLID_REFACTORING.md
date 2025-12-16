# Refactorisation SOLID - HackathoN

Ce document décrit les refactorisations appliquées pour respecter les principes SOLID.

## Principes SOLID Appliqués

### 1. Single Responsibility Principle (SRP)

**Principe**: Une classe/module ne devrait avoir qu'une seule raison de changer.

#### Services Créés

##### FormValidationService (`form-validation.service.ts`)

**Responsabilité unique**: Validation des formulaires

- `emailMatchValidator`: Vérifie que les emails correspondent
- `hasIdeaValidator`: Valide que l'utilisateur a fait un choix pour l'idée

##### SkillsService (`skills.service.ts`)

**Responsabilité unique**: Gestion des compétences

- `getAllSkills()`: Retourne toutes les compétences disponibles
- `getSkillInfo(skillValue)`: Récupère les détails d'une compétence
- `hasSkill(skillValue)`: Vérifie l'existence d'une compétence

##### PayloadBuilderService (`payload-builder.service.ts`)

**Responsabilité unique**: Construction des payloads API

- `buildParticipantPayload()`: Construit le payload pour un participant
- `buildJuryMemberPayload()`: Construit le payload pour un membre du jury
- `buildPayload()`: Méthode générique de construction

##### CountdownService (`countdown.service.ts`)

**Responsabilité unique**: Gestion du compte à rebours

- `startCountdown()`: Démarre le countdown
- `stopCountdown()`: Arrête le countdown
- `resetCountdown()`: Réinitialise le countdown
- `updateTitle()`: Met à jour le titre
- Utilise un `BehaviorSubject` pour diffuser les changements (Observable pattern)

##### StatusTransitionService (`status-transition.service.ts`)

**Responsabilité unique**: Gestion des transitions de statut du hackathon

- `transitionToPreparation()`: Transition vers EN_PREPARATION
- `transitionToEnCours()`: Transition vers EN_COURS (avec génération d'équipes)
- `transitionToTermine()`: Transition vers TERMINE
- `transitionToEnAttente()`: Transition vers EN_ATTENTE

#### Refactorisation des Composants

##### RegisterPage

**Avant**: Le composant gérait tout

- Validation des formulaires
- Gestion des compétences (données hardcodées)
- Construction des payloads
- Logique métier

**Après**: Le composant orchestre les services

```typescript
constructor(
  private formValidationService: FormValidationService,
  private skillsService: SkillsService,
  private payloadBuilderService: PayloadBuilderService,
  ...
)
```

- Délègue la validation au `FormValidationService`
- Délègue la gestion des compétences au `SkillsService`
- Délègue la construction des payloads au `PayloadBuilderService`

##### DashboardPage

**Avant**: Le composant gérait

- Le countdown (intervalle, mise à jour, reset)
- Les transitions de statut manuellement
- La logique de génération d'équipes lors des transitions

**Après**: Le composant utilise les services

```typescript
constructor(
  private countdownService: CountdownService,
  private statusTransitionService: StatusTransitionService,
  ...
)
```

- S'abonne au countdown via Observable (`countdown$`)
- Délègue toutes les transitions au `StatusTransitionService`
- Code plus lisible et maintenable

### 2. Open/Closed Principle (OCP)

**Principe**: Ouvert à l'extension, fermé à la modification.

#### Application

Les services sont conçus pour être étendus sans modification:

- `SkillsService`: Nouvelles compétences peuvent être ajoutées dans les données sans modifier les méthodes
- `StatusTransitionService`: Nouvelles transitions peuvent être ajoutées sans modifier les existantes
- `CountdownService`: Nouveaux comportements de countdown peuvent être implémentés via les callbacks

### 3. Liskov Substitution Principle (LSP)

**Principe**: Les sous-types doivent être substituables à leurs types de base.

#### Application

- Tous les services implémentent des interfaces implicites cohérentes
- Les Observables RxJS peuvent être substitués (hot/cold observables)
- Les validateurs Angular suivent l'interface `ValidatorFn` standard

### 4. Interface Segregation Principle (ISP)

**Principe**: Les clients ne devraient pas dépendre d'interfaces qu'ils n'utilisent pas.

#### Application

- Chaque service expose uniquement les méthodes nécessaires à son rôle
- `FormValidationService`: uniquement validation
- `PayloadBuilderService`: uniquement construction de données
- Pas de "god services" avec des dizaines de méthodes

### 5. Dependency Inversion Principle (DIP)

**Principe**: Dépendre d'abstractions, pas d'implémentations concrètes.

#### Application

##### Avant

```typescript
// RegisterPage construisait directement les payloads
private buildPayload(role: string): any {
  const { firstName, lastName, email, skill, ... } = this.form.value;
  if (role === 'participant') {
    return { firstName, lastName, email, skill };
  }
  return { firstName, lastName, email, title, ... };
}
```

##### Après

```typescript
// RegisterPage dépend de l'abstraction PayloadBuilderService
private buildPayload(role: string): any {
  return this.payloadBuilderService.buildPayload(this.form.value, role);
}
```

##### Injection de Dépendances

Tous les services utilisent `providedIn: 'root'` pour l'injection de dépendances:

```typescript
@Injectable({
  providedIn: 'root',
})
export class CountdownService { ... }
```

### Bénéfices de la Refactorisation

#### 1. Testabilité

- Les services peuvent être testés indépendamment
- Mock facile des dépendances dans les tests unitaires
- Isolation des responsabilités facilite l'écriture de tests

#### 2. Maintenabilité

- Code plus lisible et organisé
- Changements localisés (ex: modifier validation sans toucher au composant)
- Moins de duplication de code

#### 3. Réutilisabilité

- Services réutilisables dans d'autres composants
- `CountdownService` peut être utilisé ailleurs dans l'application
- `SkillsService` centralisé pour toutes les compétences

#### 4. Évolutivité

- Facile d'ajouter de nouvelles compétences dans `SkillsService`
- Facile d'ajouter de nouveaux types de transitions dans `StatusTransitionService`
- Nouveau comportement via extension plutôt que modification

## Architecture Finale

```
Components (Orchestration)
    ↓
Services (Business Logic)
    ↓
API Services (Data Access)
```

### RegisterPage Flow

```
RegisterPage
  ├── FormValidationService (validation)
  ├── SkillsService (compétences)
  ├── PayloadBuilderService (construction données)
  ├── ParticipantService (API)
  ├── JuryMemberService (API)
  └── EmailService (notifications)
```

### DashboardPage Flow

```
DashboardPage
  ├── CountdownService (countdown observable)
  ├── StatusTransitionService (transitions)
  │     ├── StatusService (API)
  │     └── HackathonService (API)
  ├── ParticipantService (API)
  ├── JuryMemberService (API)
  ├── TeamService (API)
  └── PeriodService (API)
```

## Métriques de Qualité

### Avant Refactorisation

- **RegisterPage**: ~510 lignes, 8 responsabilités
- **DashboardPage**: ~793 lignes, 6 responsabilités
- **Couplage**: Fort (composants font tout)
- **Testabilité**: Difficile (logique mélangée)

### Après Refactorisation

- **RegisterPage**: ~350 lignes, 2 responsabilités (UI + orchestration)
- **DashboardPage**: ~700 lignes, 2 responsabilités (UI + orchestration)
- **Services**: 5 nouveaux services, chacun avec une responsabilité unique
- **Couplage**: Faible (injection de dépendances)
- **Testabilité**: Excellente (services isolés)

## Fichiers Modifiés

### Nouveaux Fichiers

- `src/app/services/form-validation.service.ts`
- `src/app/services/skills.service.ts`
- `src/app/services/payload-builder.service.ts`
- `src/app/services/countdown.service.ts`
- `src/app/services/status-transition.service.ts`

### Fichiers Refactorisés

- `src/app/features/register-page/register-page.ts`
- `src/app/features/dashboard-page/dashboard-page.ts`
- `src/app/services/index.ts` (exports)

## Prochaines Étapes Recommandées

1. **Tests Unitaires**: Écrire des tests pour chaque service
2. **Documentation API**: Ajouter OpenAPI/Swagger docs
3. **Error Handling**: Service centralisé de gestion d'erreurs
4. **Logging**: Service de logging structuré
5. **Caching**: Implémenter caching pour les requêtes API
6. **State Management**: Considérer NgRx pour état global complexe
