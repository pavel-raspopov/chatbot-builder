// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
}));

vi.mock("@/actions/auth", () => ({
  signUp: mocks.signUp,
}));

import { SignupForm } from "@/components/auth/SignupForm";

beforeEach(() => {
  mocks.signUp.mockReset().mockResolvedValue({ error: null, message: null });
});

describe("SignupForm", () => {
  it("renders fields and the login link", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autoComplete",
      "new-password",
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeEnabled();
  });

  it("passes submitted credentials to the signup action", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await vi.waitFor(() => expect(mocks.signUp).toHaveBeenCalledTimes(1));
    const call = mocks.signUp.mock.calls[0] as [unknown, FormData];
    expect(call[1].get("email")).toBe("user@example.com");
    expect(call[1].get("password")).toBe("hunter2hunter2");
  });

  it("surfaces validation errors from the action", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValueOnce({
      error: "That email is already registered.",
      message: null,
    });
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That email is already registered.",
    );
  });

  it("shows a confirmation message when one is returned", async () => {
    const user = userEvent.setup();
    mocks.signUp.mockResolvedValueOnce({
      error: null,
      message: "Check your inbox to confirm your email.",
    });
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Check your inbox to confirm your email."),
    ).toBeInTheDocument();
  });
});
