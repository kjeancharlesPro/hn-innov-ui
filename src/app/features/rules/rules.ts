import { Component } from '@angular/core';

@Component({
  selector: 'app-rules',
  imports: [],
  templateUrl: './rules.html',
  styleUrl: './rules.css',
})
export class Rules {
  rules = [
    {
      icon: 'schedule',
      title: 'Durée du hackathon',
      description: 'La durée du hackathon est de 48 heures',
    },
    {
      icon: 'groups',
      title: 'Composition minimale',
      description: 'Il faut avoir au moins 1 membre du jury et minimum 4 participants',
    },
    {
      icon: 'people',
      title: 'Taille des équipes',
      description: 'Les équipes peuvent être à effectifs variables allant de 2 à 4 personnes',
    },
    {
      icon: 'gavel',
      title: 'Taille du jury',
      description: 'La taille du jury est de 5 personnes maximum',
    },
    {
      icon: 'event',
      title: 'Horaires',
      description: 'Il commence le mercredi à 14h30 et se termine le vendredi même heure',
    },
    {
      icon: 'timer',
      title: 'Compte à rebours',
      description: 'Un compte à rebours sera démarré lors du lancement du hackathon',
    },
    {
      icon: 'code',
      title: 'Objectif',
      description:
        'L’objectif est de réaliser un prototype répondant à la problématique de départ dans un temps imparti',
    },
    {
      icon: 'slideshow',
      title: 'Présentation',
      description:
        'La solution de chaque équipe sera présentée à un jury après la fin du compte à rebours',
    },
    {
      icon: 'how_to_vote',
      title: 'Délibération',
      description: 'Le jury devra être présent le vendredi de fin du hackathon pour délibérer',
    },
  ];
}
