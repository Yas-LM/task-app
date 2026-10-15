# Load Tests

k6 load test for `GET /api/tasks?page=0&size=20`. Each request uses a bearer token and checks for a successful response with a valid page payload.

## Requirements

- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- A running task API and a valid access token

## Run

From this directory, provide the API origin and token:

```sh
BASE_URL=http://localhost:8080 \
BEARER_TOKEN='<access-token>' \
k6 run tasks.js
```

Choose a load profile with `PROFILE`:

```sh
PROFILE=moderate BASE_URL=https://api.example.com BEARER_TOKEN='<access-token>' k6 run tasks.js
```

Available profiles are `baseline` (5 virtual users), `moderate` (15), `elevated` (30), and `scale_check` (60). The default is `baseline`.

The test checks that more than 99% of checks pass, fewer than 1% of HTTP requests fail, and the 95th-percentile response time stays below 2 seconds. Run load tests only against systems you own or are authorized to test.
