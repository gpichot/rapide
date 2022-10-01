#!/bin/ts-node

import { runCommand, TemplateBuilder } from "./utils";
import path from "path";

const options = {
  buildDir: path.join(process.cwd(), "template"),
};

const templateBuilder = new TemplateBuilder();

async function main() {
  // Clear the build directory
  console.log(`Clearing the build directory [${options.buildDir}]...`);
  await runCommand("rm", ["-rf", options.buildDir]);

  const commandOptions = {
    cwd: options.buildDir,
  };

  // Create the project
  await runCommand("yarn", [
    "create",
    "vite",
    path.basename(options.buildDir),
    "--template",
    "react-ts",
  ]);
  await runCommand("yarn", ["install"], commandOptions);

  templateBuilder.addFile(".gitignore", {
    fromFile: path.join(__dirname, "files", "gitignore"),
  });
  templateBuilder.addFile("src/App.tsx", {
    fromFile: path.join(__dirname, "files", "App.tsx"),
  });
  templateBuilder.addFile("src/App.module.scss", {
    fromFile: path.join(__dirname, "files", "App.module.scss"),
  });
  templateBuilder.addFile("src/globals.scss", {
    fromFile: path.join(__dirname, "files", "globals.scss"),
  });
  await runCommand("rm", ["src/App.css"], commandOptions);

  // Install storybook
  //  await runCommand("yarn", ["add", "--dev", "@storybook/cli"]);
  await runCommand("npx", ["storybook", "init"], commandOptions);
  templateBuilder.addDevDependencies(["@storybook/testing-react"]);
  // Remove stories
  await runCommand("rm", ["-rf", "src/stories"], commandOptions);
  await runCommand(
    "mv",
    [".storybook/preview.cjs", ".storybook/preview.ts"],
    commandOptions
  );

  // Add sass
  templateBuilder.addDevDependencies(["sass", "typed-scss-modules"]);
  templateBuilder.addDependencies(["classnames"]);
  templateBuilder.packageJSON.addScript(
    "build:scss:types",
    "typed-scss-modules src"
  );

  // Install prettier
  templateBuilder.addDevDependencies(["prettier", "eslint-config-prettier"]);

  // Package.json sorter
  templateBuilder.addDevDependencies(["sort-package-json"]);

  // Install jest
  templateBuilder.addDevDependencies([
    "jest",
    "ts-jest",
    "@types/jest",
    "jest-environment-jsdom",
    "identity-obj-proxy",
    "@testing-library/react",
    "@testing-library/react-hooks",
    "@testing-library/user-event",
    "@testing-library/jest-dom",
  ]);
  templateBuilder.addFile("jest.config.cjs", {
    fromFile: path.join(__dirname, "files", "jest.config.js"),
  });
  templateBuilder.addFile("jest.setup.ts", {
    fromFile: path.join(__dirname, "files", "jest.setup.ts"),
  });
  templateBuilder.addFile("__mocks__/styleMock.ts", {
    content: "export default {};",
  });
  templateBuilder.addFile("__mocks__/fileMock.ts", {
    content: "export default 'test-file-stub';",
  });
  templateBuilder.addFile("src/App.test.tsx", {
    fromFile: path.join(__dirname, "files", "App.test.tsx"),
  });
  templateBuilder.packageJSON.addScript("test", "jest");

  // Install eslint
  const eslintPlugins = [
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint-import-resolver-typescript",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-jest",
    "eslint-plugin-jest-dom",
    "eslint-plugin-testing-library",
    "eslint-plugin-simple-import-sort",
    "eslint-plugin-storybook",
    "eslint-plugin-cypress",
  ];
  templateBuilder.addDevDependencies(["eslint", ...eslintPlugins]);
  templateBuilder.addFile(".eslintrc.json", {
    fromFile: path.join(__dirname, "files", "eslintrc.json"),
  });
  templateBuilder.addFile("tsconfig.eslint.json", {
    fromFile: path.join(__dirname, "files", "tsconfig.eslint.json"),
  });

  // Auto Formatting & Fix
  templateBuilder.addDevDependencies(["husky", "lint-staged"]);
  templateBuilder.packageJSON.addScript("format", "prettier --write src");
  templateBuilder.packageJSON.addScript(
    "lint",
    "eslint src --ext .js,.jsx,.ts,.tsx"
  );
  templateBuilder.packageJSON.addConfig("lint-staged", {
    "*.{css,scss,md,mdx,json}": ["prettier --write"],
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "package.json": ["sort-package-json"],
  });
  templateBuilder.changeFile("tsconfig.json", (content) => {
    const tsConfig = JSON.parse(content);
    tsConfig.compilerOptions.esModuleInterop = true;
    tsConfig.compilerOptions.allowJs = true;
    return JSON.stringify(tsConfig, null, 2);
  });

  // Auto Committing
  // runCommand("yarn", ["add", "--dev", "commitizen", "@commitlint/cs"]);

  // Print dependencies
  templateBuilder.printDependencies();

  // Build
  await templateBuilder.build(commandOptions);

  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
  await runCommand("yarn", ["build:scss:types"], commandOptions);
  await runCommand("yarn", ["test"], commandOptions);
  await runCommand("yarn", ["build-storybook"], commandOptions);
  await runCommand("yarn", ["build"], commandOptions);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
