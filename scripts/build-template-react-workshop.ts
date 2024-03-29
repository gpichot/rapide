import path from "path";
import fs from "fs/promises";

import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateReactWorkshop({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build React Workshop Template");
  const commandOptions = { cwd };
  const templateBuilder = new TemplateBuilder();

  // Copy React Project from build-template-react
  await runCommand("mkdir", ["-p", buildDir]);
  await fs.cp(path.join(cwd, "..", "react"), buildDir, {
    recursive: true,
    filter: (src, dest) => {
      // Filter out node_modules, dist, storybook-static
      return (
        !src.includes("node_modules") &&
        !src.includes("dist") &&
        !src.includes("storybook-static")
      );
    },
  });
  templateBuilder.changeFile("package.json", (content) => {
    const packageJSON = JSON.parse(content);
    packageJSON.name = `rapide-vite-template-${name}`;
    return JSON.stringify(packageJSON, null, 2);
  });

  // Add Material UI
  templateBuilder.addDependencies([
    "@mui/material",
    "@emotion/react",
    "@emotion/styled",
    "@fontsource/roboto",
  ]);

  templateBuilder.changeFile("src/App.tsx", (content) => {
    const robotoImports = `
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
`;

    return `${robotoImports}${content}`;
  });

  // Add TanStack Query
  templateBuilder.addDependencies([
    "@tanstack/react-query",
    "@tanstack/react-query-devtools",
  ]);
  templateBuilder.addFile("src/main.tsx", {
    fromFile: path.join(resourceDir, "main.tsx"),
  });

  // Add PokeAPI
  templateBuilder.addDependencies(["pokeapi-typescript"]);

  await templateBuilder.build(commandOptions);

  await runCommand("pnpm", ["sort-package-json"], commandOptions);
  await runCommand("pnpm", ["format"], commandOptions);
  await runCommand("pnpm", ["eslint", "--fix", "src"], commandOptions);
}

export default buildTemplateReactWorkshop;
