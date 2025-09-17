# HYPE Mentorship Portal

This is the official monorepo for the HYPE Mentorship Portal, a comprehensive web application for managing mentor-mentee relationships, tracking progress, and handling administrative tasks.

## Getting Started

This project is a monorepo containing both the frontend and backend. Follow these steps to get the application running locally.

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher)
- npm

### Installation & Running the App

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd hype-mentorship-portal
    ```

2.  **Build and run with Docker Compose:**

    This is the recommended method for a production-like environment.

    ```bash
    docker-compose up --build
    ```

3.  **Local Development (without Docker):**

    You will need to run the frontend and backend in separate terminals.

    **For the backend:**

    ```bash
    cd backend
    npm install
    npm start
    ```

    **For the frontend:**

    ```bash
    cd frontend
    npm install
    npm start
    ```

## API Usage

The frontend communicates with the backend via a REST API. We have a dedicated service module that simplifies making API requests. This module is located at `frontend/src/services/api.js`.

To use the API service, import the `api` object in your React components:

```javascript
import api from '../services/api';
```

### Making API Requests

Here are some examples of how to use the `api` service with `react-query`:

**Fetching Data (GET):**

```javascript
import { useQuery } from 'react-query';
import api from '../services/api';

function Mentees() {
  const { data, isLoading, error } = useQuery('mentees', () => api.get('/mentees'));

  if (isLoading) return 'Loading...';
  if (error) return `An error occurred: ${error.message}`;

  // ...
}
```

**Creating Data (POST):**

```javascript
import { useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

function AddMenteeForm() {
  const queryClient = useQueryClient();
  const mutation = useMutation(newMentee => api.post('/mentees', newMentee), {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries('mentees');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // ...
}
```

**Updating Data (PUT/PATCH):**

```javascript
const mutation = useMutation(updatedMentee => api.put(`/mentees/${menteeId}`, updatedMentee), {
  // ...
});
```

**Deleting Data (DELETE):**

```javascript
const mutation = useMutation(menteeId => api.delete(`/mentees/${menteeId}`), {
  // ...
});
```

## Available Scripts

### Frontend (`/frontend`)

-   `npm start`: Runs the app in development mode.
-   `npm test`: Runs the test suite.
-   `npm run build`: Builds the app for production.

### Backend (`/backend`)

-   `npm start`: Starts the server in production mode.
-   `npm run dev`: Starts the server in development mode with `nodemon`.
-   `npm test`: Runs the test suite.

## Folder Structure

```
/
├── backend/
│   ├── src/
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js  (API service module)
│   │   └── utils/
│   └── ...
└── docker-compose.yml
```
