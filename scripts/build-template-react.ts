// Create Base React Template

import path from "path";
import { TemplateBuilderFnOptions } from "./types";
import { runCommand, TemplateBuilder } from "./utils";

async function buildTemplateReact({
  name,
  cwd,
  buildDir,
  resourceDir,
}: TemplateBuilderFnOptions) {
  console.log("Build React Template");
  const commandOptions = { cwd };
  const templateBuilder = new TemplateBuilder();

  // Create the project
  await runCommand(
    "yarn",
    ["create", "vite", path.basename(buildDir), "--template", "react-ts"],
    { cwd: path.dirname(buildDir) }
  );
  await runCommand("yarn", ["install"], commandOptions);

  templateBuilder.changeFile("package.json", (content) => {
    const packageJSON = JSON.parse(content);
    packageJSON.name = `rapide-vite-template-${name}`;
    return JSON.stringify(packageJSON, null, 2);
  });
  templateBuilder.addFile("vite.config.ts", {
    fromFile: path.join(resourceDir, "vite.config.ts"),
  });
  templateBuilder.addFile(".gitignore", {
    fromFile: path.join(resourceDir, "gitignore"),
  });
  templateBuilder.addFile("src/App.tsx", {
    fromFile: path.join(resourceDir, "App.tsx"),
  });
  templateBuilder.addFile("src/App.module.scss", {
    fromFile: path.join(resourceDir, "App.module.scss"),
  });
  templateBuilder.addFile("src/globals.scss", {
    fromFile: path.join(resourceDir, "globals.scss"),
  });
  await runCommand("rm", ["src/App.css"], commandOptions);

  // Install storybook
  //  await runCommand("yarn", ["add", "--dev", "@storybook/cli"]);
  await runCommand("npx", ["storybook", "init"], commandOptions);
  templateBuilder.addDevDependencies(["@storybook/testing-react"]);
  templateBuilder.addFile(".storybook/main.cjs", {
    fromFile: path.join(resourceDir, "storybook-main.cjs"),
  });
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
    fromFile: path.join(resourceDir, "jest.config.js"),
  });
  templateBuilder.addFile("jest.setup.ts", {
    fromFile: path.join(resourceDir, "jest.setup.ts"),
  });
  templateBuilder.addFile("__mocks__/styleMock.ts", {
    content: "export default {};",
  });
  templateBuilder.addFile("__mocks__/fileMock.ts", {
    content: "export default 'test-file-stub';",
  });
  templateBuilder.addFile("src/App.test.tsx", {
    fromFile: path.join(resourceDir, "App.test.tsx"),
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
    fromFile: path.join(resourceDir, "eslintrc.json"),
  });
  templateBuilder.addFile("tsconfig.eslint.json", {
    fromFile: path.join(resourceDir, "tsconfig.eslint.json"),
  });

  // Auto Formatting & Fix
  templateBuilder.addDevDependencies(["husky", "lint-staged"]);
  templateBuilder.packageJSON.addScript("prepare", "husky install");
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
    tsConfig.include = [
      ...tsConfig.include,
      "__mocks__",
      "./*.js",
      "./*.cjs",
      "./*.ts",
    ];
    tsConfig.compilerOptions.paths = {
      ...tsConfig.compilerOptions.paths,
      "@/*": ["./src/*"],
    };
    return JSON.stringify(tsConfig, null, 2);
  });

  // Auto Committing
  templateBuilder.addDevDependencies([
    "@commitlint/config-conventional",
    "@commitlint/cli",
  ]);
  templateBuilder.addFile("commitlint.config.cjs", {
    content: "module.exports = {extends: ['@commitlint/config-conventional']};",
  });

  // Build
  await templateBuilder.build(commandOptions);
  await runCommand("mkdir", [".husky"], commandOptions);
  await runCommand(
    "npx",
    ["husky", "add", ".husky/pre-commit", "npx lint-staged"],
    commandOptions
  );
  await runCommand(
    "npx",
    ["husky", "add", ".husky/commit-msg", "npx --no -- commitlint --edit ${1}"],
    commandOptions
  );

  await runCommand("yarn", ["sort-package-json"], commandOptions);
  await runCommand("yarn", ["format"], commandOptions);
  await runCommand("yarn", ["eslint", "--fix", "src"], commandOptions);
  await runCommand("yarn", ["build:scss:types"], commandOptions);
  await runCommand("yarn", ["test"], commandOptions);
  await runCommand("yarn", ["build-storybook"], commandOptions);
  await runCommand("yarn", ["build"], commandOptions);
}

export default buildTemplateReact;
