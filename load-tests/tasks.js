import http from "k6/http";
import { check } from "k6";

const profiles = {
  baseline: {
    stages: [
      { duration: "10s", target: 5 },
      { duration: "50s", target: 5 },
    ],
  },
  moderate: {
    stages: [
      { duration: "30s", target: 15 },
      { duration: "90s", target: 15 },
    ],
  },
  elevated: {
    stages: [
      { duration: "30s", target: 30 },
      { duration: "90s", target: 30 },
    ],
  },
  scale_check: {
    stages: [
      { duration: "30s", target: 60 },
      { duration: "90s", target: 60 },
    ],
  },
};

const baseUrl = (__ENV.BASE_URL || "").replace(/\/+$/, "");
const bearerToken = __ENV.BEARER_TOKEN || "";
const profileName = __ENV.PROFILE || "baseline";
const profile = profiles[profileName];

if (!baseUrl) {
  throw new Error("Set BASE_URL to the public API origin");
}

if (!bearerToken) {
  throw new Error("Set BEARER_TOKEN to a valid access token for the task API.");
}

if (!profile) {
  throw new Error(`Unknown PROFILE '${profileName}'. Choose: ${Object.keys(profiles).join(", ")}`);
}

export const options = {
  scenarios: {
    task_list: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: profile.stages,
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: [
      {
        threshold: "rate<0.01",
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
    http_req_duration: [
      {
        threshold: "p(95)<2000",
        abortOnFail: true,
        delayAbortEval: "30s",
      },
    ],
  },
  tags: {
    profile: profileName,
  },
};

export default function () {
  const response = http.get(`${baseUrl}/api/tasks?page=0&size=20`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
    tags: { name: "GET /api/tasks" },
    timeout: "10s",
  });

  let payload = null;
  if (response.status === 200) {
    try {
      payload = response.json();
    } catch (_) {
      payload = null;
    }
  }

  const validPage =
    payload !== null &&
    typeof payload === "object" &&
    Array.isArray(payload.content) &&
    payload.content.length <= 20 &&
    Number.isInteger(payload.page) &&
    payload.page === 0 &&
    Number.isInteger(payload.size) &&
    payload.size === 20 &&
    Number.isInteger(payload.totalElements) &&
    payload.totalElements >= 0 &&
    Number.isInteger(payload.totalPages) &&
    payload.totalPages >= 0;

  check(response, {
    "task list returns HTTP 200": (result) => result.status === 200,
    "task list returns a valid page": () => validPage,
  });
}