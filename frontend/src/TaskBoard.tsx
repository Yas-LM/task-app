import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CheckCheck,
  Circle,
  ClipboardList,
  ListTodo,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type Task,
} from "./lib/tasks";
import "./TaskBoard.css";

type TaskFilter = "all" | "open" | "completed";

interface TaskBoardProps {
  accountName: string;
  onSignOut: () => void;
}

function TaskBoard({ accountName, onSignOut }: TaskBoardProps) {
  const [todayLabel] = useState(() =>
    new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date()),
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listTasks()
      .then((result) => {
        if (active) {
          setTasks(result.content);
          setTotalCount(result.totalElements);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(errorMessage(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;
  const visibleTasks = useMemo(() => {
    if (filter === "open") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [filter, tasks]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const created = await createTask({
        title: title.trim(),
        description: description.trim() || null,
      });
      setTasks((current) => [created, ...current].slice(0, 100));
      setTotalCount((current) => current + 1);
      setTitle("");
      setDescription("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(task: Task) {
    setPendingId(task.id);
    setError(null);
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPendingId(null);
    }
  }

  function beginEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>, task: Task) {
    event.preventDefault();
    if (!editTitle.trim()) return;

    setPendingId(task.id);
    setError(null);
    try {
      const updated = await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingId(null);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(task: Task) {
    setPendingId(task.id);
    setError(null);
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setTotalCount((current) => Math.max(0, current - 1));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#tasks" aria-label="Daymark home">
          <span className="brand-mark">
            <CheckCheck size={21} strokeWidth={2.5} />
          </span>
          <span className="brand-name">
            daymark<span>.</span>
          </span>
        </a>
        <div className="sidebar-label">work-space</div>
        <nav className="primary-nav" aria-label="Workspace navigation">
          <a
            className="nav-link nav-link-active"
            href="#tasks"
            aria-current="page"
          >
            <ListTodo size={18} />
            <span>Tasks</span>
            <span className="nav-count">{openCount}</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-prompt">
            <span className="prompt-mark">01</span>
            <p>Small steps add up.</p>
            <span className="prompt-caption">One task at a time.</span>
          </div>
          <div className="workspace-status">
            <span className="status-dot" /> Personal workspace
          </div>
        </div>
      </aside>

      <main className="main-panel" id="tasks">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-divider">/</span>
            <strong>Tasks</strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">{todayLabel}</span>
            <span className="account-name">{accountName}</span>
            <button className="signout-button" onClick={onSignOut} type="button">
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <section className="page-heading" aria-labelledby="page-title">
            <div>
              <p className="eyebrow">
                YOUR WORKSPACE <span className="eyebrow-rule" />
              </p>
              <h1 id="page-title">
                Your tasks<span className="heading-period">.</span>
              </h1>
              <p className="page-subtitle">
                A clear list makes room for focused work.
              </p>
            </div>
            <div
              className="completion-summary"
              aria-label={`${completedCount} of ${tasks.length} loaded tasks complete`}
            >
              <div className="summary-number">
                {String(completedCount).padStart(2, "0")}
                <span>/{String(tasks.length).padStart(2, "0")}</span>
              </div>
              <div className="summary-caption">LOADED COMPLETE</div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <form className="task-composer" onSubmit={handleCreate}>
            <span className="composer-mark">
              <Plus size={18} />
            </span>
            <div className="composer-fields">
              <label className="visually-hidden" htmlFor="new-task-title">
                Task title
              </label>
              <input
                id="new-task-title"
                aria-label="Task title"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Add a task to your list..."
                value={title}
              />
              <label className="visually-hidden" htmlFor="new-task-description">
                Task notes
              </label>
              <input
                id="new-task-description"
                aria-label="Task notes"
                maxLength={2000}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a note (optional)"
                value={description}
              />
            </div>
            <button
              className="add-task-button"
              type="submit"
              disabled={saving || !title.trim()}
            >
              {saving ? (
                <LoaderCircle className="spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              <span>{saving ? "Adding" : "Add task"}</span>
            </button>
          </form>

          <div className="list-toolbar">
            <div className="list-heading-wrap">
              <h2>Task list</h2>
              <span className="list-total">{totalCount}</span>
            </div>
            <div className="filter-tabs" role="group" aria-label="Filter tasks">
              {(
                [
                  ["all", "All", tasks.length],
                  ["open", "Open", openCount],
                  ["completed", "Done", completedCount],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  className={`filter-tab ${filter === value ? "filter-tab-active" : ""}`}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>
            <div className="sort-indicator">
              <span className="sort-rule" /> Recently added
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="task-list" aria-label="Tasks" aria-busy={loading}>
            {loading ? (
              <div className="loading-state">
                <LoaderCircle className="spin" size={20} />
                <span>Loading your tasks</span>
              </div>
            ) : error && tasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <ClipboardList size={22} />
                </span>
                <h3>Can&apos;t load tasks right now.</h3>
                <p>Check the API connection and try again.</p>
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <ClipboardList size={22} />
                </span>
                <h3>
                  {totalCount === 0
                    ? "Your list is clear."
                    : "Nothing in this view."}
                </h3>
                <p>
                  {totalCount === 0
                    ? "Add a task above to get started."
                    : "Try another filter or add a new task."}
                </p>
              </div>
            ) : (
              <ul className="task-items">
                {visibleTasks.map((task, index) => (
                  <li
                    className={`task-item ${task.completed ? "task-item-completed" : ""}`}
                    key={task.id}
                    style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                  >
                    <button
                      className={`task-check ${task.completed ? "task-check-done" : ""}`}
                      type="button"
                      aria-label={
                        task.completed
                          ? `Mark ${task.title} open`
                          : `Mark ${task.title} complete`
                      }
                      aria-pressed={task.completed}
                      disabled={pendingId === task.id}
                      onClick={() => void handleToggle(task)}
                    >
                      {task.completed ? (
                        <Check size={16} strokeWidth={2.8} />
                      ) : (
                        <Circle size={20} strokeWidth={1.7} />
                      )}
                    </button>
                    {editingId === task.id ? (
                      <form
                        className="inline-edit"
                        onSubmit={(event) => void handleEdit(event, task)}
                      >
                        <input
                          aria-label="Edit task title"
                          maxLength={200}
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          autoFocus
                        />
                        <input
                          aria-label="Edit task notes"
                          maxLength={2000}
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          placeholder="Notes"
                        />
                        <div className="inline-edit-actions">
                          <button
                            className="icon-button save-edit"
                            type="submit"
                            aria-label="Save task"
                            disabled={pendingId === task.id}
                          >
                            <Check size={17} />
                          </button>
                          <button
                            className="icon-button"
                            type="button"
                            aria-label="Cancel edit"
                            onClick={() => setEditingId(null)}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="task-copy">
                        <div className="task-title-line">
                          <h3>{task.title}</h3>
                          <time dateTime={task.createdAt}>
                            {new Intl.DateTimeFormat("en", {
                              month: "short",
                              day: "numeric",
                            }).format(new Date(task.createdAt))}
                          </time>
                        </div>
                        <p>{task.description || "No notes added"}</p>
                      </div>
                    )}
                    {editingId !== task.id && (
                      <div className="task-actions">
                        {pendingId === task.id && (
                          <LoaderCircle
                            className="action-spinner spin"
                            size={15}
                          />
                        )}
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                          onClick={() => beginEdit(task)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button delete-button"
                          type="button"
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                          disabled={pendingId === task.id}
                          onClick={() => void handleDelete(task)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <footer className="list-footer">
            <span>
              <span className="footer-dot" />
              {error
                ? "API unavailable"
                : loading
                  ? "Connecting"
                  : "API connected"}
            </span>
            <span>
              Showing {visibleTasks.length} of {totalCount} tasks
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function errorMessage(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "Something went wrong. Please try again.";
}

export default TaskBoard;
