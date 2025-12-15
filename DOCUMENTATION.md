# Documentation HackathoN - Interface Utilisateur

## Vue d'ensemble

Application Angular pour la gestion et le suivi d'un hackathon interne. L'application permet l'inscription des participants et membres du jury, la génération automatique d'équipes, et le suivi en temps réel du déroulement du hackathon.

## Architecture

### Structure du projet

```
src/
├── app/
│   ├── features/          # Pages et composants métier
│   │   ├── dashboard-page/    # Dashboard principal avec compte à rebours
│   │   ├── register-page/     # Page d'inscription participants/jury
│   │   ├── home-page/         # Page d'accueil
│   │   ├── subject-page/      # Gestion des sujets
│   │   └── rules/             # Règles du hackathon
│   ├── services/          # Services API
│   ├── interfaces/        # Interfaces TypeScript
│   ├── constantes/        # Constantes de configuration
│   ├── env/              # Configuration environnement
│   └── header/           # En-tête de l'application
└── public/               # Assets statiques
```

## Composants principaux

### Dashboard (`dashboard-page.ts`)

**Responsabilité** : Affiche l'état actuel du hackathon avec un compte à rebours et gère les transitions automatiques entre les différents statuts.

**Statuts du hackathon** :

- `EN_ATTENTE` : En attente du nombre minimum de participants/jury
- `EN_PREPARATION` : Inscription terminée, hackathon à venir
- `EN_COURS` : Hackathon en cours
- `TERMINE` : Hackathon terminé

**Fonctionnalités clés** :

- Compte à rebours dynamique
- Génération automatique des équipes au démarrage
- Affichage des équipes et du sujet sélectionné
- Nettoyage automatique des données à minuit après la fin

**Transitions automatiques** :

```
EN_ATTENTE → EN_PREPARATION (quand conditions remplies)
EN_PREPARATION → EN_COURS (au début de la période)
EN_COURS → TERMINE (à la fin de la période)
TERMINE → EN_ATTENTE (à minuit)
```

### Page d'inscription (`register-page.ts`)

**Responsabilité** : Permet l'inscription des participants et membres du jury.

**Fonctionnalités** :

- Formulaire réactif avec validation
- Sélection de compétences (Développeur, Designer, Chef de projet, Communicant)
- Options pour les idées : adopter un sujet existant ou en proposer un nouveau
- Envoi d'emails de confirmation automatique
- Blocage des inscriptions pendant le hackathon

## Services

### HackathonService

Gère les opérations sur les hackathons (création, récupération, génération d'équipes).

### StatusService

Gère le statut du hackathon et les transitions entre états.

### ParticipantService / JuryMemberService

Gèrent les inscriptions des participants et membres du jury.

### TeamService

Gère les équipes générées pour le hackathon.

### EmailService

Envoie les notifications par email aux participants.

## Configuration

### Variables d'environnement

Deux fichiers de configuration :

- `env.dev.ts` : Configuration développement (localhost:8080)
- `env.prd.ts` : Configuration production (API Fly.io)

Le fichier est automatiquement remplacé lors du build production grâce à `angular.json`.

### Constantes (`dashboard.constants.ts`)

Configuration des paramètres du hackathon :

- `MIN_PARTICIPANTS` : Minimum de participants requis (4)
- `MIN_JURY_MEMBERS` : Minimum de membres du jury (1)
- `MIN_DAYS_BETWEEN_PERIODS` : Délai minimum entre deux hackathons (6 jours)
- `TEST_START_OFFSET_MINUTES` : Décalage pour les tests (5 min)
- `TEST_END_OFFSET_MINUTES` : Durée du test (10 min)

## Fonctionnalités avancées

### Génération automatique d'équipes

Lorsque le hackathon passe en mode `EN_COURS`, le système :

1. Génère automatiquement des équipes équilibrées
2. Sélectionne aléatoirement un membre du jury (son sujet devient le thème)
3. Affiche les équipes et le sujet sur le dashboard

### Système de compte à rebours

Le compte à rebours s'adapte au statut :

- **EN_PREPARATION** : Compte à rebours jusqu'au début du hackathon
- **EN_COURS** : Compte à rebours jusqu'à la fin
- **TERMINE** : Compte à rebours jusqu'au nettoyage (minuit)

### Nettoyage automatique

À minuit après la fin d'un hackathon :

1. Le statut repasse à `EN_ATTENTE`
2. Toutes les données sont supprimées (hackathons, équipes, membres du jury, participants)
3. Le système est prêt pour un nouveau cycle

## Workflow typique

1. **Inscription** : Les participants et jury s'inscrivent via la page register
2. **Attente** : Le système attend les conditions minimales (4 participants + 1 jury + 6 jours depuis dernier hackathon)
3. **Préparation** : Création automatique de la période de test
4. **Démarrage** : Génération des équipes et début du hackathon
5. **En cours** : Affichage des équipes et du sujet
6. **Fin** : Hackathon terminé
7. **Nettoyage** : Reset automatique à minuit

## Déploiement

### Développement

```bash
npm start
```

### Production (GitHub Pages)

```bash
ng deploy --base-href /hn-innov-ui/
```

La configuration du build production :

- Remplace automatiquement les fichiers d'environnement
- Applique les optimisations (minification, tree-shaking)
- Génère les fichiers dans `dist/`

## Technologies utilisées

- **Angular 18** : Framework principal
- **RxJS** : Gestion réactive des données
- **Tailwind CSS** : Styles
- **TypeScript** : Langage de programmation
- **HTTP Client** : Communication avec l'API REST

## API Backend

L'application communique avec une API REST Spring Boot :

- **Dev** : http://localhost:8080
- **Prod** : https://hn-innov-api.fly.dev

### Endpoints principaux

- `/participants` : Gestion des participants
- `/jury-members` : Gestion des membres du jury
- `/teams` : Gestion des équipes
- `/subjects` : Gestion des sujets
- `/status` : Gestion du statut
- `/periods` : Gestion des périodes
- `/hackathons` : Gestion des hackathons

## Maintenance

### Ajout d'une nouvelle compétence

Modifier `skillsInfo` dans `register-page.ts` :

```typescript
'Nouvelle Compétence': {
  value: 'Nouvelle Compétence',
  option: 'Nouvelle Compétence',
  title: 'Nouvelle Compétence',
  descriptions: [
    'Description 1',
    'Description 2',
  ],
}
```

### Modification des délais

Modifier les constantes dans `dashboard.constants.ts` selon vos besoins.

### Changement des horaires

Les hackathons commencent le mercredi à 14h30 et se terminent le vendredi à 14h30.
Pour modifier, éditer `calculateNextPeriodDates()` dans `dashboard-page.utils.ts`.

## Bonnes pratiques

- **Console logs** : Seuls les `console.error` sont conservés en production
- **Gestion des erreurs** : Toutes les requêtes HTTP ont un gestionnaire d'erreur
- **Memory leaks** : Les subscriptions sont nettoyées dans `ngOnDestroy`
- **Change detection** : Utilisation de `ChangeDetectorRef` pour les mises à jour
- **Type safety** : Interfaces TypeScript pour toutes les données

## Support

Pour toute question ou problème, consulter le code source ou contacter l'équipe de développement.
