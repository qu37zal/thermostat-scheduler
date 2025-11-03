# Smart Thermostat Scheduler Backend

This is the backend service for the Smart Thermostat Scheduler application. It is built using Node.js and Express, and it serves as the API for managing the schedule of a smart thermostat.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd smart-thermostat-scheduler/backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

### Running the Application

To start the backend server, run the following command:
```
npm start
```

The server will be running on `http://localhost:3000`.

### API Endpoints

- `GET /api/hello`: Returns a "Hello World" message.

### Folder Structure

- `src/app.ts`: Entry point of the application.
- `src/routes/index.ts`: Defines the API routes.
- `src/controllers/helloController.ts`: Contains the logic for handling requests.

### License

This project is licensed under the MIT License. See the LICENSE file for details.