#!/bin/ts-node

import { runCommand } from "./utils";
import path from "path";
import buildTemplateReact from "./build-template-react";

async function buildTemplate(
  name: string,
  builder: ({
    name,
    cwd,
    buildDir,
    resourceDir,
  }: {
    name: string;
    cwd: string;
    buildDir: string;
    resourceDir: string;
  }) => Promise<void>
) {
  const options = {
    buildDir: path.join(process.cwd(), "templates", name),
  };
  // Clear the build directory
  console.log(`Clearing the build directory [${options.buildDir}]...`);
  await runCommand("rm", ["-rf", options.buildDir]);

  await builder({
    name
    cwd: options.buildDir,
    buildDir: options.buildDir,
    resourceDir: path.join(__dirname, "..", "files", name),
  });
}

async function main() {
  await buildTemplate("react", buildTemplateReact);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
