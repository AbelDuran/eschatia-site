import "server-only";

import { database, databaseConfigured } from "./database";
import { Article, Kind } from "./models";
import legacyCharacters from "../app/data/characters.json";
import raceCatalog from "../app/data/races.json";
import catalog from "../app/data/catalog.json";
import lore from "../app/data/lore.json";
import { baseArticles } from "./seed";
import type { ContentDetails } from "./content-details";
import { defaultDetails } from "./content-defaults";

const enrich = (a: Article): Article => ({
  ...a,
  details: {
    ...defaultDetails(a.kind, a.slug),
    ...a.details,
  },
});

/**
 * Преобразует дату из БД/JSON в timestamp.
 * Работает со string, number, Date, null и undefined.
 */
const dateTimestamp = (value: unknown): number => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string" || typeof value === "number") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  return 0;
};

/**
 * Возвращает дату в формате YYYY-MM-DD.
 */
const dateString = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }

    if (typeof value === "string") {
      return value.slice(0, 10);
    }
  }

  return "";
};

export async function articleRecord(
  kind: Kind,
  slug: string
): Promise<Article | null> {
  if (!databaseConfigured()) {
    const base = baseArticles.find(
      (a) => a.kind === kind && a.slug === slug
    );

    return base
      ? enrich({
          ...base,
          id: `legacy:${kind}/${slug}`,
          status: "published",
          owner_id: null,
          version: 1,
          related:
            kind === "lore"
              ? lore.find((l) => l.slug === slug)?.related || []
              : [],
          created_at: "2026-09-04T00:00:00Z",
          updated_at: "2026-09-04T00:00:00Z",
        })
      : null;
  }

  const [article] = await database().query<Article>(
    "SELECT * FROM articles WHERE kind=$1 AND slug=$2",
    [kind, slug]
  );

  return article ? enrich(article) : null;
}

export const visible = (a: Article) =>
  a.status === "published" || a.status === "frozen";

export type CharacterCard = (typeof legacyCharacters)[number] & {
  frozen?: boolean;
  details: ContentDetails;
};

export async function homeData() {
  const records = databaseConfigured()
    ? await database().query<Article>(
        "SELECT * FROM articles ORDER BY created_at ASC"
      )
    : [];

  const byPath = new Map(
    records.map((a) => [`${a.kind}/${a.slug}`, a])
  );

  const live = records.filter(visible);

  const characters: CharacterCard[] = legacyCharacters
    .filter((c) => {
      const a = byPath.get(`characters/${c.slug}`);
      return !a || visible(a);
    })
    .map((c) => {
      const a = byPath.get(`characters/${c.slug}`);

      return a
        ? {
            ...c,
            name: a.title,
            shortDescription: a.summary,
            image: a.image,
            country: a.country,
            group: a.organization || "Без организации",
            race: a.race,
            frozen: a.status === "frozen",
            details: {
              ...defaultDetails("characters", c.slug),
              ...a.details,
            },
          }
        : {
            ...c,
            details: defaultDetails("characters", c.slug),
          };
    });

  live
    .filter(
      (a) =>
        a.kind === "characters" &&
        !legacyCharacters.some((c) => c.slug === a.slug)
    )
    .forEach((a, i) =>
      characters.push({
        name: a.title,
        slug: a.slug,
        shortDescription: a.summary,
        image: a.image,
        country: a.country,
        group: a.organization || "Без организации",
        race: a.race,
        role: a.summary,
        mark: "✦",
        piece: "Персонаж",
        corruption: "Не указана",
        skills: [],
        createdAt: a.created_at,
        creationOrder: 100 + i,
        application: "",
        physical: [],
        personality: [a.body],
        extracts: [],
        frozen: a.status === "frozen",
        details: a.details || {},
      })
    );

  const countries = catalog.countries
    .filter((c) => {
      const a = byPath.get(`countries/${c.slug}`);
      return !a || visible(a);
    })
    .map((c) => {
      const a = byPath.get(`countries/${c.slug}`);

      return a
        ? {
            ...c,
            name: a.title,
            description: a.summary,
          }
        : c;
    });

  live
    .filter(
      (a) =>
        a.kind === "countries" &&
        !catalog.countries.some((c) => c.slug === a.slug)
    )
    .forEach((a) =>
      countries.push({
        name: a.title,
        slug: a.slug,
        description: a.summary,
        kind: "Государство",
        crest: a.image,
      })
    );

  const groups = catalog.groups
    .filter((c) => {
      const a = byPath.get(`organizations/${c.slug}`);
      return !a || visible(a);
    })
    .map((c) => {
      const a = byPath.get(`organizations/${c.slug}`);

      return a
        ? {
            ...c,
            name: a.title,
            description: a.summary,
          }
        : c;
    });

  live
    .filter(
      (a) =>
        a.kind === "organizations" &&
        !catalog.groups.some((c) => c.slug === a.slug)
    )
    .forEach((a) =>
      groups.push({
        name: a.title,
        slug: a.slug,
        description: a.summary,
        kind: "Организация",
        crest: a.image,
      })
    );

  const races = raceCatalog
    .filter((c) => {
      const a = byPath.get(`races/${c.slug}`);
      return !a || visible(a);
    })
    .map((c) => {
      const a = byPath.get(`races/${c.slug}`);

      return {
        name: a?.title || c.name,
        slug: c.slug,
        summary: a?.summary || c.summary,
      };
    });

  live
    .filter(
      (a) =>
        a.kind === "races" &&
        !raceCatalog.some((c) => c.slug === a.slug)
    )
    .forEach((a) =>
      races.push({
        name: a.title,
        slug: a.slug,
        summary: a.summary,
      })
    );

  const news = [
    ...baseArticles
      .filter(
        (a) =>
          a.kind === "news" &&
          !byPath.has(`news/${a.slug}`)
      )
      .map((a) => ({
        ...a,
        details: {} as ContentDetails,
        created_at: "",
      })),

    ...live.filter((a) => a.kind === "news"),
  ]
    .sort((a, b) => {
      const bDate = b.details?.date ?? b.created_at;
      const aDate = a.details?.date ?? a.created_at;

      return dateTimestamp(bDate) - dateTimestamp(aDate);
    })
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      image: a.image,
      newsType: a.details?.newsType || "Объявление",
      date: dateString(a.details?.date ?? a.created_at),
    }));

  return {
    characters,
    countries,
    groups,
    raceCatalog: races,
    news,
  };
}

export type HomeData = Awaited<ReturnType<typeof homeData>>;

export async function publicIndex() {
  const rows = databaseConfigured()
    ? await database().query<Article>("SELECT * FROM articles")
    : [];

  const keys = new Set(
    rows.map((a) => `${a.kind}/${a.slug}`)
  );

  return [
    ...baseArticles
      .filter((a) => !keys.has(`${a.kind}/${a.slug}`))
      .map((a) => ({
        ...a,
        id: `legacy:${a.kind}/${a.slug}`,
        status: "published" as const,
        owner_id: null,
        version: 1,
        created_at: "2026-09-04T00:00:00Z",
        updated_at: "2026-09-04T00:00:00Z",
        related:
          a.kind === "lore"
            ? lore.find((l) => l.slug === a.slug)?.related || []
            : ([] as string[]),
      })),

    ...rows.filter(visible),
  ].map(enrich);
}