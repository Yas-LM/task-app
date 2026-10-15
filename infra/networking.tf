resource "azurerm_virtual_network" "container_apps" {
  name                = "${local.name_prefix}-vnet"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.20.0.0/16"]

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_subnet" "container_apps" {
  name                 = "${local.name_prefix}-aca-infrastructure"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.container_apps.name
  address_prefixes     = ["10.20.0.0/27"]

  delegation {
    name = "container-apps-environment"

    service_delegation {
      name = "Microsoft.App/environments"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action"
      ]
    }
  }
}

resource "azurerm_public_ip" "container_apps_egress" {
  name                = "${local.name_prefix}-egress-ip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  ip_version          = "IPv4"

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_nat_gateway" "container_apps" {
  name                    = "${local.name_prefix}-nat"
  location                = azurerm_resource_group.main.location
  resource_group_name     = azurerm_resource_group.main.name
  sku_name                = "Standard"
  idle_timeout_in_minutes = 10

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_nat_gateway_public_ip_association" "container_apps" {
  nat_gateway_id       = azurerm_nat_gateway.container_apps.id
  public_ip_address_id = azurerm_public_ip.container_apps_egress.id
}

resource "azurerm_subnet_nat_gateway_association" "container_apps" {
  subnet_id      = azurerm_subnet.container_apps.id
  nat_gateway_id = azurerm_nat_gateway.container_apps.id

  depends_on = [azurerm_nat_gateway_public_ip_association.container_apps]
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "container_apps" {
  name      = "${local.name_prefix}-container-apps-egress"
  server_id = azurerm_postgresql_flexible_server.main.id

  start_ip_address = azurerm_public_ip.container_apps_egress.ip_address
  end_ip_address   = azurerm_public_ip.container_apps_egress.ip_address
}