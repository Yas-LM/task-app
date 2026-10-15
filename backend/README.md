# Backend

Task management REST API built with Java 21, Spring Boot, Spring Data JPA, and PostgreSQL. Flyway applies database migrations at startup.

## Requirements

- JDK 21
- Docker, or a local PostgreSQL instance

## Run locally

From the repository root, start PostgreSQL with the default application credentials:

```sh
docker run --name task-postgres \
  -e POSTGRES_DB=dbtask \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -p 5432:5432 \
  -d postgres:17
```

Then start the API:

```sh
cd backend
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080`. Health is available at `/actuator/health`.

## Configuration

The defaults are in `src/main/resources/application.yml`. Override them with environment variables:

- `DB_URL` - JDBC URL (default: `jdbc:postgresql://localhost:5432/dbtask`)
- `DB_USERNAME` and `DB_PASSWORD` - PostgreSQL credentials (default: `admin` / `admin`)
- `PORT` - HTTP port (default: `8080`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID

## Build and test

```sh
./mvnw test
./mvnw package
```
