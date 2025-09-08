# ConfigManager Setup Guide

Welcome to ConfigManager! This guide will help you get the application up and running quickly.

## 🎯 What is ConfigManager?

ConfigManager is a web-based application that allows you to manage environment variables and configuration settings centrally without requiring application redeployment. Perfect for:

- Managing different environments (dev, staging, production)
- Storing API keys, database URLs, and other configuration values
- Exporting configurations as .env files
- Centralizing configuration management across your applications

## 🚀 Quick Start (Recommended)

The easiest way to get started is using our startup script:

```bash
# Navigate to the project directory
cd ConfigManager

# Run the startup script
./start.sh
```

This script will:
- Check all prerequisites
- Install dependencies
- Start both backend and frontend
- Show you the URLs to access the application

## 📋 Manual Setup

If you prefer to set up manually or the startup script doesn't work:

### Prerequisites

- **Java 17+** ([Download here](https://adoptium.net/))
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Maven 3.6+** (usually included with Java)

### Step 1: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Make Maven wrapper executable (Linux/Mac)
chmod +x mvnw

# Start the backend
./mvnw spring-boot:run

# For Windows
mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080`

### Step 2: Start the Frontend

Open a new terminal and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

The frontend will start on `http://localhost:3000`

## 🌐 Accessing the Application

Once both services are running:

- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:configdb`
  - Username: `sa`
  - Password: `password`

## 📊 Sample Data

The application comes with sample configuration data for three environments:

### Development Environment
- `DATABASE_URL`: Development database connection
- `API_KEY`: Development API key (marked as sensitive)
- `DEBUG_MODE`: Enabled for development
- `REDIS_URL`: Local Redis connection

### Staging Environment
- Similar configurations with staging-specific values

### Production Environment
- Production configurations with enhanced security
- Sensitive values are marked as encrypted

## 🔧 Using the Application

### 1. Dashboard View
- Click on any environment card to manage its configurations
- See overview of all environments and their configuration counts
- Use quick action buttons to jump to specific environments

### 2. Configuration Management
- **Add New**: Click the "Add Configuration" button
- **Edit**: Click the edit icon next to any configuration
- **Delete**: Click the delete icon (with confirmation)
- **Search**: Use the search box to find specific configurations
- **Export**: Click "Export .env" to download configurations

### 3. Configuration Properties
- **Key**: The environment variable name (e.g., `DATABASE_URL`)
- **Value**: The configuration value
- **Description**: Optional description for documentation
- **Sensitive**: Hides the value in the UI (for security)
- **Encrypted**: Marks the value as encrypted in storage

## 🔌 API Usage

Your applications can fetch configurations via the REST API:

### Get all configurations for production
```bash
curl http://localhost:8080/api/config/production
```

### Get specific configuration
```bash
curl http://localhost:8080/api/config/production/DATABASE_URL
```

### Get configurations as key-value pairs
```bash
curl http://localhost:8080/api/config/production/map
```

### Export as .env file
```bash
curl http://localhost:8080/api/config/production/export/env -o production.env
```

## 🐳 Docker Deployment

For production deployment using Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- Backend on port 8080
- Frontend on port 3000
- PostgreSQL database on port 5432
- Redis cache on port 6379

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Change server port
server.port=8080

# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/configmanager
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT secret (change in production!)
app.jwt.secret=your_secret_key_here

# CORS origins
app.cors.allowed-origins=http://localhost:3000,https://your-domain.com
```

### Frontend Configuration

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_VERSION=1.0.0
```

## 🔒 Security Notes

For production deployment:

1. **Change the JWT secret** in `application.properties`
2. **Use PostgreSQL** instead of H2 database
3. **Configure HTTPS** for both frontend and backend
4. **Set proper CORS origins**
5. **Use strong database passwords**
6. **Enable encryption** for sensitive configurations

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 8080
   lsof -i :8080
   # Kill the process
   kill -9 <PID>
   ```

2. **Java version issues**
   ```bash
   # Check Java version
   java -version
   # Should be 17 or higher
   ```

3. **Node.js version issues**
   ```bash
   # Check Node version
   node -v
   # Should be 18 or higher
   ```

4. **Database connection errors**
   - For H2: Check if the application started properly
   - For PostgreSQL: Verify connection details and that PostgreSQL is running

5. **CORS errors**
   - Verify the frontend proxy configuration in `package.json`
   - Check CORS settings in backend `SecurityConfig.java`

### Getting Help

- Check the logs: `backend.log` and `frontend.log` (when using start.sh)
- View backend logs in terminal where you ran `mvnw spring-boot:run`
- View frontend logs in terminal where you ran `npm start`
- Check browser developer console for frontend errors

## 📝 Next Steps

1. **Customize the application** for your specific needs
2. **Add authentication** for production use
3. **Implement role-based access control**
4. **Add configuration validation rules**
5. **Set up monitoring and logging**
6. **Create backup and restore functionality**

## 🤝 Contributing

We welcome contributions! See the individual README files in `/backend` and `/frontend` directories for development guidelines.

## 📄 License

This project is open source. See LICENSE file for details.

---

Happy configuring! 🎉
