import "@fontsource-variable/newsreader/index.css";
import "@fontsource-variable/source-sans-3/index.css";
import "@mantine/core/styles.css";
import "@/styles/app.css";

import { MantineProvider } from "@mantine/core";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: { a11y: { test: "error" } },
};

export default preview;
