/* Moon Sweeper · histoire.js : deux collègues à la radio (Maëlle la stagiaire, le Client), l’enquête du monolithe
   en 5 indices, le journal de bord, quatre épilogues et un supplément de blagues. Ne touche qu’à MS. */
(() => {
  const { S, ST, on, say, modal, sheet, button, FINDS, BADGES, $, markSave } = MS;
  const H = S.hist ??= { sec: 0, clues: [], ends: [], done: false, combo: 1 };   // état de l’histoire (sauvegardé avec S)
  S.journal ??= []; S.factsSeen ??= []; S.stats.play ??= 0; S.stats.zenT ??= 0;
  const radioEl = $('radio'), modalEl = $('modal'), rname = $('rname'), rtxt = $('rtxt'), factEl = $('facttxt');
  const free = () => !radioEl.classList.contains('on');                        // aucune bulle radio affichée ?
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const MAELLE = 'Maëlle (stagiaire)', CLIENT = 'Le Client';
  document.head.insertAdjacentHTML('beforeend', `<style>
    #mtxt { white-space: pre-line; }
    .jour { display: grid; gap: 4px; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.04); }
    .jour b { font: 700 15px var(--display); letter-spacing: .1em; text-transform: uppercase; color: var(--gold); }
    .jour p { margin: 0; color: #cfd3dc; }
    .jour.ind { border-color: rgba(255,138,42,.5); background: rgba(255,138,42,.07); } .jour.ind b { color: var(--accent); }
    .jour.fin { border-color: rgba(99,224,143,.5); background: rgba(99,224,143,.06); } .jour.fin b { color: var(--good); }
    .jour.vide { color: var(--muted); font-style: italic; }
  </style>`);

  // ===== 1. Les collègues =====
  // Maëlle : 30 répliques (achat bon marché / cher, combo, secteur, badge, pause)
  const MA = {
    buy: [
      'Bel achat. J’ai vérifié la facture : c’est bon, c’est le patron qui s’est trompé dans son sens.',
      'Nouveau matos ! Je l’ai noté en « petites fournitures ». Le patron ne lit jamais cette ligne.',
      'Achat validé. La garantie ne couvre pas les météorites, j’ai lu les petites lignes.',
      'Joli. Avec ça, tu balaieras plus vite que ton ombre. Qui, ici, ne bouge pas pendant deux semaines.'
    ],
    cher: [
      'Tout ce budget ? Houston, on a un problème de trésorerie. Je préviens le patron pendant sa sieste.',
      'Cher, mais joli. Le patron a dit « investissement ». Il dit ça aussi pour sa machine à café.',
      'Tu viens de dépenser plus que mon stage entier. Je dis ça, je dis rien. Enfin si, je le dis.',
      'Quatre zéros sur la note. Si le patron râle, dis-lui que c’est « pour la vue depuis la terrasse ».'
    ],
    combo: [
      'Combo ! Tu balaies comme Wall-E un lundi matin. Avec moins de cafards et plus de pépites.',
      'Oh, la série ! Je mets la valse du Beau Danube bleu. Le patron croit que c’est Star Wars.',
      'Quel rythme ! Je t’ai filmé pour le stand de Lunaclean au salon. Enfin, si on a un stand.',
      'Combo × 3 ! Même R2-D2 n’irait pas plus vite. Lui, au moins, il a des roulettes.',
      'Joli enchaînement. Le patron veut en faire un slogan. Je vais l’en dissuader. Comme d’habitude.'
    ],
    sector: [
      'Secteur propre ! Je l’ai colorié sur la carte de la cantine. Au feutre, comme Aldrin.',
      'Encore un secteur. Vu d’ici, c’est un pixel. Vu de la terrasse du Client, c’est une facture.',
      'Nickel. Je dirais presque « chrome ». Le patron dirait « brillant comme ma carrière ».',
      'Secteur fini. J’ai mis à jour le tableau : tu es loin devant tout le monde. Tu es seul, aussi.',
      'Propre ! Si le monolithe bourdonne plus fort, ce n’est pas toi. Enfin, je crois.',
      'Un secteur de plus. Moi je compte en secteurs ; le patron, lui, compte en devis.'
    ],
    badge: [
      'Un badge ! Je l’accroche au tableau, à côté de la photo du patron déguisé en Dark Vador.',
      'Badge validé. Certifié par moi-même : le mardi, je suis le service qualité.',
      'Nouveau badge. Le patron a demandé s’il pouvait en avoir un aussi. J’ai dit : « balaie ».',
      'Un badge de plus. À ce rythme, il faudra un deuxième tableau. En liège, cette fois.',
      'Bravo ! Charlie Duke a laissé une photo de famille sur la Lune. Toi, tu y laisses des badges.',
      'Badge ! Je l’annonce à la cafétéria. Il n’y a que moi, mais j’applaudis fort.'
    ],
    idle: [
      'Tu fais une pause ? Bonne idée. Je colle « Ne pas déranger » sur ton écran. Devant le patron.',
      'Allô ? Si tu regardes la Terre, cherche la terrasse du Client. On dirait qu’il nous fait coucou.',
      'Pause réglementaire. Je la note. Le patron la déduira. Je la renoterai. C’est notre petit jeu.',
      'Tu dors debout ? Comme Mark Watney sur Mars, mais sans pommes de terre. Ni Mars.',
      'Silence radio. J’espère que tu contemples. Sinon je t’envoie la musique d’attente du monolithe.'
    ]
  };
  // Le Client : 6 lignes de fin de chapitre (de plus en plus étranges) et 6 lignes de secteur, par paliers
  const CL = {
    chapter: [
      'Ici le Client. Je vous observe depuis ma terrasse, au télescope en or. Continuez : elle brille un peu plus.',
      'Le Client. Votre travail me plaît. J’ai fait agrandir la terrasse pour mieux voir. Et un deuxième jacuzzi.',
      'Le Client. Hier soir, la Lune a clignoté. Deux fois. Était-ce vous ? Répondez par clignotement.',
      'Le Client. Mon télescope capte un bourdonnement. Mon majordome dit que c’est le frigo. Il ment.',
      'Le Client. Un aveu : je n’ai jamais commandé ce nettoyage. Quelqu’un l’a commandé pour moi. Il y a longtemps.',
      'Le Client. Le colis « Lune propre » est arrivé sur ma terrasse. Avec un paillasson. Merci.'
    ],
    sector: [
      ['Ici le Client. Je vous regarde depuis ma terrasse. Un secteur de plus : je lève mon cocktail à votre santé.',
       'Le Client. Beau travail. Ma terrasse a une vue splendide. Enfin, elle l’aura, quand vous aurez fini.'],
      ['Le Client. Le secteur que vous venez de finir, je l’ai vu. À l’œil nu. Mon voisin aussi. Il est jaloux.',
       'Le Client. J’ai nommé ce secteur « Terrasse 2 ». Ne le dites pas aux Nations unies.'],
      ['Le Client. Ma terrasse bourdonne, maintenant. La même note que votre monolithe. Je n’ai pas de monolithe.',
       'Le Client. J’ai reçu un bon de commande daté d’il y a quatre millions d’années. À mon nom. C’est normal ?']
    ]
  };
  const tier = () => S.chapter >= 4 ? 2 : S.chapter >= 2 ? 1 : 0;

  on('buy', (type, item) => { if (type === 'veh') return; if (Math.random() < .7) say(MAELLE, pick((item.price || 0) >= 3000 ? MA.cher : MA.buy)); });   // le patron parle déjà aux véhicules
  on('badge', b => { if (b.id !== 'enq' && free()) say(MAELLE, pick(MA.badge)); });
  on('sector', () => {
    H.sec++;
    if (H.sec % 6 === 0) say(CLIENT, pick(CL.sector[tier()]));                 // 1 fin de secteur sur 6
    else if (H.sec % 3 === 1 && free()) say(MAELLE, pick(MA.sector));          // 1 sur 3, seulement si la radio est libre
  });

  // ===== 2. L’enquête du monolithe =====
  const CLUE_AT = [3, 6, 9, 11, 13];                                           // n° de trouvaille (ordre de découverte) qui débloque un indice
  const CLUES = [
    ['Un bourdonnement, des mots', '« …MERCI DE PATIENTER. Votre appel est important pour nous. Temps d’attente estimé : quatre millions d’années… »'],
    ['Une offre spéciale', '« …OFFRE réservée aux satellites naturels : pour toute Lune nettoyée, un deuxième satellite OFFERT. Frais de port non inclus… »'],
    ['Un numéro de commande', '« …commande n° 2001 confirmée. Article : « Lune propre, visible depuis la terrasse ». Livraison par un sous-traitant local… »'],
    ['Une adresse de livraison', '« …adresse : Terre, troisième planète, grande terrasse avec jacuzzi. Le client exige « sans poussière, sans rayures »… »'],
    ['Pour parler à un conseiller', '« …le bourdonnement n’est pas une menace : c’est la musique d’attente. Pour parler à un conseiller, touchez le monolithe… »']
  ];
  const FINALE = 'Tu touches. Le bourdonnement s’arrête. Une voix suave : « Galacto-Shop, le télé-achat des galaxies, bonjour ! »\n\n' +
    'Le monolithe n’est pas un dieu, ni un professeur pour singes : c’est une antenne de télé-achat intergalactique, plantée ici pour capter les commandes du coin. ' +
    'Il y a quatre millions d’années, quelqu’un sur la troisième planète a commandé l’article n° 2001 : une Lune propre, visible depuis la terrasse. ' +
    'Délai de livraison : trois à cinq ères géologiques. Sous-traitant local : Lunaclean SARL.\n\n' +
    'Tu n’étais pas un balayeur. Tu étais la livraison. Le monolithe demande : « Souhaitez-vous aussi le paillasson ? » Ramassoux hurle « PAS TOUCHE ». Trop tard.';
  BADGES.push({ id: 'enq', name: 'Enquêteur', txt: 'Percer le secret du monolithe.', ok: () => !!H.done });

  // file de modales : le jeu ouvre déjà la sienne juste après 'find' et 'chapter' ; la nôtre attend que la fenêtre soit libre
  const mq = []; let mcool = 0, wasOpen = false;
  const queueModal = (kick, name, txt, rew, ok) => mq.push([kick, name, txt, rew, null, ok]);
  on('find', f => {
    const n = S.found.length;
    if (f.id === 'monolith') {
      if (H.done) return; H.done = true; markSave();
      queueModal('Enquête résolue', 'Le secret du monolithe', FINALE, 'Badge : Enquêteur', 'On a dit : on touche');
      say(MAELLE, 'Du télé-achat. Quatre millions d’années de musique d’attente. Je comprends mieux le Client.');
      return;
    }
    const i = CLUE_AT.indexOf(n);
    if (i < 0 || H.clues.includes(i)) return;
    H.clues.push(i); markSave();
    queueModal(`Indice ${i + 1}/5`, CLUES[i][0], 'Le monolithe bourdonne un peu plus fort. Dans le bourdonnement, un fragment :\n\n' + CLUES[i][1] + '\n\nRelisible dans le Journal.', null, i === 4 ? 'Toucher ?' : 'Noté');
  });

  // ===== 4. Fins alternatives (fin du chapitre 6) =====
  const ENDS = {
    zen: ['La fin contemplative', 'Tu as passé plus de temps à regarder la Terre qu’à viser la poussière, et pourtant la Lune brille. Pas d’étoiles filantes, pas de chronomètre : juste un balai, le silence, et une planète bleue qui se lève toutes les… jamais, en fait, elle ne bouge pas. Tu t’assieds sur le rebord d’un cratère. Le monolithe a cessé de bourdonner ; ou alors tu as cessé de l’écouter. Un petit pas pour toi, une grande sieste pour l’humanité.',
      ['Gilbert', 'Je ne comprends pas ta méthode, mais le Client est content, et Ramassoux pleure. De fierté. Over et out, et out encore.'],
      [MAELLE, 'Tu as fini en mode zen. Je l’ai noté dans ton dossier, rubrique « sagesse ». Le patron n’a pas cette rubrique.'],
      [CLIENT, 'De ma terrasse, je vous vois assis. Je m’assieds aussi. Nous sommes deux à ne rien faire. C’est parfait.']],
    museum: ['La fin du musée', 'Quatorze trouvailles, tous les badges, pas une poussière. La Lune est devenue le plus grand musée à ciel ouvert, sans ciel. Tu as redressé le drapeau, retrouvé la chaussette, rangé le rover et décodé le télé-achat. Les visiteurs arriveront dans quelques millénaires ; en attendant, le canard en plastique assure l’accueil. La plaque à l’entrée dit : « Nous sommes venus en paix. Et avec un balai. »',
      ['Gilbert', 'Un musée ! Ramassoux met son nom sur la plaque. En petit. Juste sous le tien. Bon, juste au-dessus.'],
      [MAELLE, 'Tout trouvé, tout gagné. Je n’ai plus rien à commenter. C’est frustrant. Fais-moi une faute, pour voir.'],
      [CLIENT, 'Je vois les vitrines depuis ma terrasse. J’ai commandé la visite guidée. Livraison dans deux ères.']],
    speed: ['La fin du speedrunner', 'Moins de trois heures. Les astronautes d’Apollo 11 sont restés deux heures et demie sur le sol lunaire ; toi, tu as nettoyé la Lune entière dans le même temps, ou presque. Le Client a cligné des yeux et a raté la moitié. Gilbert a oublié de lancer le chronomètre. Le monolithe, lui, a tout vu : il te propose un abonnement « livraison express ». Tu refuses, tu as déjà fini.',
      ['Gilbert', 'Terminé ?! Je n’avais même pas fini mon devis. Ramassoux est dépassé. Ramassoux est fier. Les deux.'],
      [MAELLE, 'Trois heures. Mon stage dure six mois. Je crois que je viens de comprendre le mot « stagiaire ».'],
      [CLIENT, 'J’ai détourné le regard pour saler mes cacahuètes et c’était fini. Remboursez-moi le suspense.']],
    model: ['La fin de l’employé modèle', 'Tu as balayé, vendu, acheté, recommencé. Pas de raccourci, pas de miracle : un sac après l’autre, comme on répare une aile de rover avec du scotch et des cartes plastifiées. La Lune brille, le Client lève les yeux, et quelque part un disjoncteur cassé est enclenché avec un feutre. Lunaclean SARL a une nouvelle devise : « On fait briller la Lune depuis six semaines. » Tu es l’employé du mois. Il n’y en a qu’un, mais quand même.',
      ['Gilbert', 'Employé du mois, du siècle, de l’ère. Je réimprime tes cartes de visite. En doré. Enfin, en jaune.'],
      [MAELLE, 'Tu as tout fait dans l’ordre. Le patron veut en faire une méthode. Je la nommerai « le balai ».'],
      [CLIENT, 'Depuis ma terrasse, elle est parfaite. Je vais la regarder tous les soirs. Puis commander Mars.']]
  };
  const allBadges = () => BADGES.every(b => S.badges.includes(b.id) || b.ok());
  const endKey = () => S.stats.zenT > S.stats.play / 2 ? 'zen' : S.found.length >= FINDS.length && allBadges() ? 'museum' : S.stats.play < 3 * 3600 ? 'speed' : 'model';
  on('chapter', n => {
    if (CL.chapter[n - 1]) say(CLIENT, CL.chapter[n - 1]);
    if (n < 6) return;
    const k = endKey(), e = ENDS[k];
    if (!H.ends.includes(k)) H.ends.push(k); markSave();
    queueModal('Épilogue', e[0], e[1] + '\n\n' + e.slice(2).map(([q, t]) => `${q} : « ${t} »`).join('\n'), null, 'Fin');
  });

  // ===== 3. Journal de bord =====
  const TPL = [
    'Jour {n}. Vendu {sold} sacs. Le patron a dit que c’était « un grand pas pour sa trésorerie ».',
    'Jour {n}. {km} km au compteur. Lunokhod 2 en a fait 39 ; je ne compte pas les détours vers la base.',
    'Jour {n}. Chapitre {ch}. Le patron a dit que le Client regardait. J’ai fait coucou à la Terre.',
    'Jour {n}. {found} trouvailles sur 14. Le canard en plastique n’est toujours pas revenu à sa baignoire.',
    'Jour {n}. {badges} badges. Maëlle les a accrochés au tableau. Le patron veut un tableau à son nom.',
    'Jour {n}. {stars} éclats d’étoiles ramassés. Gravity, en plus petit, en moins George Clooney.',
    'Jour {n}. {nugs} pépites. Le patron a dit que c’était « de l’hélium-3 bon marché ». C’est de la pépite.',
    'Jour {n}. ${money} en caisse. Le patron a dit qu’il envisageait une augmentation. Il envisage.',
    'Jour {n}. Le soleil n’a pas bougé. Normal : il se couchera dans deux semaines. J’ai balayé quand même.',
    'Jour {n}. Vendu {sold} sacs en tout. Le patron parle de lui à la troisième personne. Ramassoux est fier.',
    'Jour {n}. Chapitre {ch}, {found} objets trouvés. Si je trouve ses clés de voiture, elles sont à lui.',
    'Jour {n}. J’ai mis le casque. J’ai oublié le chocolat. Il n’y avait pas d’air non plus.',
    'Jour {n}. {km} km à pied ou en rover. Le rover d’Apollo 17 a frôlé 18 km/h. Je n’ai battu aucun record.',
    'Jour {n}. Le monolithe bourdonne. Le patron a dit : pas touche. Maëlle a dit : « il ne connaît pas les paroles ».',
    'Jour {n}. {sold} sacs vendus. Le cours de la poussière est stable : c’est le patron qui le fixe.',
    'Jour {n}. Regardé la Terre dix minutes. Maëlle a noté la pause. Le patron l’a déduite. Elle l’a renotée.',
    'Jour {n}. {badges} badges, {found} trouvailles. Comme Tintin, j’ai marché sur la Lune. Sans Milou. Sans whisky.',
    'Jour {n}. Rien à signaler. Houston, on n’a pas de problème. Ça fait bizarre.',
    'Jour {n}. Chapitre {ch}. Le patron a cité 2001 ; c’était Star Wars. Je n’ai rien dit.',
    'Jour {n}. {stars} éclats d’étoiles. Maëlle dit que c’est « de la vaisselle cosmique ». Je range.',
    'Jour {n}. ${money} en caisse. Le Client a appelé : il veut voir ça « depuis sa terrasse ». Quelle terrasse ?',
    'Jour {n}. La poussière sent la poudre à canon brûlée, paraît-il. Je ne peux pas vérifier : casque.',
    'Jour {n}. {sold} sacs. Le patron a dit « over et out, et out encore ». Je commence à l’aimer bien.',
    'Jour {n}. {nugs} pépites ramassées. Aucune n’était de l’or. Le patron les compte quand même.',
    'Jour {n}. {km} km parcourus. Mes empreintes resteront des millions d’années. J’aurais dû mieux marcher.',
    'Jour {n}. Chapitre {ch}. Pas de pommes de terre à planter. Mark Watney avait plus de chance.',
    'Jour {n}. {found} trouvailles. Maëlle a pris une photo de moi avec la chaussette. Elle l’a envoyée au Client.',
    'Jour {n}. ${money} en caisse. Le patron a dit « investissement ». Pour sa machine à café.',
    'Jour {n}. Le patron a eu peur « pour le matériel ». Puis pour moi. Un peu. C’est noté.',
    'Jour {n}. {badges} badges. Maëlle a applaudi toute seule à la cafétéria. Elle applaudit fort.',
    'Jour {n}. Marteau et plume tombent à la même vitesse ici. J’ai testé avec mon balai et mon sandwich.',
    'Jour {n}. {sold} sacs. Le patron a réimprimé mes cartes de visite : « technicien de surface… lunaire ».',
    'Jour {n}. Chapitre {ch}. Un vélo est passé devant la Terre. J’ai fait coucou. Le patron a dit « E.T. ».',
    'Jour {n}. {km} km. Les pieds dans la poussière, la tête dans les étoiles, le dos en compote.',
    'Jour {n}. {found} objets, {badges} badges. Si quelqu’un lit ceci en 3024 : la capsule, c’est pas moi.',
    'Jour {n}. Pas de pluie, pas de vent, pas de voisin. Vendu {sold} sacs. Une bonne journée.',
    'Jour {n}. Le patron a confondu Apollo 13 et Seul sur Mars. Maëlle a soupiré. La radio a grésillé.',
    'Jour {n}. {stars} éclats, {nugs} pépites. Le patron a dit « diversification ». Je dis « ramassage ».',
    'Jour {n}. ${money} en caisse. J’ai relu le contrat : « visible depuis la terrasse ». Toujours pas de précision.',
    'Jour {n}. Chapitre {ch}. J’ai parlé à un réflecteur laser. Il m’a répondu 2,5 secondes plus tard. Enfin, non.'
  ];
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const vars = () => ({ n: S.journal.length + 1, sold: S.stats.sold || 0, found: S.found.length, ch: Math.min(6, S.chapter + 1), badges: (S.badges || []).length,
    km: ((S.stats.dist || 0) / 1000).toFixed(1).replace('.', ','), stars: S.stats.stars || 0, nugs: S.stats.nugs || 0, money: Math.round(S.money).toLocaleString('fr-FR') });
  const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k]);
  // une entrée par jour calendaire, écrite à la première session du jour
  function journalToday() {
    const d = today(); if (S.journal.some(j => j.d === d)) return;
    S.journal.push({ d: d, txt: fill(pick(TPL), vars()) }); markSave();
  }
  on('load', journalToday);
  // anecdotes vues : la carte (#facttxt) et la radio (« Le saviez-vous ? ») ; on retient l’indice dans ST.facts
  const factIdx = new Map(ST.facts.map((f, i) => [f.text, i]));
  const sawFact = t => { const i = factIdx.get(t); if (i != null && !S.factsSeen.includes(i)) { S.factsSeen.push(i); markSave(); } };
  if (factEl) new MutationObserver(() => sawFact(factEl.textContent)).observe(factEl, { childList: true, characterData: true, subtree: true });
  if (rtxt) new MutationObserver(() => { if (rname.textContent === 'Le saviez-vous ?') sawFact(rtxt.textContent); }).observe(rtxt, { childList: true, characterData: true, subtree: true });

  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const frDate = d => { const [y, m, j] = d.split('-'); return `${+j} ${['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][+m - 1]} ${y}`; };
  const ui = sheet('journal-sheet', 'Journal de bord');
  const sec = (t, sub, rows, vide) => `<h3>${t}${sub ? '<small>' + sub + '</small>' : ''}</h3><div class="list">${rows.length ? rows.join('') : `<div class="jour vide">${vide}</div>`}</div>`;
  function journalUi() {
    journalToday();
    const days = S.journal.slice().reverse().map((j, i) => `<div class="jour"><b>Jour ${S.journal.length - i} · ${frDate(j.d)}</b><p>${esc(j.txt)}</p></div>`);
    const clues = H.clues.slice().sort((a, b) => a - b).map(i => `<div class="jour ind"><b>Indice ${i + 1}/5 · ${CLUES[i][0]}</b><p>${esc(CLUES[i][1])}</p></div>`);
    if (H.done) clues.push(`<div class="jour ind"><b>Résolu · Galacto-Shop</b><p>Le monolithe est une antenne de télé-achat intergalactique. Tu étais la livraison. Badge « Enquêteur ».</p></div>`);
    const ends = H.ends.map(k => `<div class="jour fin"><b>${ENDS[k][0]}</b><p>${esc(ENDS[k][1].split('. ')[0])}.</p></div>`);
    const facts = S.factsSeen.map(i => ST.facts[i]).filter(Boolean).map(f => `<div class="fact"><p>${esc(f.text)}</p><small>${esc(f.src)}</small></div>`);
    ui.body.innerHTML = sec('Jours', `${S.journal.length} ${S.journal.length > 1 ? 'jours' : 'jour'} sur la Lune`, days, 'Première page encore blanche.') +
      sec('Enquête', `${H.clues.length} / 5 indices${H.done ? ' · résolue' : ''}`, clues, 'Le monolithe bourdonne. Trouve des objets, il finira par parler.') +
      sec('Fins vues', `${H.ends.length} / 4`, ends, 'Le dernier chapitre n’est pas encore écrit.') +
      sec('Le saviez-vous ?', `${facts.length} / ${ST.facts.length} anecdotes`, facts, 'Regarde la carte ou fais une pause : la radio raconte.');
    ui.open();
  }
  button('<path d="M4 3h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4z M20 3h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>', 'Journal', journalUi);

  // ===== Image par image : temps de jeu (normal / zen), pause de Maëlle, combo, file de modales =====
  let idle = 0;
  on('frame', (dt, f) => {
    if (!f.paused) {
      S.stats.play += dt; if (S.zen) S.stats.zenT += dt;
      idle = f.mag > .08 ? 0 : idle + dt;
      if (idle > 75 && free()) { idle = -200; say(MAELLE, pick(MA.idle)); }  // décalé des 45 s du patron
      const cm = S.stats.combo || 1; if (cm >= H.combo + .5) { H.combo = Math.floor(cm * 2) / 2; if (free()) say(MAELLE, pick(MA.combo)); }
    }
    const open = !modalEl.hidden;
    if (wasOpen && !open) mcool = .6; wasOpen = open;
    if (mcool > 0) mcool -= dt; else if (!f.paused && mq.length) modal(...mq.shift());   // jamais par-dessus une feuille
  });

  // ===== 5. Blagues et lignes radio supplémentaires =====
  ST.jokes.push(
    'Pourquoi le monolithe n’a-t-il pas d’amis ? Il est un peu carré.',
    'Qu’est-ce qu’une étoile qui a trop mangé ? Une super-nova… vraiment pas légère.',
    'Pourquoi Mark Watney est-il bon cuisinier ? Il fait tout avec des patates et de l’espace.',
    'Que dit un balai lunaire fatigué ? « J’en ai plein le cratère. »',
    'Comment appelle-t-on un chat sur la Lune ? Un félin en apesanteur. Il retombe quand même sur ses pattes.',
    'Pourquoi HAL refuse-t-il d’ouvrir la porte ? Parce que Dave a oublié de dire « s’il te plaît ».',
    'Quel est le sport préféré des astronautes ? Le saut en hauteur : un sixième d’effort.',
    'Pourquoi la Terre ne répond-elle jamais à la Lune ? Elle la trouve un peu distante : 384 000 km.',
    'Que fait un astronaute qui a perdu sa chaussette ? Il regarde dans la Mer de la Tranquillité.',
    'Pourquoi le Client regarde-t-il la Lune ? C’est la seule chose qu’il n’a pas encore achetée. Enfin, presque.',
    'Comment Méliès a-t-il voyagé dans la Lune ? En obus. Elle en a encore l’œil au beurre noir.',
    'Pourquoi le rover ne klaxonne-t-il jamais ? Sans air, personne ne l’entendrait. Et il n’y a personne.',
    'Que dit le patron quand il regarde la Lune ? « Elle est à moi jusqu’à jeudi. »',
    'Pourquoi E.T. voulait-il téléphoner maison ? Il avait oublié de prévenir qu’il rentrait tard.',
    'Pourquoi le monolithe reste-t-il si calme ? Il a quatre millions d’années de musique d’attente derrière lui.'
  );
  ST.radio.push(
    { when: 'idle', text: 'Allô ? Tu contemples ? Dans Interstellar, chaque heure là-bas vaut sept ans. Ici, ça vaut une pause.' },
    { when: 'idle', text: 'Tu ne bouges plus. Si c’est une panne, dis « Houston ». Si c’est une sieste, dis rien.' },
    { when: 'idle', text: 'Pause ? Collins a tourné 21 heures seul derrière la Lune. Toi, tu as droit à cinq minutes.' },
    { when: 'idle', text: 'Je te vois immobile. Comme le marteau et la plume de Dave Scott : posé. Reprends quand tu veux.' },
    { when: 'idle', text: 'Allô ? Tu écoutes le monolithe ? Il ne connaît pas les paroles, je te l’ai déjà dit.' },
    { when: 'idle', text: 'Tu fais une sieste de 2 h 30 ? C’est la durée de la sortie d’Apollo 11. Ils ont bossé, eux.' },
    { when: 'idle', text: 'Silence sur la ligne. Maëlle dit que tu médites. Ramassoux dit que tu factures.' },
    { when: 'idle', text: 'Allô ? Si tu as vu passer un vélo, c’est E.T. S’il parle d’un téléphone, raccroche.' },
    { when: 'idle', text: 'Pause méritée. Pense à Luna 9 : elle a attendu 1966 pour se poser en douceur. Rien ne presse.' },
    { when: 'idle', text: 'Ramassoux patiente. Ramassoux boit son café. Ramassoux se demande où est son deuxième stylo.' },
    { when: 'start', text: 'Ici Ramassoux. Nouveau jour, même Lune. Le Client regarde depuis sa terrasse. Souris.' },
    { when: 'start', text: 'Bonjour ! Rappel : la Lune s’éloigne de 3,8 cm par an. Finis avant qu’elle parte.' },
    { when: 'start', text: 'Ici la base. Maëlle a fait le café, le monolithe a fait son bruit. Journée normale.' },
    { when: 'start', text: 'Reprise ! Comme Apollo 13 : on a un plan, du scotch, et un peu de carton. Ça suffira.' },
    { when: 'start', text: 'Ici Ramassoux. Lunaclean fait briller la Lune depuis six semaines. Le slogan vieillit bien.' }
  );
})();
