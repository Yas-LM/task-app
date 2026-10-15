# Azure Infrastructure

Terraform configuration for the task app's Azure resources, including PostgreSQL, Azure Container Apps, Container Registry, Static Web App, networking, monitoring, and GitHub Actions OIDC identity.

## Requirements

- Terraform 1.9 or later
- Azure CLI and an Azure subscription
- AzureRM provider 5.x (installed by `terraform init`)

Sign in to Azure before planning or applying:

```sh
az login
```

## Configure

From this directory, create a local variables file based on the example:

```sh
cp terraform.tfvars.example terraform.tfvars
```

Set the required values in `terraform.tfvars`, especially `postgres_admin_password`, `google_client_id`, and the GitHub repository name and numeric owner/repository IDs. Keep credentials and Terraform state files private; do not commit them.

## Plan and apply

```sh
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

Review the plan before applying. To remove the resources managed by this configuration, run `terraform destroy` and confirm the prompt.

Useful outputs include `backend_url`, `frontend_url`, `acr_login_server`, and `github_cd_client_id`.
