
# trello-gantt-app

Diagramme de Gantt à partir des cartes Trello

## Comment qui marche

Application Angular, utiliser [Angular CLI](https://github.com/angular/angular-cli#installation). Lancer `npm install` pour installer les dépendances.

Lancer `npm run-script start` pour lancer le serveur de dev, accessible à l'adresse `http://localhost:4200/`.

## Déployer l'application

Run `npm run-script build` pour compiler l'application. L'application compilée sera disponible dans le répertoire `dist/`, à déposer sur un serveur web.

## Functionality overview

L'application fonctionne sans base de données, elle s'appuie sur la connexion de l'utilisateur et stocke toutes les informations de personnalisations et d'authentification sur le navigateur du client (localestorage).

**Fonctionnalités :**

- Authentification Trello
- Génération d'un diagramme de Gantt
- Possibilité de préciser date début / fin / échéance
- Personnalisation affichage (gestion des champs supplémentaires)
- Possibilité de filter les cartes
- Export des lignes projets via le presse-papier
