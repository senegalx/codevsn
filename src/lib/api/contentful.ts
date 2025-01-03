import * as contentful from "contentful";
import type { EntryFieldTypes } from "contentful";

export interface ArticlePost {
  contentTypeId: "article",
  fields: {
    title: EntryFieldTypes.Symbol,
    image: EntryFieldTypes.AssetLink,
    author: EntryFieldTypes.Symbol,
    date: EntryFieldTypes.Date,
    categories: EntryFieldTypes.Array<EntryFieldTypes.Symbol>,
    featured: EntryFieldTypes.Boolean,
    draft: EntryFieldTypes.Boolean,
    contenu: EntryFieldTypes.RichText,
    slug: EntryFieldTypes.Text
  }
}

export interface PublicationPost {
  contentTypeId: "publications",
  fields: {
    titre: EntryFieldTypes.Text,
    description: EntryFieldTypes.Text,
    document: EntryFieldTypes.AssetLink,
    dateDePublication: EntryFieldTypes.Date,
    categories: EntryFieldTypes.Symbol,
    photo: EntryFieldTypes.AssetLink,
    contenu: EntryFieldTypes.RichText,
    slug: EntryFieldTypes.Text
  }
}

export const contentfulClient = contentful.createClient({
  space: import.meta.env.PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.DEV
    ? import.meta.env.PUBLIC_CONTENTFUL_PREVIEW_TOKEN
    : import.meta.env.CONTENTFUL_DELIVERY_TOKEN,
  host: import.meta.env.DEV ? "preview.contentful.com" : "cdn.contentful.com",
});