import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WelcomePage } from "./index";

describe("WelcomePage", () => {
  it("points readers to the executable engineering baseline", () => {
    render(
      <MantineProvider>
        <WelcomePage />
      </MantineProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Begin with explicit boundaries",
    );
    expect(screen.getByRole("link", { name: /engineering index/i })).toBeVisible();
  });
});
