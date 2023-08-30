import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";

type CommandOptions = {
  cwd?: string;
};

export function runCommand(
  command: string,
  args: string[],
  { cwd }: CommandOptions = {}
) {
  return new Promise<void>((resolve, reject) => {
    console.log(`Running command [${command} ${args.join(" ")}]... in ${cwd}`);
    const child = spawn(command, args, { stdio: "inherit", cwd });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(" ")}`,
        });
        return;
      }
      resolve();
    });
  });
}

class PackageJSONManager {
  private scripts: Record<string, string> = {};
  private config: Record<string, unknown> = {};
  private dependencies = new Set<string>();
  private devDependencies = new Set<string>();

  addScript(name: string, command: string) {
    this.scripts[name] = command;
  }

  addConfig(name: string, value: unknown) {
    this.config[name] = value;
  }

  addDependencies(dependencies: string[]) {
    dependencies.forEach((dependency) => {
      this.dependencies.add(dependency);
    });
  }

  addDevDependencies(dependencies: string[]) {
    dependencies.forEach((dependency) => {
      this.devDependencies.add(dependency);
    });
  }

  getDependencies({ dev = false } = {}) {
    return [...(dev ? this.devDependencies : this.dependencies)];
  }

  applyToPackageJSON(packageJSON: Record<string, unknown>) {
    const { scripts, ...rest } = packageJSON;
    return {
      // Add scripts
      scripts: {
        ...((scripts as Record<string, unknown>) || {}),
        ...this.scripts,
      },

      // Add config
      ...{
        ...rest,
        ...this.config,
      },
    };
  }

  print() {
    // Print dependencies
    console.log("Dependencies:");
    this.dependencies.forEach((dependency) => {
      console.log(`- ${dependency}`);
    });
    // Print devDependencies
    console.log("Dev Dependencies:");
    this.devDependencies.forEach((dependency) => {
      console.log(`- ${dependency}`);
    });

    // Print scripts
    console.log("Scripts:");
    Object.entries(this.scripts).forEach(([name, command]) => {
      console.log(`- ${name}: ${command}`);
    });

    // Print config
    console.log("Config:");
    Object.entries(this.config).forEach(([name, value]) => {
      console.log(`- ${name}: ${value}`);
    });
  }
}

type FileContent =
  | {
      fromFile: string;
    }
  | { content: string };
export class TemplateBuilder {
  public packageJSON = new PackageJSONManager();
  public files = new Map<string, FileContent>();

  private filesMutators = new Map<string, (content: string) => string>();

  addDependencies(packageNames: string[]) {
    return this.packageJSON.addDependencies(packageNames);
  }
  addDevDependencies(packageNames: string[]) {
    return this.packageJSON.addDevDependencies(packageNames);
  }

  printDependencies() {
    this.packageJSON.print();
  }

  /**
   * Add a file to the template
   *
   * @param filepath Path to the file
   * @param content Content of the file
   *
   * @example
   * ```ts
   * builder.addFile("src/index.ts", {
   *   content: `console.log("Hello world")`,
   * );
   * ```
   *
   * @example
   * ```ts
   * builder.addFile("src/index.ts", {
   *   fromFile: path.join(__dirname, "index.ts"),
   * });
   * ```
   */
  addFile(filepath: string, content: FileContent) {
    this.files.set(filepath, content);
  }

  async getFileContent(filecontent: FileContent) {
    if ("fromFile" in filecontent) {
      return fs.readFile(filecontent.fromFile, "utf8");
    }
    return filecontent.content;
  }

  async writeFile(
    filepath: string,
    content: FileContent,
    { cwd = "" }: CommandOptions = {}
  ) {
    // Create the directory if it doesn't exist
    const dir = path.dirname(filepath);
    await fs.mkdir(path.join(cwd, dir), { recursive: true });

    return fs.writeFile(
      path.join(cwd, filepath),
      await this.getFileContent(content)
    );
  }

  changeFile(filepath: string, mutator: (content: string) => string) {
    if (this.filesMutators.has(filepath)) {
      console.warn(`🚨 Overriding mutator for ${filepath}`);
    }
    this.filesMutators.set(filepath, mutator);
  }

  async build({ cwd }: CommandOptions = {}) {
    // Install dev packages
    const devDependencies = this.packageJSON.getDependencies({ dev: true });
    if (devDependencies.length) {
      await runCommand(
        "pnpm",
        ["add", "--ignore-scripts", "--dev", ...devDependencies],
        { cwd }
      );
    }

    // Install packages
    const dependencies = this.packageJSON.getDependencies();
    if (dependencies.length) {
      await runCommand("pnpm", ["add", "--ignore-scripts", ...dependencies], {
        cwd,
      });
    }

    // Load current package.json file
    const packageJSON = JSON.parse(
      await fs.readFile(`${cwd}/package.json`, "utf-8")
    );

    // Apply config and scripts
    const newPackageJson = this.packageJSON.applyToPackageJSON(packageJSON);

    // Write package.json file
    await fs.writeFile(
      `${cwd}/package.json`,
      JSON.stringify(newPackageJson, null, 2)
    );

    // Write files
    await Promise.all(
      [...this.files.entries()].map(([filepath, content]) =>
        this.writeFile(filepath, content, { cwd })
      )
    );

    console.log("Mutating files");
    // Mutate files
    for (const [filepath, mutator] of this.filesMutators.entries()) {
      console.log(`Mutating ${filepath}`);
      const content = await fs.readFile(`${cwd}/${filepath}`, "utf8");
      await fs.writeFile(`${cwd}/${filepath}`, mutator(content));
    }
  }
}
