#!/bin/ts-node

import { runCommand } from "./utils";
import path from "path";
import { TemplateBuilderFnOptions } from "./types";
import buildTemplateReact from "./build-template-react";
import buildTemplateReactWorkshop from "./build-template-react-workshop";
import buildTemplateExpressPrisma from "./build-template-express";
import buildTsoa from "./build-tsoa";
import buildTemplateWebExtension from "./build-template-web-extension";

async function buildTemplate(
  name: string,
  builder: ({
    name,
    cwd,
    buildDir,
    resourceDir,
  }: TemplateBuilderFnOptions) => Promise<void>
) {
  const options = {
    buildDir: path.join(process.cwd(), "templates", name),
  };
  // Clear the build directory
  console.log(`Clearing the build directory [${options.buildDir}]...`);
  await runCommand("rm", ["-rf", options.buildDir]);

  await builder({
    name,
    cwd: options.buildDir,
    buildDir: options.buildDir,
    resourceDir: path.join(__dirname, "..", "files", name),
  });
}

async function main() {
  await buildTemplate("react", buildTemplateReact);
  await buildTemplate("react-workshop", buildTemplateReactWorkshop);
  await buildTemplate("express-prisma", buildTemplateExpressPrisma);
  await buildTemplate("tsoa", buildTsoa);
  await buildTemplate("web-extension", buildTemplateWebExtension);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
