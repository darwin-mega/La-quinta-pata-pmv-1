import { readFile } from "node:fs/promises";

const [topicsSource, fallaciesSource] = await Promise.all([
    readFile(new URL("../data/topics.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/fallacies.ts", import.meta.url), "utf8"),
]);

const collect = (source, pattern) => [...source.matchAll(pattern)].map(match => match[1].trim());
const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const topicIds = collect(topicsSource, /^\s+id: "([a-z]+\d+)"/gm);
const statements = collect(topicsSource, /^\s+statement: "([^"]+)"/gm);
const fallacyIds = collect(fallaciesSource, /^\s+id: "(f\d+)"/gm);
const fallacyNames = collect(fallaciesSource, /^\s+name: "([^"]+)"/gm);
const technicalNames = collect(fallaciesSource, /^\s+technicalName: "([^"]+)"/gm);
const conceptKeys = collect(fallaciesSource, /^\s+conceptKey: "([^"]+)"/gm);

const assertUnique = (label, values) => {
    const normalized = values.map(normalize);
    const duplicates = normalized.filter((value, index) => normalized.indexOf(value) !== index);
    if (duplicates.length) throw new Error(`${label}: duplicados detectados (${[...new Set(duplicates)].join(", ")})`);
};

assertUnique("IDs de premisas", topicIds);
assertUnique("Textos de premisas", statements);
assertUnique("IDs de falacias", fallacyIds);
assertUnique("Nombres cotidianos de falacias", fallacyNames);
assertUnique("Nombres tecnicos de falacias", technicalNames);
assertUnique("Conceptos logicos de falacias", conceptKeys);

if (fallacyIds.length !== conceptKeys.length) {
    throw new Error(`Cada falacia debe tener un concepto: ${fallacyIds.length} falacias, ${conceptKeys.length} conceptos.`);
}

console.log(`Contenido auditado: ${statements.length} premisas unicas y ${fallacyIds.length} falacias con conceptos unicos.`);
