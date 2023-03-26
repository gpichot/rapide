import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config, { configType }) => {
    // Add absolute imports @
    config.resolve.alias = config.resolve.alias || [];
    config.resolve.alias.push({
      find: "@",
      replacement: path.resolve(__dirname, "../src"),
    });
    return config;
  },
};
export default config;
