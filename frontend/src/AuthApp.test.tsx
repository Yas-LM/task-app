import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const authMocks = vi.hoisted(() => ({
  credential: "",
  listTasks: vi.fn(),
}));

vi.mock("@react-oauth/google", async () => {
  const React = await import("react");
  return {
    GoogleLogin: ({ onSuccess }: { onSuccess: (response: { credential?: string }) => void }) =>
      React.createElement(
        "button",
        { onClick: () => onSuccess({ credential: authMocks.credential }) },
        "Continue with Google",
      ),
  };
});

vi.mock("./lib/tasks", () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  listTasks: authMocks.listTasks,
  updateTask: vi.fn(),
}));

describe("Google sign-in", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    authMocks.credential = `header.${btoa(JSON.stringify({ name: "A. User" }))}.signature`;
    authMocks.listTasks.mockResolvedValue({
      content: [],
      page: 0,
      size: 100,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it("signs in with the returned Google credential", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(await screen.findByText("A. User")).toBeInTheDocument();
  });

  it("clears the signed-in Google credential on sign-out", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(await screen.findByText("A. User")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
  });
});