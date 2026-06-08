# Spec mise en œuvre — Refonte Accueil + Actualités

> Objectif : uniformiser accueil + actualités sur le **design system validé de `/publications`**, mettre en valeur le contenu, améliorer l'affichage des photos. Validé avec le client 2026-06-08.

## Décisions validées

1. **Featured** : hero 50/50 statique partout (accueil + page actu). Supprimer le swiper slider.
2. **Filtre actu** : interactif React in-page (comme PublicationPosts). Remplace les liens `/categories`.
3. **Accueil bloc actu** : hero featured + grille 3 cartes récentes.
4. **Méta cartes actu** : date + temps de lecture + auteur + lien "Découvrir →".

---

## 0. Fondations partagées (à faire EN PREMIER)

### 0.1 Helper image Contentful — `src/lib/utils/cfImage.ts` (nouveau)
Toutes les photos Contentful doivent passer par ce helper.
```ts
// url protocol-relative (//images.ctfassets.net/...) ou https://...
// Ajoute params Contentful Images API : redimension + webp + qualité
export const cfImage = (
  url: string,
  { w = 640, h, fit = "fill", q = 80 }: { w?: number; h?: number; fit?: string; q?: number } = {}
) => {
  if (!url) return "";
  const base = url.startsWith("//") ? `https:${url}` : url;
  const params = new URLSearchParams({ w: String(w), fm: "webp", q: String(q), fit });
  if (h) params.set("h", String(h));
  return `${base}?${params.toString()}`;
};
```
Règle ratio : hero → `cfImage(url,{w:1280,h:800})` (16/10). Carte → `cfImage(url,{w:640,h:400})`. Toujours `object-cover`.

### 0.2 Palette catégories partagée — `src/lib/utils/categoryColors.ts` (nouveau)
Extraire la constante dupliquée dans `publications/index.astro` + `PublicationPosts.jsx`.
```ts
export const CATEGORY_COLORS = ["#24A1FF", "#7B5AFF", "#FDC528", "#FF5874", "#12E189", "#E545FF"];
export const colorForCategory = (cat: string, categories: string[]) =>
  CATEGORY_COLORS[categories.indexOf(cat) % CATEGORY_COLORS.length] || "#24A1FF";
export const mainCategory = (cat: string | string[]) =>
  (Array.isArray(cat) ? cat[0] : cat) || "";
```
Mettre à jour `publications/index.astro` et `PublicationPosts.jsx` pour importer d'ici (supprimer les copies locales).

### 0.3 Franciser `readingTime` — `src/lib/utils/readingTime.ts`
Retours actuels en anglais ("Min read"). Remplacer la sortie par : `"X min de lecture"` (pas de zéro de tête forcé).

### 0.4 Carte unifiée — `src/layouts/components/ContentCard.astro` (nouveau)
Carte réutilisable, calquée sur la grille `PublicationPosts.jsx` (lignes 107-153). Sert pour publications ET articles.
Props :
```
{
  href: string,          // /actualites/slug ou /publications/slug
  image?: { url, alt },  // déjà passé par cfImage côté appelant OU passer url brute + cfImage interne
  category?: string,     // catégorie principale
  categories: string[],  // pour la couleur
  title: string,
  excerpt: string,       // description ou plainify(contenu)
  date: string,
  meta?: { readingTime?: string, author?: string },  // actu only
  hasPdf?: boolean,      // publications only
  ctaLabel?: string,     // "Découvrir" (défaut) / "Lire"
}
```
Structure (classes exactes du modèle validé) :
```html
<div class="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
  <a href={href} class="block overflow-hidden">
    <img class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
         src={cfImage(image.url,{w:640,h:400})} alt={image.alt} loading="lazy" />
    <!-- si pas d'image : <div class="aspect-[16/10] w-full bg-theme-light" /> -->
  </a>
  <div class="flex flex-1 flex-col p-6">
    <div class="mb-3 flex items-center gap-x-3">
      <!-- badge catégorie couleur (style inline backgroundColor) -->
      <!-- icône FiDownload si hasPdf -->
    </div>
    <h3 class="h5"><a href={href} class="transition-colors hover:text-primary">{title}</a></h3>
    <p class="mt-3 line-clamp-3 text-sm">{excerpt}</p>
    <div class="mt-auto flex items-center justify-between pt-6">
      <span class="inline-flex items-center text-sm text-light"><!-- icône calendrier --> {date}</span>
      <a class="inline-flex items-center font-semibold text-primary" href={href}>
        {ctaLabel} <!-- flèche AiOutlineArrowRight ml-1.5 group-hover:translate-x-1 -->
      </a>
    </div>
    <!-- actu : ligne méta auteur · temps de lecture sous le footer ou intégrée -->
  </div>
</div>
```
Badge catégorie couleur : `<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white" style="background-color:{colorForCategory(cat,categories)}">{humanize(cat)}</span>`.

> Note React vs Astro : `PublicationPosts.jsx` est React (filtre client). La page actu aura aussi un composant filtre React. Donc créer **2 formes** de la carte OU garder le markup carte inline dans chaque composant React et utiliser `ContentCard.astro` seulement pour les grilles statiques (accueil). Recommandé : un composant React `ContentCard.jsx` pour les grilles filtrées (actu, publications) + version Astro pour l'accueil. Garder les classes STRICTEMENT identiques entre les deux.

---

## 1. Page Accueil — `src/pages/index.astro`

Ordre des sections conservé. Modifs :

### 1.1 Section "Dernières Publications" (remplace `<Publications>`)
- Header uniformisé : `<h2 class="h2 text-center">Dernières Publications</h2>` + sous-titre optionnel `text-center text-light`.
- Grille `row mt-12` de **3** `ContentCard` (les 3 `currentPublications`), props publication : `category`, `hasPdf`, `ctaLabel="Découvrir"`, image via cfImage.
- Bouton "Voir toutes les publications" : `btn btn-primary`, centré, `mt-8`.
- **Supprimer** l'usage de `src/layouts/components/Publications.astro` ici.

### 1.2 Section "Actualités" (remplace `FeaturedBlogUne` swiper + `Blogs`)
- Header uniformisé h2 center.
- **Hero featured 50/50** (1er `featuredPost`) : reprendre EXACTEMENT la structure hero de `publications/index.astro` (lignes 57-136) adaptée article :
  - image gauche `lg:col-6`, `aspect-[16/10]`, `rounded-2xl shadow-xl`, hover zoom, `loading="eager"`, via cfImage `{w:1280,h:800}`.
  - droite `lg:col-6` : badge "À la une" (`bg-primary/10 text-primary`) + badge catégorie couleur + date ; `<h1>` titre cliquable ; `<p class="line-clamp-4">` extrait `plainify(contenu)` ; CTA `btn btn-primary` "Lire l'article".
  - Pas de bouton PDF (articles n'ont pas de document).
- **Grille 3 récents** sous le hero : `row mt-12`, 3 `ContentCard` (currentPosts), méta date + temps lecture + auteur + "Découvrir →".
- Bouton "Voir toutes les actualités" `btn btn-primary` centré.

### 1.3 Imports à retirer
`FeaturedBlog` (FeaturedBlogUne), `Blogs`, `Publications` si plus utilisés ailleurs sur la page.

---

## 2. Page Actualités — `src/pages/actualites/index.astro`

Refonte miroir de `/publications`. Structure cible :

### 2.1 Hero featured 50/50
- Choisir le vedette : `featuredPost[0]` si existe, sinon `recentPost[0]`.
- Breadcrumb en haut (`Accueil / Actualités`) — reprendre le markup breadcrumb de `publications/index.astro` (lignes 41-55).
- Hero identique à 1.2 (badge "À la une" + catégorie + date, titre h1, extrait line-clamp-4, CTA "Lire l'article").
- Image via cfImage `{w:1280,h:800}`, `loading="eager"`.

### 2.2 Composant filtre interactif — `src/layouts/function-components/ArticlePosts.jsx` (nouveau)
Calque de `PublicationPosts.jsx`. Différences :
- Données article : `title`, `image.fields.file`, `categories`, `date`, `author`, `contenu` (HTML), `slug`.
- Exclure le vedette du grid quand aucun filtre actif (comme `featuredSlug` dans PublicationPosts).
- Extrait carte : `plainify(contenu).slice(0, summary_length)`.
- Carte = ContentCard React, lien `/actualites/${slug}`, méta date + `readingTime(contenu)` + `humanize(author)`, CTA "Découvrir".
- Badge catégorie couleur via `colorForCategory`.
- Filtre catégories (boutons React `filter-btn`), compteur contextualisé, état vide (`FiInbox`), pagination client. **Réutiliser tel quel** la logique pagination/filtre de PublicationPosts.
- `categories` : passer `getCategories()` (déjà dispo).

### 2.3 index.astro câblage
- `<ArticlePosts client:load posts={articles} categories={categories} featuredSlug={featured.slug} postsPerPage={config.settings.pagination} />`
- **Supprimer** de cette page : `FeaturedBlog`, `BlogCategories`, `Blogs`, `Pagination` server-side.
- Garder `Shape` / `PageHeader` ? → remplacer PageHeader par le hero featured. Optionnel : garder Shape en décor de fond.
- `Cta` en bas conservé.

### 2.4 Pagination serveur `/actualites/page/[slug].astro`
Devenue redondante (pagination client). Options :
- (a) La laisser pour SEO/fallback no-JS mais re-styler `Blogs` → cartes unifiées.
- (b) La supprimer si no-JS non requis.
Recommandé (a) minimal : au moins re-styler pour ne pas casser l'uniformité. À confirmer si trafic no-JS compte.

---

## 3. Composants vieux système — sort

| Fichier | Action |
|---|---|
| `components/Publications.astro` | Supprimer (remplacé par ContentCard) si plus référencé |
| `components/Blogs.astro` | Supprimer si plus référencé (sinon re-styler en ContentCard) |
| `components/blog/FeaturedBlog.astro` | Supprimer (hero remplace) |
| `components/blog/FeaturedBlogUne.astro` + `FeaturedBlogSlider.jsx` | Supprimer (swiper abandonné) |
| `components/blog/BlogCategories.astro` | Garder seulement si pages `/categories/*` l'utilisent encore ; sinon supprimer |

> ⚠️ Avant suppression : `grep -rn "ComponentName" src/` pour vérifier zéro référence restante (pages `/categories/[regular].astro`, etc.).

---

## 4. Cohérence visuelle transversale

- **Headers sections** : tous `<h2 class="h2 text-center">` + sous-titre `text-light text-center mt-3`. Plus de `h4 left` ("À la une"/"Récents").
- **Espacements** : grilles `row mt-12`, cartes `mb-8 md:col-6 lg:col-4`, sections `class="section"`.
- **Boutons "voir tout"** : `btn btn-primary`, centré, `mt-8`.
- **Toutes images** via `cfImage` + `object-cover` + ratio fixe (`aspect-[16/10]` carte, hero idem ou 16/10).
- **Badges catégorie** : couleur partout (jamais le vieux `.tag` orange).
- **Hover** : carte lift + image zoom partout.

---

## 5. Ordre d'exécution conseillé

1. Fondations §0 (helpers cfImage, categoryColors, readingTime FR, ContentCard).
2. Brancher ContentCard dans `/publications` d'abord (non-régression du modèle validé).
3. Accueil §1.
4. Page actu §2 (ArticlePosts.jsx).
5. Nettoyage vieux composants §3.
6. `npm run build` — vérifier 0 erreur, pages générées.
7. Vérif visuelle : accueil, /actualites, /publications, un article, une publication.

## 6. Points à vérifier (data)
- Articles ont-ils tous `author` + `image` ? Gérer absence (fallback bloc gris `bg-theme-light`, masquer auteur si vide).
- `categories` article : string ou array → utiliser `mainCategory()`.
- URLs Contentful protocol-relative → `cfImage` gère le préfixe `https:`.
