import { setProjectAnnotations } from "@storybook/testing-react";

/* eslint-disable @typescript-eslint/no-namespace */
import "@testing-library/jest-dom/vitest";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

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

afterEach(cleanup);

setProjectAnnotations(globalStorybookConfig);
