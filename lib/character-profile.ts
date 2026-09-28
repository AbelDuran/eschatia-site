import characters from "../app/data/characters.json";
import type { Article } from "./models";

export function characterProfile(record: Article) {
  const original = characters.find(c => c.slug === record.slug);
  const physical: string[][] = [];
  const personality: string[] = [];
  const extracts: string[] = [];
  let section = "biography";
  for (const paragraph of record.body.trim().split(/\n\s*\n/).filter(Boolean)) {
    const heading = paragraph.trim().toLowerCase().replace(/:$/, "");
    if (heading === "физические данные") { section = "physical"; continue; }
    if (heading === "характер") { section = "personality"; continue; }
    if (heading === "биография") { section = "biography"; continue; }
    if (section === "physical") {
      for (const line of paragraph.split("\n")) {
        const colon = line.indexOf(":");
        if (colon > 0) physical.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
        else physical.push(["Описание", line]);
      }
    } else if (section === "personality") personality.push(paragraph);
    else extracts.push(paragraph);
  }
  const raceRow = physical.find(row => row[0].toLowerCase() === "раса");
  if (raceRow && record.race) raceRow[1] = record.race;
  if (!physical.length && record.race) physical.push(["Раса", record.race]);
  return {
    name: record.title, image: record.image, country: record.country || "Не указана",
    group: record.organization || "Без организации", shortDescription: record.summary,
    role: original?.role || "", piece: original?.piece || "Персонаж", mark: original?.mark || "✦",
    application: original?.application || "", physical, personality, extracts,
  };
}
