import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile<{
  poaps: Record<string, string>[]; // URL, Address
  subscribers: Record<string, string>[]; // Address, Status
}>(".data/db.json");
export const db = new Low<{
  poaps: Record<string, string>[]; // URL, Address
  subscribers: Record<string, string>[]; // Address, Status
}>(adapter, {
  poaps: [],
  subscribers: [],
});
