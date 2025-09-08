# ConfigManager

A comprehensive solution for managing environment variables and configuration settings without requiring application redeployment.

## Overview

ConfigManager is a web-based application that allows you to:
- Store and manage environment variables centrally
- Update configurations without redeploying applications
- Organize configurations by environment (dev, staging, prod)
- Secure access with authentication
- Export configurations in various formats (.env, JSON, YAML)
- Version control for configuration changes

## Architecture

- **Backend**: Java Spring Boot with REST API
- **Frontend**: React with modern UI
- **Database**: H2 (development) / PostgreSQL (production)
- **Security**: JWT-based authentication

## Project Structure

```
ConfigManager/
├── backend/                 # Java Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── README.md
├── frontend/               # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
└── docker-compose.yml      # For easy deployment
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.6+

### Quick Start
1. Clone the repository
2. Start the backend: `cd backend && mvn spring-boot:run`
3. Start the frontend: `cd frontend && npm start`
4. Access the application at `http://localhost:3000`

## Features

### Core Features
- ✅ Environment variable management
- ✅ Multi-environment support (dev, staging, prod)
- ✅ REST API for configuration retrieval
- ✅ Web UI for configuration management
- ✅ Export/Import configurations
- ✅ Configuration validation
- ✅ Audit trail for changes

### Security Features
- ✅ User authentication and authorization
- ✅ API key management for external applications
- ✅ Role-based access control
- ✅ Encrypted storage of sensitive values

## API Usage

Your applications can retrieve configurations using simple HTTP requests:

```bash
# Get all configurations for an environment
curl -H "X-API-Key: your-api-key" \
     "http://localhost:8080/api/config/production"

# Get specific configuration
curl -H "X-API-Key: your-api-key" \
     "http://localhost:8080/api/config/production/DATABASE_URL"
```
