resource "azurerm_static_web_app" "frontend" {
  name                = "${local.name_prefix}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = "West Europe"

  sku_tier = "Free"
  sku_size = "Free"

  lifecycle {
    ignore_changes = [
      repository_url,
      repository_branch
    ]
  }

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }

}