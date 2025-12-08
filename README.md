# Family Organiser

A web application for families to manage and share events together.

## Features

- **Event Management** - Create, edit, and delete family events
- **Family Sharing** - Share schedules with family members using a unique Family ID
- **Calendar View** - View all events in a calendar format
- **Map Integration** - See event locations on a map
- **Search** - Quickly find events by name, location, or items needed

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: NeDB (file-based)
- **Authentication**: JWT with RSA encryption

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Installation

1. **Clone the repository**

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   node generateKeypair.js  # Generate RSA keys (first time only)
   npm start
   ```

   Backend runs on `http://localhost:3002`

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## Usage

1. **Register** - Create an account and either create a new family or join an existing one
2. **Login** - Sign in with your credentials and Family ID
3. **Add Events** - Click "Add New Event" to create family events
4. **View Calendar** - Click the calendar button to see events in calendar view
5. **View Map** - Click on any event to see its location on a map

## Project Structure

```
├── backend/
│   ├── controllers/    # Route handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── config/         # Configuration files
│   ├── lib/            # Utility functions
│   └── data/           # Database files
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   └── utils/      # Helper functions
│   └── public/
```

## API Endpoints

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/register`          | Register new user       |
| POST   | `/login`             | User login              |
| GET    | `/all-events`        | Get all events          |
| POST   | `/get-family-events` | Get events for a family |
| POST   | `/new-event-entry`   | Create new event        |
| POST   | `/update-event/:id`  | Update an event         |
| POST   | `/delete-event/:id`  | Delete an event         |

## License

ISC
