// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

describe("Input", () => {
  it("associates the label with the field using name as fallback id", () => {
    render(<Input label="Email" name="email" type="email" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("shows an error message when provided", () => {
    render(<Input label="Email" name="email" error="Enter a valid email." />);

    expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
  });

  it("omits the error line when no error is passed", () => {
    render(<Input label="Name" name="name" />);

    expect(document.querySelector(".text-error")).toBeNull();
  });
});

describe("Textarea", () => {
  it("associates the label and honors custom rows", () => {
    render(<Textarea label="System prompt" name="system_prompt" rows={6} />);

    const textarea = screen.getByLabelText("System prompt");
    expect(textarea).toHaveAttribute("id", "system_prompt");
    expect(textarea).toHaveAttribute("rows", "6");
  });

  it("shows an error message when provided", () => {
    render(
      <Textarea label="System prompt" name="system_prompt" error="Required." />,
    );

    expect(screen.getByText("Required.")).toBeInTheDocument();
  });
});
