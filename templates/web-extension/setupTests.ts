import { setGlobalConfig } from "@storybook/testing-react";

/* eslint-disable @typescript-eslint/no-namespace */
import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

// Storybook's preview file location
import globalStorybookConfig from "./.storybook/preview";

declare global {
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

setGlobalConfig(globalStorybookConfig);

expect.extend(matchers);
