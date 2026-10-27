/* Moon Sweeper : scénario, radio, anecdotes et blagues.
   Chargé à part : définit window.STORY, sans toucher au jeu.
   Toutes les anecdotes (facts, finds) sont vérifiées ; les clins d’œil
   aux films sont des paraphrases ou des citations très courtes. */
window.STORY = {

  /* Le patron, voix récurrente à la radio */
  boss: {
    name: 'Gilbert Ramassoux',
    title: 'Directeur général de Lunaclean SARL (« On fait briller la Lune depuis cinq semaines »)',
    callsign: 'Base Ramassoux',
    tone: 'Pompeux, obsédé par les devis et les slogans, cinéphile raté qui cite mal les films, mais au fond très attaché à son unique employé lunaire.',
    tics: ['« Over et out, et out encore. »', 'Parle de lui à la troisième personne quand il est fier.', 'Confond tous les films de science-fiction.']
  },

  /* Progression : 6 chapitres */
  chapters: [
    {
      id: 'ch1',
      title: 'Premier jour, premier coup de brosse',
      intro: 'Ici Ramassoux. Bienvenue chez Lunaclean, leader mondial du nettoyage lunaire, puisque seul sur le marché. Voici ta brosse à dents. Fais briller la base Tranquillité.',
      goal: 'Nettoie les abords de la base Tranquillité et vends ton premier sac de poussière.',
      outro: 'Premier sac vendu ! Un petit pas pour toi, un grand pas pour ma trésorerie. Tu as gagné le droit d’aller plus loin.'
    },
    {
      id: 'ch2',
      title: 'Mer de la Tranquillité',
      intro: 'Direction la Mer de la Tranquillité, là où Eagle s’est posé en 1969. Ce n’est pas une mer, il n’y a pas d’eau, et pourtant le client veut que ça brille. Va.',
      goal: 'Explore la Mer de la Tranquillité et retrouve un souvenir historique d’Apollo 11.',
      outro: 'Tu as rendu sa dignité à un site historique. Ramassoux verse une larme. Enfin, c’est peut-être la poussière.'
    },
    {
      id: 'ch3',
      title: 'Océan des Tempêtes',
      intro: 'Prochaine mission : l’Océan des Tempêtes. Rassure-toi, pas de tempête, pas d’océan. Juste beaucoup, beaucoup de poussière. Apollo 12 s’y est posé, range derrière eux.',
      goal: 'Nettoie un grand secteur de l’Océan des Tempêtes et achète ton premier véhicule.',
      outro: 'Un véhicule ! Tu passes de technicien de surface à pilote de surface. Je réimprime tes cartes de visite.'
    },
    {
      id: 'ch4',
      title: 'Les Hauts de Tycho',
      intro: 'Les Hauts de Tycho, maintenant. Dans un vieux film, on y déterrait un truc noir et bizarre. Si tu trouves quelque chose qui bourdonne, tu n’y touches pas et tu m’appelles.',
      goal: 'Grimpe sur les Hauts de Tycho, débloque une équipe d’aide et trouve au moins 8 objets.',
      outro: 'Tu as maintenant une équipe. Officiellement, tu es manager. Officieusement, tu balaies toujours. Bravo.'
    },
    {
      id: 'ch5',
      title: 'La Face cachée',
      intro: 'La Face cachée. Elle n’est pas sombre, elle est juste timide : on ne la voit jamais d’ici. Petit souci : derrière la Lune, je risque de couper. Profites-en pour souffler.',
      goal: 'Atteins la Face cachée, nettoie-la et rapporte un objet qui ne vient visiblement pas de la Terre.',
      outro: '… allô ? Ah, te revoilà ! J’ai eu peur. Pas pour toi, pour le matériel. Non, pour toi aussi. Un peu.'
    },
    {
      id: 'ch6',
      title: 'Le grand ménage',
      intro: 'Dernier contrat : le client veut une Lune impeccable, visible depuis la Terre. Rassemble les 14 trouvailles et le monolithe cessera peut-être de bourdonner.',
      goal: 'Complète la collection de 14 objets et termine le nettoyage de toutes les régions.',
      outro: 'La Lune brille. Les Terriens lèvent les yeux et disent « tiens, elle est propre ce soir ». Tu es l’employé du mois. Et du siècle.'
    }
  ],

  /* Messages radio courts, déclenchés par événement (≤ 120 caractères) */
  radio: [
    { when: 'start', text: 'Ici Ramassoux. La Lune, c’est 38 millions de km² à balayer. Pas de panique, on a jusqu’à jeudi.' },
    { when: 'start', text: 'Rappel sécurité : pas de casque, pas de chocolat. Et pas d’air non plus, d’ailleurs.' },
    { when: 'start', text: 'Nouvelle journée ! Le soleil se lève, il se couchera dans deux semaines. Prends ton temps.' },
    { when: 'sell', text: 'Vendu ! Le cours de la poussière lunaire est stable. Pour l’instant, c’est moi qui le fixe.' },
    { when: 'sell', text: 'Caisse enregistrée. Ramassoux est fier. Ramassoux s’achète un deuxième stylo.' },
    { when: 'sell', text: 'Encore un sac ! À ce rythme, je pourrai bientôt te payer en vrai argent.' },
    { when: 'bagFull', text: 'Sac plein. Même en apesanteur partielle, il y a des limites. Retour à la base !' },
    { when: 'bagFull', text: 'Ton sac déborde. Houston, on a un problème… de rangement.' },
    { when: 'bagFull', text: 'Plus de place ! Ne tasse pas avec le pied, c’est comme ça qu’on perd des chaussettes.' },
    { when: 'meteor', text: 'Pluie de micrométéorites ! Ici, pas de parapluie qui tienne. Mets-toi à l’abri.' },
    { when: 'meteor', text: 'Météore en approche ! Comme dans Gravity, mais en plus petit et avec moins de George Clooney.' },
    { when: 'meteor', text: 'Ça tombe dru ! Bonne nouvelle : chaque cratère, c’est de la poussière fraîche à vendre.' },
    { when: 'find', text: 'Une trouvaille ! Je la note dans l’inventaire. Puis je la note dans mes souvenirs. Snif.' },
    { when: 'find', text: 'Objet historique repéré. Pas touche au compteur kilométrique, c’est du patrimoine.' },
    { when: 'find', text: 'Encore un trésor ! Si tu trouves mes clés de voiture, elles sont à moi.' },
    { when: 'sector', text: 'Secteur nettoyé ! Vu de la Terre, c’est un pixel plus brillant. Ma mère dit merci.' },
    { when: 'sector', text: 'Impeccable. Même Wall-E demanderait ton numéro.' },
    { when: 'sector', text: 'Secteur terminé. On pourrait y manger par terre. Sauf qu’il faudrait enlever le casque.' },
    { when: 'vehicle', text: 'Nouveau véhicule ! Le rover d’Apollo 17 a frôlé 18 km/h. Toi, essaie de ne pas battre ce record.' },
    { when: 'vehicle', text: 'Tu as les clés. Contrôle technique valable jusqu’en 3024. Pas de radar, pas d’excuse.' },
    { when: 'idle', text: 'Tout va bien ? Tu regardes la Terre, hein ? Moi aussi, ça me fait ça. Prends ton temps.' },
    { when: 'idle', text: 'Petite pause ? Bonne idée. Respire. Enfin, respire l’air de ta bouteille.' },
    { when: 'idle', text: 'Allô ? Si tu fais une sieste, mets au moins le panneau « Ne pas déranger » sur ton casque.' },
    { when: 'idle', text: 'Je patiente. J’ai mis la musique d’attente : c’est la valse de 2001. Évidemment.' },
    { when: 'night', text: 'La nuit tombe : deux semaines d’obscurité. Allume ta frontale et pense à la Terre qui brille.' },
    { when: 'night', text: 'Nuit lunaire, -170 °C. Le chauffage de la combinaison est inclus. Le café, non.' },
    { when: 'night', text: 'Il fait noir. Si tu vois un vélo passer devant la Terre, c’est E.T. Fais-lui coucou.' },
    { when: 'combo', text: 'Combo ! Tu balaies plus vite que ton ombre. Et ici, ton ombre est très nette.' },
    { when: 'combo', text: 'Série en cours ! Que la Force du balai soit avec toi.' },
    { when: 'combo', text: 'Quel rythme ! Ramassoux envisage de t’augmenter. Ramassoux envisage beaucoup de choses.' },
    { when: 'region:1', text: 'Mer de la Tranquillité ! Armstrong et Aldrin sont passés ici. Essuie tes bottes, par respect.' },
    { when: 'region:1', text: 'Attention, empreintes historiques. Tu balaies autour. Pas dessus. Autour.' },
    { when: 'region:1', text: 'Tranquillité, c’est le nom. Alors on fait le ménage tranquillement, d’accord ?' },
    { when: 'region:2', text: 'Océan des Tempêtes. Maillot de bain inutile : pas une goutte d’eau depuis des milliards d’années.' },
    { when: 'region:2', text: 'Apollo 12 a été frappé deux fois par la foudre au décollage. Ici, au moins, pas d’orage.' },
    { when: 'region:2', text: 'Si tu croises une sonde Surveyor, salue-la : elle attend de la compagnie depuis 1967.' },
    { when: 'region:3', text: 'Hauts de Tycho. Si un truc noir et rectangulaire bourdonne, tu ne le touches pas. Promis ?' },
    { when: 'region:3', text: 'Tycho est jeune : environ 100 millions d’années. Un bébé cratère. Sois gentil avec lui.' },
    { when: 'region:4', text: 'Face cachée : crrr… pas de réseau… crrr… pense à… crrr… mon devis…' },
    { when: 'region:4', text: 'Te revoilà ! Comme Apollo derrière la Lune : silence radio, puis on souffle de soulagement.' }
  ],

  /* Anecdotes vraies (≤ 140 caractères) */
  facts: [
    { text: 'Le 20 juillet 1969, Armstrong et Aldrin se posent ; Michael Collins tourne seul en orbite dans Columbia.', src: 'Apollo 11, 1969' },
    { text: 'Pendant la descente d’Eagle, des alarmes 1202 et 1201 ont sonné : l’ordinateur était surchargé. Le contrôle a dit « on continue ».', src: 'Apollo 11, 1969' },
    { text: 'Un disjoncteur de l’étage de remontée était cassé : Aldrin l’a enclenché avec un feutre.', src: 'Apollo 11, 1969' },
    { text: 'De retour, l’équipage a rempli une déclaration de douane à Honolulu listant « roches et poussière lunaires ».', src: 'Apollo 11, 1969' },
    { text: 'Apollo 12 a été frappé deux fois par la foudre au décollage. La consigne « SCE to Aux » a sauvé la mission.', src: 'Apollo 12, 1969' },
    { text: 'Apollo 12 s’est posé près de la sonde Surveyor 3 et en a rapporté des pièces sur Terre.', src: 'Apollo 12, 1969' },
    { text: 'Après l’explosion d’un réservoir d’oxygène, l’équipage a adapté un filtre carré à un logement rond avec carton, sacs et scotch.', src: 'Apollo 13, 1970' },
    { text: 'Stuart Roosa a emporté des graines d’arbres en orbite lunaire. Plantés sur Terre, ce sont les « arbres lunaires ».', src: 'Apollo 14, 1971' },
    { text: 'Dave Scott a lâché un marteau et une plume sur la Lune : sans air, ils ont touché le sol en même temps. Galilée avait raison.', src: 'Apollo 15, 1971' },
    { text: 'Charlie Duke a laissé sur la Lune une photo de sa famille, avec un mot au dos.', src: 'Apollo 16, 1972' },
    { text: 'L’aile du rover d’Apollo 17 a été réparée avec du scotch et des cartes plastifiées.', src: 'Apollo 17, 1972' },
    { text: 'Gene Cernan est le dernier humain à avoir marché sur la Lune, en décembre 1972.', src: 'Apollo 17, 1972' },
    { text: 'Douze hommes ont marché sur la Lune, tous entre 1969 et 1972.', src: 'Programme Apollo, 1969-1972' },
    { text: 'Plusieurs astronautes trouvaient que la poussière lunaire sentait la poudre à canon brûlée.', src: 'Programme Apollo, 1969-1972' },
    { text: 'Les missions Apollo ont rapporté environ 382 kg de roches et de poussière lunaires.', src: 'Programme Apollo, 1969-1972' },
    { text: 'La photo « Earthrise », la Terre se levant au-dessus de la Lune, a été prise par Bill Anders.', src: 'Apollo 8, 1968' },
    { text: 'Luna 2 est le premier objet humain à atteindre la Lune : elle s’y est écrasée volontairement.', src: 'Luna 2, 1959' },
    { text: 'Luna 3 a envoyé les toutes premières photos de la face cachée de la Lune.', src: 'Luna 3, 1959' },
    { text: 'Luna 9 a réussi le premier atterrissage en douceur sur la Lune et envoyé des photos du sol.', src: 'Luna 9, 1966' },
    { text: 'Lunokhod 1 a été le premier rover téléguidé à rouler sur un autre astre.', src: 'Luna 17, 1970' },
    { text: 'Chang’e 4 a réalisé le premier atterrissage sur la face cachée, avec un satellite relais pour parler à la Terre.', src: 'Chang’e 4, 2019' },
    { text: 'La Lune s’éloigne de la Terre d’environ 3,8 cm par an, mesuré grâce aux réflecteurs laser.', src: 'Expérience LLR, depuis 1969' },
    { text: 'La face cachée n’est pas sombre : elle reçoit autant de soleil. On ne la voit jamais depuis la Terre, c’est tout.', src: 'Rotation synchrone' },
    { text: 'Un jour lunaire, d’un lever de soleil au suivant, dure environ 29,5 jours terrestres.', src: 'Mouvement lunaire' },
    { text: 'Youri Gagarine a été le premier humain dans l’espace, pour un vol d’environ 108 minutes.', src: 'Vostok 1, 1961' }
  ],

  /* Textes enrichis des trouvailles (≤ 200 caractères), mêmes ids que FINDS */
  finds: {
    golf: 'Alan Shepard l’a frappée en 1971 avec un fer 6 fixé à un outil. Il parlait de « kilomètres » ; les analyses récentes disent plutôt quelques dizaines de mètres. Le golf, c’est dur.',
    flag: 'Aldrin a vu ce drapeau tomber au décollage d’Eagle en 1969. Ceux d’Apollo 12, 16 et 17 tiennent encore debout, d’après leurs ombres. Tu le redresses : la NASA te doit un café.',
    sock: 'Sur l’ISS, on ne lave pas le linge : les vêtements sales repartent dans des cargos qui brûlent dans l’atmosphère. Celle-ci a dû rater sa navette.',
    reflector: 'Apollo 11, 14 et 15 ont déposé des réflecteurs. Des lasers tirés depuis la Terre y rebondissent encore : la Lune s’éloigne d’environ 3,8 cm par an. Souris, tu es mesuré.',
    cheese: 'En 2010, le premier vaisseau Dragon de SpaceX a emporté en secret une meule de fromage, clin d’œil aux Monty Python. Wallace et Gromit en seraient ravis.',
    eagle: 'L’étage de descente d’Eagle est resté en 1969 avec une plaque : « Nous sommes venus en paix pour toute l’humanité ». Il s’est posé dans la Mer de la Tranquillité. Comme toi.',
    duck: 'Les équipages emportent souvent une peluche comme indicateur d’apesanteur : quand elle flotte, on est en orbite. Ce canard a pris son rôle très au sérieux.',
    lrv: 'Trois rovers sont restés sur la Lune (Apollo 15, 16, 17). Roues en maille de fil d’acier, pas de crevaison. Celui d’Apollo 17 a frôlé 18 km/h. Toujours garé en double file.',
    he3: 'Le vent solaire dépose de l’hélium-3 dans le sol lunaire ; il est très rare sur Terre. Harrison Schmitt, géologue d’Apollo 17, rêvait de l’exploiter. Ramassoux aussi.',
    capsule: 'Apollo 11 a laissé un disque de silicium gravé de messages de 73 chefs d’État. Cette capsule-ci est moins officielle. À ouvrir en 3024, comme indiqué. Pas avant. Même un peu.',
    lunokhod: 'Lunokhod 2 a roulé environ 39 km en 1973, record de distance hors Terre battu par Opportunity sur Mars en 2014. Son réflecteur sert encore aux tirs laser. Respect, camarade.',
    fossil: 'Aucune trace de vie dans les roches d’Apollo : la quarantaine des équipages a été abandonnée après Apollo 14. Mais cette spirale violette, tiède… on garde ça entre nous.',
    ufo: 'En 1969, l’équipage d’Apollo 11 a vu un objet suivre le vaisseau : sans doute un panneau de leur propre fusée. Celui-ci, par contre, a clairement raté son créneau. E.T., c’est toi ?',
    monolith: 'Dans 2001 (sorti en 1968, un an avant Apollo 11), un monolithe est déterré dans le cratère Tycho. Tu viens d’en trouver un. On a dit : on ne touche pas. On ne touche pas.'
  },

  /* Blagues spatiales (courtes, bienveillantes) */
  jokes: [
    'Pourquoi la Lune ne mange-t-elle jamais ? Parce qu’elle est déjà pleine.',
    'Le restaurant de la base ? Cuisine excellente, mais aucune atmosphère.',
    'Comment s’organise une fête sur la Lune ? On planète tout à l’avance.',
    'Pourquoi le soleil n’a-t-il pas fait d’études ? Il avait déjà des millions de degrés.',
    'Qu’est-ce qu’un astronaute dit à son balai ? « On va faire le tour de la question. Et de la Lune. »',
    'Pourquoi les astronautes sont-ils de bons fêtards ? Ils savent mettre l’ambiance en orbite.',
    'Quelle est la chanson préférée des aspirateurs lunaires ? « Poussière d’étoiles ».',
    'Pourquoi Saturne a-t-elle des anneaux ? Elle a dit oui plusieurs fois.',
    'Comment appelle-t-on une Lune qui fait du sport ? Un croissant… musclé.',
    'Pourquoi la poussière lunaire est-elle si calme ? Elle est dans la Mer de la Tranquillité.',
    'Quel est le comble pour un astronaute ? Avoir la tête dans les étoiles et les pieds dans la poussière.',
    'Que dit la Terre à la Lune ? « Arrête de tourner autour du pot. »',
    'Pourquoi le rover lunaire n’a-t-il jamais d’amende ? Pas de radar, et le gendarme le plus proche est à 384 000 km.',
    'Comment s’appelle un astronaute qui fait le ménage ? Un balayeur des étoiles. Ou un employé de Ramassoux.',
    'Pourquoi le canard est-il allé sur la Lune ? Pour faire coin-coin en apesanteur, mais il n’a trouvé qu’un sixième de gravité.',
    'Pourquoi la face cachée est-elle timide ? Elle n’a jamais été prise en photo avant 1959.',
    'Qu’est-ce qu’un trou noir mange au petit-déjeuner ? Tout. Il ne laisse même pas de miettes.',
    'Pourquoi les extraterrestres n’ont pas répondu ? On les a mis en attente avec la musique de 2001.',
    'Comment Haddock trinque-t-il en apesanteur ? En courant après son whisky, qui fait des bulles en l’air.',
    'Pourquoi le monolithe bourdonne-t-il ? Il ne connaît pas les paroles.'
  ]
};
