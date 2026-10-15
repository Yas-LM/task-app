output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

# =========================================================
# ACR
# =========================================================

output "acr_name" {
  value = azurerm_container_registry.main.name
}

output "acr_login_server" {
  value = azurerm_container_registry.main.login_server
}

# =========================================================
# Container App
# =========================================================

output "container_app_name" {
  value = azurerm_container_app.backend.name
}

output "container_app_fqdn" {
  value = azurerm_container_app.backend.ingress[0].fqdn
}

output "backend_url" {
  value = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
}

output "container_apps_egress_ip" {
  description = "Static NAT Gateway IP allowed by the PostgreSQL firewall."
  value       = azurerm_public_ip.container_apps_egress.ip_address
}

# =========================================================
# Static Web App
# =========================================================

output "frontend_url" {
  value = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "frontend_deployment_token" {
  value     = azurerm_static_web_app.frontend.api_key
  sensitive = true
}

# =========================================================
# GitHub OIDC
# =========================================================

output "github_cd_client_id" {
  value = azurerm_user_assigned_identity.github_cd.client_id
}