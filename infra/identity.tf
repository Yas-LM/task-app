# =========================================================
# Managed Identity for Container App
# =========================================================

resource "azurerm_user_assigned_identity" "container_app" {
  name                = "${local.name_prefix}-container-identity"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Allow Container App to pull images from ACR.
resource "azurerm_role_assignment" "container_app_acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"

  principal_id = azurerm_user_assigned_identity.container_app.principal_id
}

# =========================================================
# Managed Identity for GitHub Actions
# =========================================================

resource "azurerm_user_assigned_identity" "github_cd" {
  name                = "${local.name_prefix}-github-cd"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# GitHub OIDC trust
resource "azurerm_federated_identity_credential" "github_cd" {
  name = "github-actions-main"

  user_assigned_identity_id = azurerm_user_assigned_identity.github_cd.id

  issuer = "https://token.actions.githubusercontent.com"

  subject = "repo:${split("/", var.github_repository)[0]}@${var.github_repository_owner_id}/${split("/", var.github_repository)[1]}@${var.github_repository_id}:ref:refs/heads/main"

  audience = [
    "api://AzureADTokenExchange"
  ]
}

# GitHub Actions can push Docker images.
resource "azurerm_role_assignment" "github_acr_push" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPush"

  principal_id = azurerm_user_assigned_identity.github_cd.principal_id
}

# Allow GitHub Actions to deploy a new image revision to this app.
resource "azurerm_role_assignment" "github_container_app_update" {
  scope                = azurerm_container_app.backend.id
  role_definition_name = "Container Apps Contributor"

  principal_id   = azurerm_user_assigned_identity.github_cd.principal_id
  principal_type = "ServicePrincipal"
}