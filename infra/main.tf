locals {
  name_prefix = "${var.project_name}-${var.environment}"

  # Azure Container Registry names:
  # - lowercase alphanumeric only
  # - no hyphens
  acr_name = replace(
    "${var.project_name}${var.environment}acr",
    "-",
    ""
  )

  postgres_name = "${local.name_prefix}-postgres"
  logs_name     = "${local.name_prefix}-logs"
  insights_name = "${local.name_prefix}-insights"
  cae_name      = "${local.name_prefix}-cae"
}

# =========================================================
# Resource Group
# =========================================================

resource "azurerm_resource_group" "main" {
  name     = "rg-${local.name_prefix}"
  location = var.location

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# =========================================================
# Log Analytics
# =========================================================

resource "azurerm_log_analytics_workspace" "main" {
  name                = local.logs_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  sku               = "PerGB2018"
  retention_in_days = 30
}

# =========================================================
# Application Insights
# =========================================================

resource "azurerm_application_insights" "main" {
  name                = local.insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  application_type = "web"
  workspace_id     = azurerm_log_analytics_workspace.main.id
}

# =========================================================
# Azure Container Registry
# =========================================================

resource "azurerm_container_registry" "main" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku           = "Basic"
  admin_enabled = false

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# =========================================================
# Container Apps Environment
# =========================================================

resource "azurerm_container_app_environment" "main" {
  name                = local.cae_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  logs_destination           = "log-analytics"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  infrastructure_subnet_id   = azurerm_subnet.container_apps.id

  workload_profile {
    name                  = "Consumption"
    workload_profile_type = "Consumption"
  }

  depends_on = [azurerm_subnet_nat_gateway_association.container_apps]

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# =========================================================
# PostgreSQL Flexible Server
# =========================================================

resource "azurerm_postgresql_flexible_server" "main" {
  name                = local.postgres_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  zone                = "3"
  version             = "16"

  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password

  storage_mb = 32768

  sku_name = "B_Standard_B1ms"

  backup_retention_days = 7

  # We will harden networking later with private access/VNet.
  public_network_access_enabled = true

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.main.id

  charset   = "UTF8"
  collation = "en_US.utf8"

}