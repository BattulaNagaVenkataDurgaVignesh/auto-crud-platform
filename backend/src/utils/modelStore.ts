import fs from "fs-extra";
import path from "path";
import { ModelDef } from "../types";

const modelsDir = path.join(__dirname, "../../models");

export async function ensureModelsDir() {
  await fs.ensureDir(modelsDir);
}

export async function saveModel(model: ModelDef) {
  await ensureModelsDir();
  const filePath = path.join(modelsDir, `${model.name}.json`);
  await fs.writeJson(filePath, model, { spaces: 2 });
}

export async function loadAllModels(): Promise<ModelDef[]> {
  await ensureModelsDir();
  const files = await fs.readdir(modelsDir);
  const models: ModelDef[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const p = path.join(modelsDir, f);
    const m = await fs.readJson(p) as ModelDef;
    models.push(m);
  }
  return models;
}

export async function loadModelByName(name: string): Promise<ModelDef | null> {
  const filePath = path.join(modelsDir, `${name}.json`);
  if (!(await fs.pathExists(filePath))) return null;
  return (await fs.readJson(filePath)) as ModelDef;
}
