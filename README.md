# Task Management App

A small task management application, built with a Java Spring Boot backend and a React frontend.

## Technology Stack

- **Backend:** Java with Spring Boot
- **Frontend:** React
- **Cloud deployment:** Microsoft Azure, automated with GitHub Actions
- **Infrastructure:** Provisioned on Azure using Terraform
- **Load testing:** k6

## GitHub Actions Setup

The backend and frontend workflows run on pushes to `main` when their respective directories change. Both can also be started manually from the repository's **Actions** tab.

After provisioning Azure infrastructure with Terraform, add the following under **Settings > Secrets and variables > Actions** in GitHub. Use repository **secrets** for credentials and **variables** for non-sensitive configuration.

### Secrets

- `AZURE_CLIENT_ID` - Terraform output `github_cd_client_id`; used for Azure login with OIDC
- `AZURE_TENANT_ID` - Azure tenant ID
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - deployment token for the Azure Static Web App

### Variables

- `ACR_NAME` - Azure Container Registry name
- `IMAGE_NAME` - backend image name
- `CONTAINER_APP_NAME` - Azure Container App name
- `RESOURCE_GROUP` - Azure resource group name
- `VITE_API_BASE_URL` - deployed backend URL used by the frontend
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID used by the frontend

The Terraform configuration creates the GitHub Actions OIDC identity and grants it permissions to push to ACR and update the Container App. Its federated credential is scoped to the configured repository's `main` branch. See [infra/README.md](infra/README.md) for infrastructure setup.

## Repository Structure

- `backend/` - Spring Boot API
- `frontend/` - React application
- `infra/` - Terraform configuration for Azure infrastructure
- `load-tests/` - k6 load tests
- `.github/workflows/` - GitHub Actions workflows
