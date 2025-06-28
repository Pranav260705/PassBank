# PassBank

A secure password manager built with React and Vite.

## Features
- Add, edit, and delete login credentials (site, username, password)
- Copy site, username, or password to the clipboard
- Passwords are stored on a local backend (default: http://localhost:3000/)
- Modern UI with Lordicon animated icons

## Screenshots
![Screenshot](screenshot.png)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   cd YOUR-REPO
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the App
Start the development server:
```sh
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Backend
This app expects a backend running at `http://localhost:3000/` for storing credentials. You can use [json-server](https://github.com/typicode/json-server) for quick prototyping:

```sh
npm install -g json-server
json-server --watch db.json --port 3000
```

Create a `db.json` file in your project root with:
```json
[]
```

## Environment Variables
- All Lordicon URLs are stored in the `.env` file and loaded via Vite.
- **Never commit your `.env` file if it contains sensitive data.**

## License
MIT
