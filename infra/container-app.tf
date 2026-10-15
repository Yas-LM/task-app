resource "azurerm_container_app" "backend" {
  name                = "${local.name_prefix}-backend"
  resource_group_name = azurerm_resource_group.main.name

  container_app_environment_id = azurerm_container_app_environment.main.id

  workload_profile_name = "Consumption"

  # -------------------------------------------------------
  # SINGLE REVISION
  # -------------------------------------------------------
  #
  # Only one revision receives production traffic.
  #
  revision_mode = "Single"

  # Keep a small history of inactive revisions.
  max_inactive_revisions = 5

  # -------------------------------------------------------
  # Managed Identity
  # -------------------------------------------------------

  identity {
    type = "UserAssigned"

    identity_ids = [
      azurerm_user_assigned_identity.container_app.id
    ]
  }

  # -------------------------------------------------------
  # Container Registry
  # -------------------------------------------------------

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.container_app.id
  }

  secret {
    name  = "db-url"
    value = "jdbc:postgresql://${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  }

  secret {
    name  = "db-username"
    value = var.postgres_admin_username
  }

  secret {
    name  = "db-password"
    value = var.postgres_admin_password
  }

  # -------------------------------------------------------
  # Public HTTPS ingress
  # -------------------------------------------------------

  ingress {
    external_enabled           = true
    target_port                = 8080
    transport                  = "auto"
    allow_insecure_connections = false

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  # -------------------------------------------------------
  # Application template
  # -------------------------------------------------------

  template {

    # Start with one replica.
    min_replicas = 1

    # Autoscaling can go up to five.
    max_replicas = 5

    # -----------------------------------------------------
    # HTTP autoscaling
    # -----------------------------------------------------

    http_scale_rule {
      name                = "http-scaling"
      concurrent_requests = 50
    }

    # -----------------------------------------------------
    # Container
    # -----------------------------------------------------

    container {
      name = "backend"

      # Bootstrap image.
      #
      # nginx-unprivileged listens on 8080.
      # This allows Terraform to create the Container App
      # before our real Spring Boot image exists.
      image = "ghcr.io/nginxinc/nginx-unprivileged:1.27-alpine-slim"

      cpu    = 0.5
      memory = "1Gi"

      env {
        name        = "DB_URL"
        secret_name = "db-url"
      }

      env {
        name        = "DB_USERNAME"
        secret_name = "db-username"
      }

      env {
        name        = "DB_PASSWORD"
        secret_name = "db-password"
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }

      startup_probe {
        transport               = "TCP"
        port                    = 8080
        initial_delay           = 5
        interval_seconds        = 5
        timeout                 = 3
        failure_count_threshold = 30
      }

      liveness_probe {
        transport               = "TCP"
        port                    = 8080
        interval_seconds        = 10
        timeout                 = 3
        failure_count_threshold = 3
      }

      readiness_probe {
        transport               = "TCP"
        port                    = 8080
        interval_seconds        = 5
        timeout                 = 3
        success_count_threshold = 1
        failure_count_threshold = 3
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image
    ]
  }

  depends_on = [
    azurerm_role_assignment.container_app_acr_pull
  ]

  tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}