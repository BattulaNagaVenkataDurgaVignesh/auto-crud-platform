import fs from "fs-extra";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const dataDir = path.join(__dirname, "../../data");

async function ensureDataDir() {
  await fs.ensureDir(dataDir);
}

function dataFileFor(modelName: string) {
  return path.join(dataDir, `${modelName}.json`);
}

export async function readAllRecords(modelName: string) {
  await ensureDataDir();
  const file = dataFileFor(modelName);
  if (!(await fs.pathExists(file))) {
    await fs.writeJson(file, []);
    return [];
  }
  return (await fs.readJson(file)) as any[];
}

export async function writeAllRecords(modelName: string, records: any[]) {
  await ensureDataDir();
  const file = dataFileFor(modelName);
  await fs.writeJson(file, records, { spaces: 2 });
}

export async function createRecord(modelName: string, data: any) {
  const records = await readAllRecords(modelName);
  const newRec = { id: uuidv4(), ...data };
  records.push(newRec);
  await writeAllRecords(modelName, records);
  return newRec;
}

export async function getRecord(modelName: string, id: string) {
  const records = await readAllRecords(modelName);
  return records.find(r => r.id === id) || null;
}

export async function updateRecord(modelName: string, id: string, patch: any) {
  const records = await readAllRecords(modelName);
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...patch };
  await writeAllRecords(modelName, records);
  return records[idx];
}

export async function deleteRecord(modelName: string, id: string) {
  const records = await readAllRecords(modelName);
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  await writeAllRecords(modelName, records);
  return true;
}
