// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
}));

vi.mock("@/actions/auth", () => ({
  signIn: mocks.signIn,
}));

import { LoginForm } from "@/components/auth/LoginForm";

beforeEach(() => {
  mocks.signIn.mockReset().mockResolvedValue({ error: null, message: null });
});

describe("LoginForm", () => {
  it("renders email and password fields plus the signup link", () => {
    render(<LoginForm nextPath="/bots" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "minLength",
      "8",
    );
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
  });

  it("submits credentials and the next path through the server action", async () => {
    const user = userEvent.setup();
    render(<LoginForm nextPath="/dashboard" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter2hunter2");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledTimes(1));
    const [, formData] = mocks.signIn.mock.calls[0] as [
      unknown,
      FormData,
    ];
    expect(formData.get("email")).toBe("user@example.com");
    expect(formData.get("password")).toBe("hunter2hunter2");
    expect(formData.get("next")).toBe("/dashboard");
  });

  it("shows the action's error message after a failed sign-in", async () => {
    const user = userEvent.setup();
    mocks.signIn
      .mockResolvedValueOnce({ error: "Invalid email or password." });
    render(<LoginForm nextPath="/bots" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password-1");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });
});
