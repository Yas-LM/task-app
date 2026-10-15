import { afterEach, describe, expect, it, vi } from "vitest";
import { listTasks } from "./tasks";
import { getGoogleIdToken } from "./auth";

vi.mock("./auth", () => ({
  getGoogleIdToken: vi.fn(),
  setGoogleIdToken: vi.fn(),
}));

describe("task API client", () => {
  afterEach(() => {
    vi.mocked(getGoogleIdToken).mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("requests the first bounded page from the configured API URL", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test/");
    vi.mocked(getGoogleIdToken).mockReturnValue("test-id-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [],
          page: 0,
          size: 100,
          totalElements: 0,
          totalPages: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await listTasks();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/api/tasks?page=0&size=100",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer test-id-token",
        },
      },
    );
  });

  it("surfaces the API Problem Detail for failed requests", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.mocked(getGoogleIdToken).mockReturnValue("test-id-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Service unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/problem+json" },
        }),
      ),
    );

    await expect(listTasks()).rejects.toThrow("Service unavailable");
  });
});
