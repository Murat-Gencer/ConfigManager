# ConfigManager Frontend

React-based frontend application for the ConfigManager system.

## Features

- 🚀 Modern React with functional components and hooks
- 🎨 Material-UI for beautiful, responsive design
- 🔍 Real-time search and filtering
- 📱 Mobile-friendly responsive interface
- 🔐 Secure handling of sensitive configurations
- 📤 Export configurations in various formats
- ⚡ Fast and efficient with React Query for data management

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation and Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

### `npm start`

Runs the app in development mode. The page will reload if you make edits.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. The build is minified and optimized for performance.

### `npm run eject`

**Note: This is a one-way operation. Once you eject, you can't go back!**

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Application header
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── ConfigEditor.js # Configuration editor
│   └── ...
├── services/           # API services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.js              # Main application component
├── App.css             # Global styles
└── index.js            # Application entry point
```

## Features Overview

### Dashboard

- Overview of all environments
- Quick access to configuration management
- Environment status indicators
- Quick action buttons

### Configuration Editor

- Create, read, update, and delete configurations
- Environment-specific configuration management
- Search and filter configurations
- Export configurations as .env files
- Toggle visibility for sensitive values
- Bulk operations support

### Key Features

#### Environment Management
- Support for multiple environments (development, staging, production)
- Visual indicators for environment status
- Easy navigation between environments

#### Configuration Management
- Add new configurations with validation
- Edit existing configurations
- Delete configurations with confirmation
- Mark configurations as sensitive or encrypted
- Add descriptions for better documentation

#### Search and Filter
- Real-time search across configuration keys and descriptions
- Filter by configuration properties
- Responsive search interface

#### Export/Import
- Export configurations as .env files
- Download configurations for deployment
- Import configurations from files (future feature)

#### Security Features
- Hide sensitive values by default
- Toggle visibility for sensitive configurations
- Secure handling of authentication tokens
- CORS protection

## API Integration

The frontend communicates with the backend API using Axios and React Query:

```javascript
// Example API call
const { data: configurations } = useQuery(
  ['configurations', environment],
  async () => {
    const response = await axios.get(`/api/config/${environment}`);
    return response.data;
  }
);
```

### API Endpoints Used

- `GET /api/config/environments` - Fetch available environments
- `GET /api/config/{environment}` - Fetch configurations for environment
- `POST /api/config` - Create new configuration
- `PUT /api/config/{environment}/{key}` - Update configuration
- `DELETE /api/config/{environment}/{key}` - Delete configuration
- `GET /api/config/{environment}/export/env` - Export as .env file

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_VERSION=1.0.0
```

### Proxy Configuration

The `package.json` includes a proxy configuration for development:

```json
{
  "proxy": "http://localhost:8080"
}
```

This allows the frontend to make API calls to `/api/*` without CORS issues during development.

## Styling and Theming

The application uses Material-UI's theming system:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### Custom CSS Classes

Key CSS classes in `App.css`:

- `.environment-card` - Environment selection cards
- `.config-table` - Configuration data table
- `.toolbar` - Action toolbar
- `.sensitive-value` - Styling for sensitive values

## State Management

The application uses React Query for server state management:

- Automatic caching and synchronization
- Background refetching
- Optimistic updates
- Error handling

Local state is managed with React hooks (`useState`, `useReducer`).

## Error Handling

- Toast notifications for user feedback
- Error boundaries for component error handling
- API error handling with user-friendly messages
- Loading states for better UX

## Performance Optimizations

- React Query for efficient data fetching and caching
- Lazy loading of components
- Memoization of expensive calculations
- Optimized re-renders with proper dependency arrays

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
npm test -- --ci --coverage --watchAll=false
```

## Deployment

### Development Build

```bash
npm run build
```

### Docker

```bash
# Build Docker image
docker build -t config-manager-frontend .

# Run container
docker run -p 3000:3000 config-manager-frontend
```

### Production Deployment

The build folder contains static files that can be served by any web server:

- Apache
- Nginx
- Static hosting services (Netlify, Vercel, etc.)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Browser Support

The application supports modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast support
- ARIA labels and roles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Use functional components with hooks
- Follow Material-UI design patterns
- Write tests for new components
- Use TypeScript for type safety (future enhancement)
- Follow ESLint rules
- Use semantic commit messages

## Troubleshooting

### Common Issues

1. **API connection errors**: Check if backend is running on port 8080
2. **CORS errors**: Verify proxy configuration in package.json
3. **Build errors**: Clear node_modules and reinstall dependencies

### Debug Mode

Enable debug mode by setting:

```env
REACT_APP_DEBUG=true
```

This will show additional console logs and debugging information.
