import Dexie, { type Table } from "dexie";
import type { ShootRecord } from "./types";

class ImprevuDB extends Dexie {
  shoots!: Table<ShootRecord, number>;

  constructor() {
    super("l-imprevu");
    this.version(1).stores({
      shoots: "++id, updatedAt, name",
    });
  }
}

export const db = new ImprevuDB();

export async function saveShoot(rec: ShootRecord): Promise<number> {
  const now = Date.now();
  if (rec.id) {
    await db.shoots.update(rec.id, { ...rec, updatedAt: now });
    return rec.id;
  }
  return db.shoots.add({ ...rec, createdAt: now, updatedAt: now });
}

export async function renameShoot(id: number, name: string): Promise<void> {
  await db.shoots.update(id, { name, updatedAt: Date.now() });
}

export async function deleteShoot(id: number): Promise<void> {
  await db.shoots.delete(id);
}
