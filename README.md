# JaMoveo - Live Rehearsal App

JaMoveo is a real-time web application designed to help musicians practice together. It allows an admin to create a rehearsal session, search for songs, and display chords and lyrics to all connected players in sync.

## Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS, Socket.IO Client
-   **Backend:** Node.js, Express, TypeScript, MongoDB (with Mongoose), Socket.IO
-   **Authentication:** JWT (Access & Refresh Tokens)


## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ofekamirav/JaMoveo
    cd JaMoveo
    ```

2.  **Setup the Backend (`server`):**
    ```bash
    cd server
    npm install
    ```
    -   Create a `.env` file in the `server` directory.
    -   Copy the contents of `.env.example` (if you have one) or add the following variables:

        ```env
        MONGO_URI=your_mongodb_connection_string
        ACCESS_TOKEN_SECRET=your_super_secret_access_key
        REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
        ACCESS_TOKEN_EXPIRATION=20m
        REFRESH_TOKEN_EXPIRATION=7d
        PORT=5001
        ```

3.  **Setup the Frontend (`client`):**
    ```bash
    cd ../client
    npm install
    ```
    -   Create a `.env` file in the `client` directory.
    -   Add the backend API URL:
        ```env
        REACT_APP_API_URL=http://localhost:5001
        ```

## Running the Application

You'll need to run both the backend and frontend servers in separate terminals.

1.  **Run the Backend Server:**
    *   Navigate to the `server` directory.
    *   Start the development server:
        ```bash
        npm run dev
        ```
    *   The server will be running on `http://localhost:5001`.

2.  **Run the Frontend App:**
    *   Navigate to the `client` directory.
    *   Start the React development server:
        ```bash
        npm start
        ```
    *   The application will open automatically in your browser at `http://localhost:3000`.


## Creating Users

-   **To create a regular player:**
    Navigate to `http://localhost:3000/register`

-   **To create an admin user:**
    Navigate to the special admin registration URL: `http://localhost:3000/admin/register`
