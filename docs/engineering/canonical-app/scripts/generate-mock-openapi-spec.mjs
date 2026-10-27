import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse } from "yaml";

const inputPath = resolve("openapi/openapi.yaml");
const outputPath = resolve("src/mocks/openapi.spec.json");
const yaml = await readFile(inputPath, "utf8");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(parse(yaml), null, 2)}\n`, "utf8");
