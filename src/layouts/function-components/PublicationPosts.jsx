import { useState, useMemo } from "react";
import { humanize } from "@lib/utils/textConverter";
import dateFormat from "@lib/utils/dateFormat";
import { marked } from "marked";
import {
  AiOutlineArrowRight,
  AiOutlineArrowLeft,
  AiOutlineCalendar,
} from "react-icons/ai/index.js";
import { FiDownload, FiInbox } from "react-icons/fi/index.js";

// Palette pour les badges de catégorie (réutilise les teintes de la charte).
const CATEGORY_COLORS = ["#24A1FF", "#7B5AFF", "#FDC528", "#FF5874", "#12E189", "#E545FF"];

const PublicationPosts = ({ posts, categories, career: { title, subtitle }, postsPerPage }) => {
  const [tab, setTab] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Une publication peut porter une catégorie string ou un tableau : on prend la 1re.
  const mainCategory = (cat) => (Array.isArray(cat) ? cat[0] : cat) || "";

  // Couleur stable par catégorie (basée sur l'ordre de déclaration).
  const colorFor = (cat) =>
    CATEGORY_COLORS[categories.indexOf(cat) % CATEGORY_COLORS.length] || "#24A1FF";

  const filterPost = useMemo(() => {
    setCurrentPage(1); // Reset page when filter changes
    return !tab
      ? posts
      : posts.filter((post) => post.categories?.includes(tab));
  }, [posts, tab]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filterPost.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filterPost.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Mise en avant : 1re publication de la page 1 en vedette pleine largeur.
  const featured = currentPage === 1 ? currentPosts[0] : null;
  const gridPosts = currentPage === 1 ? currentPosts.slice(1) : currentPosts;

  // Generate page numbers for pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const CategoryBadge = ({ category }) => {
    const cat = mainCategory(category);
    return cat ? (
      <span
        className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
        style={{ backgroundColor: colorFor(cat) }}
      >
        {humanize(cat)}
      </span>
    ) : null;
  };

  return (
    <section className="section">
      <div className="container">
        <div className="row">
          <div className="mx-auto text-center lg:col-8">
            <h2>{title}</h2>
            <p
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: marked.parseInline(subtitle) }}
            />

            {/* Compteur de résultats */}
            <p className="mt-3 text-sm text-light">
              {filterPost.length} publication{filterPost.length > 1 ? "s" : ""}
              {tab ? ` · ${humanize(tab)}` : ""}
            </p>

            <ul className="filter-list mt-8 flex flex-wrap items-center justify-center">
              <li>
                <span
                  className={`filter-btn ${
                    !tab ? "filter-btn-active" : undefined
                  } btn btn-sm cursor-pointer`}
                  onClick={() => setTab("")}
                >
                  Toutes catégories
                </span>
              </li>
              {categories.map((category, i) => (
                <li key={`category-${i}`} onClick={() => setTab(category)}>
                  <span
                    className={`filter-btn ${
                      tab === category ? "filter-btn-active" : undefined
                    } btn btn-sm cursor-pointer`}
                  >
                    {humanize(category)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Publication vedette */}
        {featured && (
          <div className="row mt-12">
            <div className="col-12">
              <div className="group overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                <div className="row items-center">
                  <div className="lg:col-6">
                    <a href={`/publications/${featured.slug}`} className="block overflow-hidden">
                      {featured.photo?.fields.file && (
                        <img
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={featured.photo.fields.file.url}
                          alt={featured.photo.fields.file.fileName}
                          loading="eager"
                        />
                      )}
                    </a>
                  </div>
                  <div className="p-7 lg:col-6 lg:p-10">
                    <div className="mb-4 flex items-center gap-x-4">
                      <CategoryBadge category={featured.categories} />
                      <span className="inline-flex items-center text-sm text-light">
                        <AiOutlineCalendar className="mr-1.5" />
                        {dateFormat(featured.dateDePublication)}
                      </span>
                    </div>
                    <h3 className="h2">
                      <a
                        href={`/publications/${featured.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {featured.titre}
                      </a>
                    </h3>
                    <p className="mt-4 line-clamp-3">{featured.description}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <a className="btn btn-primary btn-sm" href={`/publications/${featured.slug}`}>
                        Lire la publication
                      </a>
                      {featured.document?.fields.file && (
                        <a
                          className="btn btn-outline-primary btn-sm inline-flex items-center"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={featured.document.fields.file.url}
                        >
                          <FiDownload className="mr-1.5" />
                          Télécharger le PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille 3 colonnes */}
        <div className="row mt-8">
          {gridPosts.map((post, i) => (
            <div className="mb-8 md:col-6 lg:col-4" key={`post-${i}`}>
              <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <a href={`/publications/${post.slug}`} className="block overflow-hidden">
                  {post.photo?.fields.file ? (
                    <img
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={post.photo.fields.file.url}
                      alt={post.photo.fields.file.fileName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-theme-light" />
                  )}
                </a>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-x-3">
                    <CategoryBadge category={post.categories} />
                    {post.document?.fields.file && (
                      <FiDownload className="text-light" title="PDF disponible" />
                    )}
                  </div>
                  <h3 className="h5">
                    <a
                      href={`/publications/${post.slug}`}
                      className="transition-colors hover:text-primary"
                    >
                      {post.titre}
                    </a>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm">{post.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="inline-flex items-center text-sm text-light">
                      <AiOutlineCalendar className="mr-1.5" />
                      {dateFormat(post.dateDePublication)}
                    </span>
                    <a
                      className="inline-flex items-center font-semibold text-primary"
                      href={`/publications/${post.slug}`}
                    >
                      Découvrir
                      <AiOutlineArrowRight className="ml-1.5 text-lg font-bold transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* État vide */}
        {filterPost.length === 0 && (
          <div className="row mt-12">
            <div className="mx-auto text-center lg:col-6">
              <FiInbox className="mx-auto text-5xl text-light" />
              <p className="mt-4 text-light">
                Aucune publication dans cette catégorie pour le moment.
              </p>
              <span
                className="filter-btn btn btn-sm mt-6 inline-block cursor-pointer"
                onClick={() => setTab("")}
              >
                Voir toutes les publications
              </span>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="mb-4 mt-14 flex items-center justify-center" aria-label="Pagination">
            {/* Previous button */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mr-5 flex items-center rounded-full border px-4 py-2 text-dark hover:shadow-lg md:px-6 md:py-3 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
               <AiOutlineArrowLeft className="mr-1.5 text-xl font-bold" />
              Précédent
            </button>

            {/* Page numbers */}
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`mx-1 flex h-10 w-10 items-center justify-center rounded-full border md:h-12 md:w-12 ${currentPage === number ? 'bg-primary text-white' : 'bg-white text-dark hover:bg-primary hover:text-white'}`}
              >
                {number}
              </button>
            ))}

            {/* Next button */}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-5 flex items-center rounded-full border px-4 py-2 text-dark hover:shadow-lg md:px-6 md:py-3 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Suivant
              <AiOutlineArrowRight className="ml-1.5 text-xl font-bold" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default PublicationPosts;
