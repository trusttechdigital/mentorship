// frontend/README.md
# Mentorship Portal Frontend

A React-based frontend application for managing mentorship programs, staff, documents, and administrative tasks.

## Features

- **Authentication**: Login/register with JWT tokens
- **Dashboard**: Overview of key metrics and recent activity
- **Staff Management**: Create, view, and manage team members
- **Mentee Directory**: Track program participants and their progress
- **Document Management**: Upload, organize, and share files
- **Receipt Filing**: Track expenses with approval workflows
- **Invoice Tracking**: Manage vendor payments and due dates
- **Inventory Management**: Monitor stock levels and supplies

## Tech Stack

- **React 18** - Frontend framework
- **React Query** - Data fetching and state management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 3001

### Installation

1. Clone the repository and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables:
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=Mentorship Portal
```

5. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Sidebar, Header)
│   └── UI/             # Generic UI components (Modal, FileUpload, etc.)
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks
├── pages/              # Page components
│   ├── Dashboard/      # Dashboard page
│   ├── Staff/          # Staff management
│   ├── Mentees/        # Mentee management
│   ├── Documents/      # Document management
│   ├── Receipts/       # Receipt filing
│   ├── Invoices/       # Invoice tracking
│   └── Inventory/      # Stock management
├── services/           # API services
├── utils/              # Utility functions
├── App.js              # Main app component
└── index.js            # Entry point
```

## Key Components

### Authentication
- JWT-based authentication with automatic token refresh
- Role-based access control (Admin, Coordinator, Mentor, Staff)
- Protected routes and public routes

### Data Management
- React Query for efficient data fetching and caching
- Optimistic updates for better UX
- Error handling and retry logic

### File Upload
- Drag & drop file upload component
- File type and size validation
- Progress indicators

### Tables & Data Display
- Reusable DataTable component with sorting, filtering, pagination
- Status badges with context-aware styling
- Empty states and loading indicators

## API Integration

The frontend integrates with the backend API endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/staff` - Staff management
- `/api/mentees` - Mentee management
- `/api/documents/*` - Document operations
- `/api/receipts/*` - Receipt management
- `/api/invoices/*` - Invoice tracking
- `/api/inventory/*` - Stock management
- `/api/dashboard/stats` - Dashboard metrics

## Styling

The project uses Tailwind CSS with custom utility classes:

- `.btn-primary` - Primary button styles
- `.btn-secondary` - Secondary button styles
- `.input-field` - Form input styles
- `.card` - Card container styles
- `.status-badge` - Status indicator styles

## Development Guidelines

### Adding New Pages

1. Create a new directory under `src/pages/`
2. Create the main component file
3. Add route to `App.js`
4. Update sidebar navigation in `Layout/Sidebar.js`

### API Calls

Use React Query for all API calls by importing the default `api` object from the API service module. This object is an abstraction over `axios` and automatically handles authentication tokens and error responses.

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

// Fetching data
const { data, isLoading, error } = useQuery(
  'mentees', // A unique key for the query
  () => api.get('/mentees')
);

// Creating data (Mutation)
const queryClient = useQueryClient();
const createMenteeMutation = useMutation(
  (newMentee) => api.post('/mentees', newMentee),
  {
    onSuccess: () => {
      // Invalidate and refetch the 'mentees' query
      queryClient.invalidateQueries('mentees');
    }
  }
);
```

### Form Handling

Use controlled components with proper validation:

```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The build folder contains the production-ready files that can be deployed to any static file server.

## Docker Deployment

The frontend includes Docker configuration for containerized deployment. See the main project README for Docker setup instructions.

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript-style prop validation where possible
3. Write descriptive commit messages
4. Test new features thoroughly before committing

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_APP_NAME` - Application name

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)