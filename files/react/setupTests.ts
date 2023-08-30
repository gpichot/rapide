import { setProjectAnnotations } from "@storybook/testing-react";

/* eslint-disable @typescript-eslint/no-namespace */
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Storybook's preview file location
import globalStorybookConfig from "./.storybook/preview";

afterEach(cleanup);

setProjectAnnotations(globalStorybookConfig);
