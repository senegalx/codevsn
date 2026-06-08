import { useState, useMemo } from "react";
import { humanize, plainify } from "@lib/utils/textConverter";
import { colorForCategory, mainCategory } from "@lib/utils/categoryColors";
import { cfImage } from "@lib/utils/cfImage";
import dateFormat from "@lib/utils/dateFormat";
import readingTime from "@lib/utils/readingTime";
import {
  AiOutlineArrowRight,
  AiOutlineArrowLeft,
  AiOutlineCalendar,
} from "react-icons/ai/index.js";
import { FiInbox } from "react-icons/fi/index.js";

const SUMMARY_LENGTH = 200;

const ArticlePosts = ({
  posts,
  categories,
  featuredSlug,
  postsPerPage,
}) => {
  const [tab, setTab] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const colorFor = (cat) => colorForCategory(cat, categories);
  const getMainCat = (cat) => mainCategory(cat);

  const filterPost = useMemo(() => {
    setCurrentPage(1);
    if (!tab) {
      return posts.filter((p) => p.slug !== featuredSlug);
    }
    return posts.filter((post) => {
      const cats = Array.isArray(post.categories) ? post.categories : [post.categories];
      return cats.includes(tab);
    });
  }, [posts, tab, featuredSlug]);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filterPost.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filterPost.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <section className="section pt-0">
      <div className="container">

        {/* En-tête filtre */}
        <div className="row">
          <div className="mx-auto text-center lg:col-8">
            <h2>Toutes les actualités</h2>
            <p className="mt-3 text-light">
              {tab
                ? `${filterPost.length} article${filterPost.length > 1 ? "s" : ""} · ${humanize(tab)}`
                : `${posts.length - 1} autre${posts.length - 1 > 1 ? "s" : ""} article${posts.length - 1 > 1 ? "s" : ""}`}
            </p>

            {/* Filtre catégories */}
            <ul className="filter-list mt-8 flex flex-wrap items-center justify-center">
              <li>
                <span
                  className={`filter-btn ${!tab ? "filter-btn-active" : undefined} btn btn-sm cursor-pointer`}
                  onClick={() => setTab("")}
                >
                  Toutes catégories
                </span>
              </li>
              {categories.map((category, i) => (
                <li key={`category-${i}`} onClick={() => setTab(category)}>
                  <span
                    className={`filter-btn ${tab === category ? "filter-btn-active" : undefined} btn btn-sm cursor-pointer`}
                  >
                    {humanize(category)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Grille 3 colonnes */}
        <div className="row mt-12">
          {currentPosts.map((post, i) => {
            const cat = getMainCat(post.categories);
            const badgeColor = cat ? colorFor(cat) : "#24A1FF";
            const excerpt = plainify(post.contenu ?? "").slice(0, SUMMARY_LENGTH);
            const imageUrl = post.image?.fields?.file?.url;
            const imageAlt = post.image?.fields?.file?.fileName || post.title;

            return (
              <div className="mb-8 md:col-6 lg:col-4" key={`post-${i}`}>
                <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <a href={`/actualites/${post.slug}`} className="block overflow-hidden">
                    {imageUrl ? (
                      <img
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={cfImage(imageUrl, { w: 640, h: 400 })}
                        alt={imageAlt}
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full bg-theme-light" />
                    )}
                  </a>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-x-3">
                      {cat && (
                        <span
                          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {humanize(cat)}
                        </span>
                      )}
                    </div>
                    <h3 className="h5">
                      <a
                        href={`/actualites/${post.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-text">{excerpt}</p>
                    {(post.author || post.contenu) && (
                      <p className="mt-2 text-xs text-light">
                        {post.author ? humanize(post.author) : ""}
                        {post.author && post.contenu ? " · " : ""}
                        {post.contenu ? readingTime(post.contenu) : ""}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <span className="inline-flex items-center text-sm text-light">
                        <AiOutlineCalendar className="mr-1.5" />
                        {dateFormat(post.date)}
                      </span>
                      <a
                        className="inline-flex items-center font-semibold text-primary"
                        href={`/actualites/${post.slug}`}
                      >
                        Découvrir
                        <AiOutlineArrowRight className="ml-1.5 text-lg font-bold transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* État vide */}
        {filterPost.length === 0 && (
          <div className="row mt-12">
            <div className="mx-auto text-center lg:col-6">
              <FiInbox className="mx-auto text-5xl text-light" />
              <p className="mt-4 text-light">
                Aucun article dans cette catégorie pour le moment.
              </p>
              <span
                className="filter-btn btn btn-sm mt-6 inline-block cursor-pointer"
                onClick={() => setTab("")}
              >
                Voir tous les articles
              </span>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mb-4 mt-14 flex items-center justify-center" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mr-5 flex items-center rounded-full border px-4 py-2 text-dark hover:shadow-lg md:px-6 md:py-3 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <AiOutlineArrowLeft className="mr-1.5 text-xl font-bold" />
              Précédent
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`mx-1 flex h-10 w-10 items-center justify-center rounded-full border md:h-12 md:w-12 ${
                  currentPage === number
                    ? "bg-primary text-white"
                    : "bg-white text-dark hover:bg-primary hover:text-white"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-5 flex items-center rounded-full border px-4 py-2 text-dark hover:shadow-lg md:px-6 md:py-3 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
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

export default ArticlePosts;
