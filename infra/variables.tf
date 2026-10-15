variable "project_name" {
  description = "Project name"
  type        = string
  default     = "taskapp"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be dev, test or prod."
  }
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "West Europe"
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "taskadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "postgres_database_name" {
  description = "Application database name"
  type        = string
  default     = "taskdb"
}

variable "google_client_id" {
  description = "Google OAuth web application client ID used by the SPA and API"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository in owner/repository format"
  type        = string

  validation {
    condition     = length(split("/", var.github_repository)) == 2
    error_message = "github_repository must be in owner/repository format."
  }
}

variable "github_repository_owner_id" {
  description = "Immutable numeric GitHub owner ID used in the OIDC subject"
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_owner_id))
    error_message = "github_repository_owner_id must be a numeric GitHub ID."
  }
}

variable "github_repository_id" {
  description = "Immutable numeric GitHub repository ID used in the OIDC subject"
  type        = string

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_id))
    error_message = "github_repository_id must be a numeric GitHub ID."
  }
}