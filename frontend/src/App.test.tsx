import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TaskBoard from "./TaskBoard";
import { createTask, listTasks, type Task } from "./lib/tasks";

vi.mock("./lib/tasks", () => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  listTasks: vi.fn(),
  updateTask: vi.fn(),
}));

const existingTask: Task = {
  id: "task-1",
  title: "Review deployment plan",
  description: "Check the new revision settings",
  completed: false,
  createdAt: "2026-10-05T10:00:00Z",
  updatedAt: "2026-10-05T10:00:00Z",
};

const signOut = vi.fn();
const renderTaskBoard = () =>
  render(<TaskBoard accountName="Demo User" onSignOut={signOut} />);

describe("Task App", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    signOut.mockReset();
    vi.mocked(listTasks).mockResolvedValue({
      content: [existingTask],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
    });
  });

  it("loads and displays tasks", async () => {
    renderTaskBoard();

    expect(
      await screen.findByRole("heading", { name: "Review deployment plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check the new revision settings"),
    ).toBeInTheDocument();
  });

  it("shows the signed-in account and signs out on request", async () => {
    const user = userEvent.setup();
    renderTaskBoard();

    expect(await screen.findByText("Demo User")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOut).toHaveBeenCalledOnce();
  });

  it("shows an unavailable state when the API cannot load tasks", async () => {
    vi.mocked(listTasks).mockRejectedValue(new Error("Service unavailable"));
    renderTaskBoard();

    expect(
      await screen.findByRole("heading", {
        name: "Can't load tasks right now.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your list is clear." }),
    ).not.toBeInTheDocument();
  });

  it("creates a task and clears the composer", async () => {
    const user = userEvent.setup();
    const createdTask = {
      ...existingTask,
      id: "task-2",
      title: "Prepare demo",
    };
    vi.mocked(createTask).mockResolvedValue(createdTask);
    renderTaskBoard();

    await screen.findByRole("heading", { name: "Review deployment plan" });
    await user.type(
      screen.getByRole("textbox", { name: "Task title" }),
      "Prepare demo",
    );
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(
      await screen.findByRole("heading", { name: "Prepare demo" }),
    ).toBeInTheDocument();
    expect(createTask).toHaveBeenCalledWith({
      title: "Prepare demo",
      description: null,
    });
    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveValue("");
  });

  it("filters completed tasks", async () => {
    const completedTask = {
      ...existingTask,
      id: "task-2",
      title: "Done item",
      completed: true,
    };
    vi.mocked(listTasks).mockResolvedValue({
      content: [existingTask, completedTask],
      page: 0,
      size: 100,
      totalElements: 2,
      totalPages: 1,
    });
    renderTaskBoard();

    await screen.findByRole("heading", { name: "Review deployment plan" });
    await userEvent.click(
      within(screen.getByRole("group", { name: "Filter tasks" })).getByRole(
        "button",
        { name: /Done/ },
      ),
    );

    expect(
      screen.getByRole("heading", { name: "Done item" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Review deployment plan" }),
    ).not.toBeInTheDocument();
  });
});
