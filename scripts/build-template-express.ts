// Create Base React Template
import fs from "fs/promises";

import path from "path";
import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateExpress({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build Express Prisma Template");
  const commandOptions = { cwd };
  const templateBuilder = new TemplateBuilder();

  // Create the project
  await fs.mkdir(buildDir);
  await runCommand("yarn", ["init", "-y"], commandOptions);

  // Add dependencies
  templateBuilder.packageJSON.addDevDependencies([
    "@types/node",
    "@types/express",
    "@types/jest",
    "@types/supertest",
    "@types/cors",
    "ts-node",
    "typescript",
    "jest",
    "supertest",
    "nodemon",
  ]);
  templateBuilder.packageJSON.addDependencies([
    "express",
    "prisma",
    "@prisma/client",
    "dotenv",
    "cors",
    "morgan",
  ]);

  templateBuilder.addFile("tsconfig.json", {
    fromFile: path.join(resourceDir, "tsconfig.json"),
  });

  // Create the src/index.ts file
  templateBuilder.addFile("src/index.ts", {
    fromFile: path.join(resourceDir, "index.ts"),
  });

  // Add scripts
  templateBuilder.packageJSON.addScript("start", "ts-node src/index.ts");
  templateBuilder.packageJSON.addScript(
    "dev",
    "nodemon --watch src --exec ts-node src/index.ts"
  );
  templateBuilder.packageJSON.addScript("build", "tsc");
  templateBuilder.packageJSON.addScript("test", "jest");

  // Sort package json
  templateBuilder.addDevDependencies(["sort-package-json"]);

  // Add prettier
  templateBuilder.packageJSON.addDevDependencies(["prettier"]);
  templateBuilder.packageJSON.addScript(
    "format",
    'prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"'
  );

  // Add eslint
  templateBuilder.packageJSON.addDevDependencies([
    "eslint",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "eslint-import-resolver-typescript",
    "eslint-config-prettier",
    "eslint-plugin-import",
    "eslint-plugin-jest",
    "eslint-plugin-simple-import-sort",
  ]);
  templateBuilder.addFile(".eslintrc.json", {
    fromFile: path.join(resourceDir, "eslintrc.json"),
  });
  templateBuilder.packageJSON.addScript("lint", "eslint .");

  await templateBuilder.build(commandOptions);

  // Prisma
  await runCommand("npx", ["prisma", "init"], commandOptions);

  // Tests
  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
}

export default buildTemplateExpress;
