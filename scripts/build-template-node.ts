import fs from "fs/promises";

import path from "path";
import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateNode({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build Node Template");
  const commandOptions = { cwd };
  const templateBuilder = new TemplateBuilder();

  // Create the project
  await fs.mkdir(buildDir);
  await runCommand("yarn", ["init", "-y"], commandOptions);

  // Add dependencies
  templateBuilder.packageJSON.addDevDependencies([
    "@types/node",
    "@types/jest",
    "ts-node",
    "typescript",
    "jest",
    "nodemon",
  ]);
  templateBuilder.packageJSON.addDependencies(["dotenv"]);

  templateBuilder.addFile("tsconfig.json", {
    content: `{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "build",
    "strict": true,
    "target": "es6",
    "module": "commonjs",
    "lib": ["esnext"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "esModuleInterop": true
  }
}`,
  });

  // Create the src/index.ts file
  templateBuilder.addFile("src/index.ts", {
    content: `console.log("Hello World");`,
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

  // Tests
  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
}

export default buildTemplateNode;
