import path from "path";
import fs from "fs/promises";

import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateTsoa({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build TSOA Template");
  const commandOptions = { cwd };
  const templateBuilder = new TemplateBuilder();

  // Copy Express Project from build-template-express
  await runCommand("mkdir", ["-p", buildDir]);
  await fs.cp(path.join(cwd, "..", "express-prisma"), buildDir, {
    recursive: true,
    filter: (src, dest) => {
      // Filter out node_modules, dist, storybook-static
      return !src.includes("node_modules");
    },
  });
  templateBuilder.changeFile("package.json", (content) => {
    const packageJSON = JSON.parse(content);
    packageJSON.name = `rapide-vite-template-${name}`;
    return JSON.stringify(packageJSON, null, 2);
  });

  // Add tsoa
  templateBuilder.addDependencies([
    "tsoa",
    "swagger-ui-express",
    "concurrently",
  ]);
  templateBuilder.addDevDependencies(["@types/swagger-ui-express"]);
  templateBuilder.packageJSON.addScript("build", "tsoa spec-and-routes && tsc");
  templateBuilder.packageJSON.addScript("start", "node build/src/server.js");
  templateBuilder.packageJSON.addScript(
    "dev",
    'concurrently \\"nodemon\\" \\"nodemon -x tsoa spec-and-routes\\"'
  );

  // Add tsoa config
  templateBuilder.addFile("tsoa.json", {
    content: JSON.stringify(
      {
        entryFile: "src/app.ts",
        noImplicitAdditionalProperties: "throw-on-extras",
        controllerPathGlobs: ["src/features/**/*Controller.ts"],
        spec: {
          outputDirectory: "build",
          specVersion: 3,
        },
        routes: {
          routesDir: "build",
        },
      },
      null,
      2
    ),
  });

  // Add server.ts and app.ts
  templateBuilder.addFile("src/server.ts", {
    fromFile: path.join(resourceDir, "server.ts"),
  });
  templateBuilder.addFile("src/app.ts", {
    fromFile: path.join(resourceDir, "app.ts"),
  });

  //await runCommand("rm src/index.ts", [], commandOptions);

  await templateBuilder.build(commandOptions);

  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  // await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
}

export default buildTemplateTsoa;
