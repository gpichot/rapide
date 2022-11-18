import path from "path";
import fs from "fs/promises";

import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateWebExtension({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build React Web Extension Template");
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

  templateBuilder.addDependencies(["webextension-polyfill"]);

  templateBuilder.addDevDependencies([
    "@types/webextension-polyfill",
    "@crxjs/vite-plugin",
  ]);

  // Popup
  templateBuilder.addFile("src/popup/index.html", {
    content: `<!DOCTYPE html><body><h1>Popup</h1><script type="module" src="/src/popup/index.tsx"></script></body>`,
  });
  templateBuilder.addFile("src/popup/index.tsx", {
    content: `console.log('Hello from popup')`,
  });

  // Options
  templateBuilder.addFile("src/options/index.html", {
    content: `<!DOCTYPE html><body><h1>Options</h1><script type="module" src="/src/options/index.tsx"></script></body>`,
  });
  templateBuilder.addFile("src/options/index.tsx", {
    content: `console.log('Hello from options')`,
  });

  // Service Worker
  templateBuilder.addFile("src/service-worker/index.ts", {
    content: `console.log('Hello from service worker')`,
  });

  // Content Scripts keep file
  templateBuilder.addFile("src/content-scripts/.keep", {
    content: ``,
  });

  // Manifest
  templateBuilder.addFile("manifest.json", {
    fromFile: path.join(resourceDir, "manifest.json"),
  });

  // vite.config.ts
  templateBuilder.addFile("vite.config.ts", {
    fromFile: path.join(resourceDir, "vite.config.ts"),
  });

  // Remove non necessary files
  await runCommand("rm", ["src/assets/react.svg"], commandOptions);
  await runCommand("rm", ["src/App.module.scss"], commandOptions);
  await runCommand("rm", ["src/App.module.scss.d.ts"], commandOptions);
  await runCommand("rm", ["src/App.test.tsx"], commandOptions);
  await runCommand("rm", ["src/App.tsx"], commandOptions);
  await runCommand("rm", ["src/globals.scss"], commandOptions);
  await runCommand("rm", ["src/globals.scss.d.ts"], commandOptions);
  await runCommand("rm", ["src/index.css"], commandOptions);
  await runCommand("rm", ["src/main.tsx"], commandOptions);

  await templateBuilder.build(commandOptions);

  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
}

export default buildTemplateWebExtension;
