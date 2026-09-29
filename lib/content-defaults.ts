import characterDetails from "../app/data/character-details.json";
import countryDetails from "../app/data/country-details.json";
import lore from "../app/data/lore-details.json";
import type { ContentDetails } from "./content-details";
export function defaultDetails(kind:string,slug:string):ContentDetails {
  if(kind==="characters") return (characterDetails as Record<string,ContentDetails>)[slug]||{};
  if(kind==="countries") return (countryDetails as Record<string,ContentDetails>)[slug]||{};
  if(kind==="lore") { return (lore as Record<string,ContentDetails>)[slug]||{}; }
  return {};
}
