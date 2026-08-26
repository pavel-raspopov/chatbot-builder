// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { UsageMeter } from "@/components/ui/UsageMeter";

describe("UsageMeter", () => {
  it("shows the default value label and mid-range meter state", () => {
    render(<UsageMeter label="Messages" used={120} limit={2000} />);

    const meter = screen.getByRole("meter", { name: "Messages" });
    expect(screen.getByText("120 / 2000")).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "2000");
    expect(meter).toHaveAttribute("aria-valuenow", "120");
  });

  it("clamps aria-valuenow at the limit and warns at capacity", () => {
    render(<UsageMeter label="Storage" used={250} limit={200} valueLabel="Full" />);

    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuenow", "200");
  });

  it("treats a zero limit as full", () => {
    render(<UsageMeter label="Storage" used={0} limit={0} />);

    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuenow", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "0");
  });
});
