import { colorForCategory, mainCategory } from "@lib/utils/categoryColors";
import { humanize } from "@lib/utils/textConverter";
import dateFormat from "@lib/utils/dateFormat";
import { cfImage } from "@lib/utils/cfImage";
import { AiOutlineArrowRight, AiOutlineCalendar } from "react-icons/ai/index.js";
import { FiDownload } from "react-icons/fi/index.js";

const ContentCard = ({
  href,
  image,
  category,
  categories,
  title,
  excerpt,
  date,
  meta,
  hasPdf = false,
  ctaLabel = "Découvrir",
}) => {
  const cat = category ?? mainCategory(category ?? "");
  const badgeColor = cat ? colorForCategory(cat, categories) : "#24A1FF";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <a href={href} className="block overflow-hidden">
        {image?.url ? (
          <img
            className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={cfImage(image.url, { w: 640, h: 400 })}
            alt={image.alt || ""}
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
          {hasPdf && <FiDownload className="text-light" title="PDF disponible" />}
        </div>
        <h3 className="h5">
          <a href={href} className="transition-colors hover:text-primary">
            {title}
          </a>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm text-text">{excerpt}</p>
        {(meta?.author || meta?.readingTime) && (
          <p className="mt-2 text-xs text-light">
            {meta.author ? humanize(meta.author) : ""}
            {meta.author && meta.readingTime ? " · " : ""}
            {meta.readingTime ?? ""}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="inline-flex items-center text-sm text-light">
            <AiOutlineCalendar className="mr-1.5" />
            {dateFormat(date)}
          </span>
          <a className="inline-flex items-center font-semibold text-primary" href={href}>
            {ctaLabel}
            <AiOutlineArrowRight className="ml-1.5 text-lg font-bold transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
