// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders a button element with primary styles by default", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toContain("bg-accent");
  });

  it("renders secondary variant classes when requested", () => {
    render(<Button variant="secondary">Cancel</Button>);

    expect(screen.getByRole("button", { name: "Cancel" }).className).toContain(
      "border-border",
    );
  });

  it("supports an explicit submit type and extra classes", () => {
    render(<Button type="submit" className="w-full">Send</Button>);

    const button = screen.getByRole("button", { name: "Send" });
    expect(button.getAttribute("type")).toBe("submit");
    expect(button.className).toContain("w-full");
  });

  it("renders an anchor styled as a button when href is provided", () => {
    render(<Button href="/bots">View bots</Button>);

    const link = screen.getByRole("link", { name: "View bots" });
    expect(link.getAttribute("href")).toBe("/bots");
    expect(link.className).toContain("bg-accent");
  });
});
