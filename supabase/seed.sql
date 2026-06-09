-- ============================================================================
-- Nova Graphik — seed data (generated from backend/data.sqlite)
-- Idempotent: upserts by id. URLs under /uploads rewritten to the media bucket.
-- NOTE: the referenced media files must also be uploaded to the `media` bucket
--       (run scripts/migrate-to-supabase.ts with the service-role key for that).
-- ============================================================================

insert into public.sections (id, page, type, template, title, body, icon, image, data, visible, position, updated_at) values
  (1, 'home', 'Hero', 'hero', 'L''essence du raffinement visuel.', 'Nous accompagnons les entreprises, marques et particuliers dans la création d''une communication visuelle forte, moderne et impactante.', '', '', '{}'::jsonb, 1, 0, '2026-05-31 10:19:32'),
  (2, 'home', 'Qui sommes-nous', 'text', 'Une agence créative au service des marques.', 'Agence créative basée à Lomé, Nova Graphik bâtit des identités visuelles fortes et durables — direction artistique, design graphique, motion design, web et production audiovisuelle. Notre ambition : devenir une référence en Afrique de l''Ouest en transformant les idées de nos clients en projets concrets, performants et porteurs de sens.', '', '', '{}'::jsonb, 1, 1, '2026-05-31 10:19:32'),
  (3, 'home', 'Services', 'services', 'Tout ce qui est lié au digital', 'De l''identité de marque au motion design, nous couvrons l''ensemble de votre communication visuelle.', '', '', '{}'::jsonb, 1, 2, '2026-05-31 10:19:32'),
  (4, 'home', 'Portfolios', 'portfolio', 'Notre univers créatif', 'Une sélection de nos réalisations récentes.', '', '', '{}'::jsonb, 1, 3, '2026-05-31 10:19:32'),
  (5, 'home', 'Équipe', 'team', 'L''équipe Nova', 'Une équipe pluridisciplinaire qui met sa créativité et son sens du détail au service de votre réussite.', '', '', '{}'::jsonb, 1, 4, '2026-05-31 10:19:32')
on conflict (id) do update set page = excluded.page, type = excluded.type, template = excluded.template, title = excluded.title, body = excluded.body, icon = excluded.icon, image = excluded.image, data = excluded.data, visible = excluded.visible, position = excluded.position, updated_at = excluded.updated_at;

insert into public.team_members (id, name, role, bio, photo, slug, parent_id, position, visible, created_at) values
  (1, 'AMEGNAGLO K.S', 'Graphiste Designer de NOVA', 'Graphiste passionné avec une solide expertise dans la conception visuelle, j''apporte des solutions créatives et stratégiques aux projets de mes clients. Mon approche vise à allier esthétique, efficacité et innovation pour créer des visuels qui se démarquent et qui communiquent efficacement l''identité de chaque marque. Avec une maîtrise de divers outils graphiques et une sensibilité artistique, je m''engage à réaliser des projets impactants et de haute qualité.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/24576fdd-88f4-4e7e-b6ec-a81c7dcfab22.jpg', 'amegnaglo-k-s', null, 0, 1, '2026-05-31 10:19:32'),
  (2, 'TAMEGNON K.K', 'Monteur vidéo · short YouTube de NOVA', 'Monteur vidéo passionné, doté d''une solide expertise dans la création et l''optimisation de contenus audiovisuels, j''accompagne mes clients dans la réalisation de projets dynamiques, percutants et stratégiques. Mon approche consiste à transformer chaque idée en une vidéo captivante, en combinant rythme, storytelling et qualité visuelle afin de transmettre efficacement le message et l''identité de chaque marque. Grâce à ma maîtrise des outils de montage et à mon sens du détail, je m''engage à produire des contenus modernes, engageants et à forte valeur ajoutée, adaptés aux réseaux sociaux, au marketing digital et aux projets professionnels.', '', 'tamegnon-k-k', 1, 1, 1, '2026-05-31 10:19:32'),
  (3, 'GEORGE', 'Web designer de NOVA', 'EKLOU Komla Etonam Georges est un développeur Web & Web3 basé à Lomé, titulaire d''une Licence en Informatique – Développement d''Applications (UCAO-UUT). Il maîtrise des technologies modernes telles que Vue.js, Nuxt.js, TypeScript, TailwindCSS, Node.js et WordPress, ainsi que le développement blockchain avec Solidity. Ses expériences en stage lui ont permis de consolider ses compétences en intégration front-end, développement d''applications et analyse de données. Curieux et animé par l''apprentissage continu, il aspire à contribuer à des solutions innovantes alliant web moderne et architectures décentralisées.', '', 'george', 1, 2, 1, '2026-05-31 10:19:32'),
  (4, 'BANAWOYE Eliezer', 'Réalisateur · Cadreur · Monteur', 'Réalisateur et chef opérateur. Cadreur, monteur et éclaireur — Eliezer signe la captation et la post-production des reportages, films corporate et clips musicaux de l''agence.', '', 'banawoye-eliezer', 2, 3, 1, '2026-05-31 10:19:32'),
  (5, 'FIA Yaovi Daniel', 'Responsable marketing & community manager', 'Responsable marketing et community manager chez Nova. Gestionnaire des ressources humaines de formation, photographe et vidéaste, Daniel orchestre la stratégie de présence digitale et l''image de marque de l''agence. Aussi mannequin et musicien à ses heures.', '', 'fia-yaovi-daniel', 3, 4, 1, '2026-05-31 10:19:32'),
  (6, '14K', 'Rôle', 'monteur', '', '14k', 3, 5, 1, '2026-05-31 10:47:35')
on conflict (id) do update set name = excluded.name, role = excluded.role, bio = excluded.bio, photo = excluded.photo, slug = excluded.slug, parent_id = excluded.parent_id, position = excluded.position, visible = excluded.visible, created_at = excluded.created_at;

insert into public.portfolio_items (id, title, slug, category, description, cover_image, images, position, visible, created_at, external_url) values
  (1, 'Logo & identités', 'logo-identites', 'Logo', 'Une sélection de logos et déclinaisons d’identité réalisés pour les marques accompagnées par Nova.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-aridas.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-mak.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-tshirt.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-cart2.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-etik.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-logo-iphone.jpg"]'::jsonb, 0, 1, '2026-05-31 10:19:32', ''),
  (2, 'Flyers & affiches', 'flyers-affiches', 'Flyers', 'Affiches commerciales et flyers évènementiels — restauration, lancements, campagnes saisonnières.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-flyer-cookies.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-flyer-cake.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-flyer-cafe.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-flyer-caff.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-flyer-jour1.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-flyer-rentree.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-flyer-aout.png","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-flyer-mockup1.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-flyer-mockup2.jpg"]'::jsonb, 1, 1, '2026-05-31 10:19:32', ''),
  (3, 'Motion design', 'motion-design', 'Motion design', 'Habillages, teasers et covers éditoriales — formats courts pour les réseaux et les campagnes de marque.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-motion-cover-1.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-dream-cover.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-motion-cover-2.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-motion-cover-3.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/wp-motion-cover-4.jpg"]'::jsonb, 2, 1, '2026-05-31 10:19:32', ''),
  (4, 'Shootings & direction artistique', 'shootings-direction-artistique', 'Shooting', 'Direction artistique et prises de vue éditoriales — mode, beauté, campagnes produits.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-shooting-1.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-shooting-2.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-shooting-3.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-shooting-4.jpg","https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/samuel-shooting-lash.jpg"]'::jsonb, 3, 1, '2026-05-31 10:19:32', ''),
  (5, 'Audiophile e-commerce', 'audiophile-e-commerce', 'Web Projet', 'E-commerce audio premium — fiche produit, panier et tunnel d’achat soignés, interface haut de gamme.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/web-audiophile.jpg', '[]'::jsonb, 4, 1, '2026-05-31 10:19:32', 'https://audiophile-ecommerce-psi-ecru.vercel.app/'),
  (6, 'Pomodoro App', 'pomodoro-app', 'Web Projet', 'Application de productivité — minuteur Pomodoro, suivi de cycles de travail et de pauses.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/web-pomodoro.jpg', '[]'::jsonb, 5, 1, '2026-05-31 10:19:32', 'https://promodoro-app-iota.vercel.app/'),
  (7, 'CNC Portal', 'cnc-portal', 'Web Projet', 'Portail métier industriel — gestion d’opérations CNC, tableau de bord et orchestration des flux.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/web-cnc.jpg', '[]'::jsonb, 6, 1, '2026-05-31 10:19:32', 'https://app.cncportal.io/'),
  (8, 'Orga Africa', 'orga-africa', 'Web Projet', 'Site institutionnel d’Orga Africa — communication corporate et présentation des activités.', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/web-orga.jpg', '[]'::jsonb, 7, 1, '2026-05-31 10:19:32', 'https://www.orga-africa.com/'),
  (9, 'Promotion ', 'promotion', 'Vidéo Réseaux', '', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/49acb802-0cd1-4063-8ef9-76ec87d0683d.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/82b71bef-01c6-4a1e-829f-0538a02e1e5a.mp4?ar=9-16"]'::jsonb, 8, 1, '2026-06-07 14:53:42', ''),
  (10, 'Reportage', 'reportage', 'Evènementiel', '', 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/1a65ea91-2b4e-432e-a1ac-bd31fbbcc941.jpg', '["https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/bc4e9f3c-9fb3-4f26-8318-2eb467e732e1.mov?ar=9-16"]'::jsonb, 9, 1, '2026-06-07 15:41:11', '')
on conflict (id) do update set title = excluded.title, slug = excluded.slug, category = excluded.category, description = excluded.description, cover_image = excluded.cover_image, images = excluded.images, position = excluded.position, visible = excluded.visible, created_at = excluded.created_at, external_url = excluded.external_url;

insert into public.settings (key, value) values
  ('site_title', 'Nova Graphik'),
  ('tagline', 'L''essence du raffinement'),
  ('contact_email', 'Novagraphiksat@gmail.com'),
  ('contact_phone', '+228 97 99 63 46'),
  ('contact_location', 'Lomé, Togo'),
  ('social_instagram', '#'),
  ('social_facebook', '#'),
  ('social_youtube', '#'),
  ('social_tiktok', '#')
on conflict (key) do update set value = excluded.value;

insert into public.nav_items (id, label, path, position, visible) values
  (1, 'Accueil', '/', 0, 1),
  (2, 'Portfolios', '/portfolios', 1, 1),
  (3, 'Blogs', '/blogs', 2, 1),
  (4, 'Contact', '/contact', 3, 1),
  (5, 'Partenaires', '/partenaires', 4, 1),
  (6, 'Grille tarifaire', '/grille-tarifaire', 5, 1)
on conflict (id) do update set label = excluded.label, path = excluded.path, position = excluded.position, visible = excluded.visible;

insert into public.services (id, icon, title, description, position, visible) values
  (1, 'palette', 'Identité visuelle', 'Logos, charte graphique & rebranding sur mesure.', 0, 1),
  (2, 'printer', 'Supports imprimés', 'Cartes, flyers, brochures, bannières & roll-ups.', 1, 1),
  (3, 'share-2', 'Réseaux sociaux', 'Visuels & packs cohérents pour vos campagnes.', 2, 1),
  (4, 'clapperboard', 'Motion design', 'Animations, teasers & montage vidéo.', 3, 1),
  (5, 'box', '3D / 2D', 'Modélisation et création 3D & 2D.', 4, 1),
  (6, 'camera', 'Photo & reportage', 'Photographie pro & reportage audiovisuel.', 5, 1),
  (7, 'monitor', 'Web & UX/UI', 'Maquettes de sites vitrine & e-commerce.', 6, 1),
  (8, 'mail', 'Email marketing', 'Design de campagnes & signatures mail.', 7, 1)
on conflict (id) do update set icon = excluded.icon, title = excluded.title, description = excluded.description, position = excluded.position, visible = excluded.visible;

insert into public.articles (id, title, slug, category, excerpt, body, cover_image, date, position, visible, created_at) values
  (1, 'Pourquoi un portfolio web est essentiel', 'pourquoi-un-portfolio-web-est-essentiel', 'Web', 'Dans le monde numérique d''aujourd''hui, un site portfolio est essentiel pour toute agence de communication…', '', '', '12 mai 2026', 0, 1, '2026-05-31 10:19:32'),
  (2, 'L''art du motion design court', 'l-art-du-motion-design-court', 'Motion', 'Comment capter l''attention en moins de 30 secondes sur les réseaux sociaux.', '', '', '04 mai 2026', 1, 1, '2026-05-31 10:19:32'),
  (3, 'Construire une identité de marque forte', 'construire-une-identite-de-marque-forte', 'Branding', 'Couleurs, typographies, déclinaisons : les fondations d''une charte graphique réussie.', '', '', '28 avr. 2026', 2, 1, '2026-05-31 10:19:32'),
  (4, '5 tendances design 2026', '5-tendances-design-2026', 'Tendances', 'Les courants visuels à suivre cette année.', '', '', '20 avr. 2026', 3, 1, '2026-05-31 10:19:32'),
  (5, 'Réussir son shooting produit', 'reussir-son-shooting-produit', 'Photo', 'Tout pour transformer un shooting en campagne efficace.', '', '', '11 avr. 2026', 4, 1, '2026-05-31 10:19:32'),
  (6, 'La 3D au service du packaging', 'la-3d-au-service-du-packaging', '3D', 'Quand la modélisation 3D booste vos visuels packaging.', '', '', '02 avr. 2026', 5, 1, '2026-05-31 10:19:32'),
  (7, 'Email marketing qui convertit', 'email-marketing-qui-convertit', 'Digital', 'Les leviers pour des campagnes mail performantes.', '', '', '25 mars 2026', 6, 1, '2026-05-31 10:19:32')
on conflict (id) do update set title = excluded.title, slug = excluded.slug, category = excluded.category, excerpt = excluded.excerpt, body = excluded.body, cover_image = excluded.cover_image, date = excluded.date, position = excluded.position, visible = excluded.visible, created_at = excluded.created_at;

insert into public.partners (id, name, logo_url, position, visible) values
  (1, 'Visiosphere', '', 0, 1),
  (2, 'Atelier Sahel', '', 1, 1),
  (3, 'Téranga', '', 2, 1),
  (4, 'Sat Media', '', 3, 1),
  (5, 'Lomé Co', '', 4, 1),
  (6, 'Kara Digital', '', 5, 1)
on conflict (id) do update set name = excluded.name, logo_url = excluded.logo_url, position = excluded.position, visible = excluded.visible;

insert into public.testimonials (id, quote, author_name, author_role, position, visible) values
  (1, 'Grâce à Nova Graphik, notre image de marque a pris vie avec des visuels qui racontent vraiment notre histoire.', 'Studio Visiosphere', 'Direction marketing', 0, 1),
  (2, 'Un sens du détail remarquable. Le rebranding a transformé notre perception sur le marché.', 'Atelier Sahel', 'Fondatrice', 1, 1),
  (3, 'Réactifs, créatifs et professionnels. Nos campagnes social media n''ont jamais été aussi cohérentes.', 'Maison Téranga', 'Responsable com', 2, 1)
on conflict (id) do update set quote = excluded.quote, author_name = excluded.author_name, author_role = excluded.author_role, position = excluded.position, visible = excluded.visible;

insert into public.pricing_items (id, group_title, group_icon, name, description, price, position, visible) values
  (1, 'Identité visuelle', 'palette', 'Logo professionnel', 'Création sur mesure (2 à 3 propositions, livrables HD + vectoriels)', '25 000', 0, 1),
  (2, 'Identité visuelle', 'palette', 'Charte graphique complète', 'Couleurs, typographies, déclinaisons du logo, guide d''utilisation', '50 000', 1, 1),
  (3, 'Identité visuelle', 'palette', 'Rebranding (refonte d''identité)', 'Modernisation complète de votre image visuelle', '30 000', 2, 1),
  (4, 'Supports imprimés', 'printer', 'Carte de visite', 'Conception graphique seule (livrables HD + vectoriels)', '5 000', 3, 1),
  (5, 'Supports imprimés', 'printer', 'Carte de visite + impression', 'Conception + impression 300g finition laminée — 100 exemplaires', '15 000', 4, 1),
  (6, 'Supports imprimés', 'printer', 'Flyer A5 (conception + impression)', 'Conception + impression laminé tout fini A5 — 100 FCFA / unité (à partir de 500 ex.)', '50 000 / 500 ex.', 5, 1),
  (7, 'Supports imprimés', 'printer', 'Flyer A4 (conception + impression)', 'Conception + impression laminé tout fini A4 — 150 FCFA / unité (à partir de 500 ex.)', '75 000 / 500 ex.', 6, 1),
  (8, 'Supports imprimés', 'printer', 'Brochure / Catalogue', 'Mise en page 4 à 12 pages', '25 000', 7, 1),
  (9, 'Supports imprimés', 'printer', 'Kakémono / Roll-up', 'Conception + impression tout fini, prêt à exposer', '90 000', 8, 1),
  (10, 'Supports imprimés', 'printer', 'Bannière (création seule)', 'Création graphique, fichier prêt à imprimer', '15 000', 9, 1),
  (11, 'Supports numériques', 'share-2', 'Visuel réseaux sociaux', 'Post ou bannière (Facebook, Insta, TikTok…)', '5 000', 10, 1),
  (12, 'Supports numériques', 'share-2', 'Pack réseaux sociaux (10 visuels)', 'Visuels cohérents pour une campagne ou un mois', '40 000', 11, 1),
  (13, 'Supports numériques', 'share-2', 'Photomontage / Retouche pro', 'Ajustements, détourage, composition créative', '3 000 – 7 000', 12, 1),
  (14, 'Supports numériques', 'share-2', 'Mini animation / teaser (motion)', 'Animation 10 à 30 secondes', '30 000', 13, 1),
  (15, 'Design web & digital', 'monitor', 'Maquette de site web (UI/UX)', 'Design complet site vitrine ou e-commerce', '50 000 – 100 000', 14, 1),
  (16, 'Design web & digital', 'monitor', 'Bannière web / publicité digitale', 'Pour site ou campagne sponsorisée', '10 000', 15, 1),
  (17, 'Design web & digital', 'monitor', 'Email marketing / signature mail', 'Design professionnel et personnalisé', '8 000', 16, 1),
  (18, 'Autres prestations', 'sparkles', 'Carte d''invitation / Menu / Certificat', 'Conception élégante et sur mesure', '8 000', 17, 1),
  (19, 'Autres prestations', 'sparkles', 'Calendrier / Agenda / Planning', 'Conception personnalisée', '15 000', 18, 1),
  (20, 'Autres prestations', 'sparkles', 'Affiche d''événement grand format', 'Pour impression ou projection numérique', 'Sur devis', 19, 1)
on conflict (id) do update set group_title = excluded.group_title, group_icon = excluded.group_icon, name = excluded.name, description = excluded.description, price = excluded.price, position = excluded.position, visible = excluded.visible;

insert into public.pricing_formulas (id, name, price, features, is_hot, position, visible) values
  (1, 'Basique', '25 000', '["Logo simple","1 proposition","Livrables HD"]'::jsonb, 0, 0, 1),
  (2, 'Standard', '50 000', '["Logo + charte","2 propositions","Fichiers vectoriels","Cartes de visite"]'::jsonb, 1, 1, 1),
  (3, 'Premium', '100 000', '["Identité complète","3 propositions","Pack réseaux sociaux","Maquette web"]'::jsonb, 0, 2, 1)
on conflict (id) do update set name = excluded.name, price = excluded.price, features = excluded.features, is_hot = excluded.is_hot, position = excluded.position, visible = excluded.visible;

-- Realign identity sequences with the max seeded id
select setval(pg_get_serial_sequence('public.sections', 'id'), coalesce((select max(id) from public.sections), 1));
select setval(pg_get_serial_sequence('public.team_members', 'id'), coalesce((select max(id) from public.team_members), 1));
select setval(pg_get_serial_sequence('public.portfolio_items', 'id'), coalesce((select max(id) from public.portfolio_items), 1));
select setval(pg_get_serial_sequence('public.nav_items', 'id'), coalesce((select max(id) from public.nav_items), 1));
select setval(pg_get_serial_sequence('public.services', 'id'), coalesce((select max(id) from public.services), 1));
select setval(pg_get_serial_sequence('public.articles', 'id'), coalesce((select max(id) from public.articles), 1));
select setval(pg_get_serial_sequence('public.partners', 'id'), coalesce((select max(id) from public.partners), 1));
select setval(pg_get_serial_sequence('public.testimonials', 'id'), coalesce((select max(id) from public.testimonials), 1));
select setval(pg_get_serial_sequence('public.pricing_items', 'id'), coalesce((select max(id) from public.pricing_items), 1));
select setval(pg_get_serial_sequence('public.pricing_formulas', 'id'), coalesce((select max(id) from public.pricing_formulas), 1));
