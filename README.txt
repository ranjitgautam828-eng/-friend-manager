# Friend Manager

A full-stack web application for managing your friends' contact information, built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **User Authentication** — Register and login with email and password
- **Secure Passwords** — bcrypt hashing, never stored in plain text
- **JWT + Session Auth** — Protected routes using JSON Web Tokens and server-side sessions
- **User Data Isolation** — Each user can only see and manage their own friends
- **Full CRUD** — Add, view, edit, and delete friend records
- **Friend Profiles** — Store name, age, hobbies, contact email, and phone number

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt + express-session |
| Frontend | HTML, CSS, Vanilla JavaScript |

## Project Structure

```
friend-manager/
├── models/
│   ├── User.js          # User schema with bcrypt password hashing
│   └── Friend.js        # Friend schema with createdBy field
├── routes/
│   ├── auth.js          # Register and login routes
│   └── friends.js       # CRUD routes (protected)
├── middleware/
│   └── auth.js          # JWT verification middleware
├── public/
│   ├── index.html       # Landing page
│   ├── login.html       # Login page
│   ├── register.html    # Register page
│   ├── dashboard.html   # Main app dashboard
│   └── script.js        # Frontend JS
├── server.js            # Express app entry point
├── .env.example         # Environment variable template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free) or local MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/ranjitgautam828-eng/friend-manager.git
cd friend-manager
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Then open `.env` and fill in your values:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

4. Run the app
```bash
node server.js
```

5. Open your browser and go to `http://localhost:3000`

## How It Works

### Authentication Flow
1. User registers with email + password
2. Password is hashed with bcrypt before saving to MongoDB
3. On login, a JWT token is issued and stored in the session
4. All friend routes are protected — requests without a valid JWT are rejected

### Data Isolation
Every friend document stores a `createdBy` field (the user's email). All queries filter by this field, so users can never access each other's data.

```js
// Example: only fetch friends belonging to the logged-in user
const friends = await Friend.find({ createdBy: req.user.email });
```

## API Endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/api/register` | Register new user | No |
| POST | `/api/login` | Login and receive JWT | No |
| GET | `/api/friends` | Get all friends | Yes |
| POST | `/api/friends` | Add new friend | Yes |
| PUT | `/api/friends/:id` | Update friend | Yes |
| DELETE | `/api/friends/:id` | Delete friend | Yes |

## Security Notes

- Passwords are hashed using bcrypt (salt rounds: 10)
- JWT tokens expire after 1 hour
- `.env` file is excluded from version control via `.gitignore`
- Each user's data is isolated at the database query level

## Author

**Ranjit Gautam**
- GitHub: [@ranjitgautam828-eng](https://github.com/ranjitgautam828-eng)
- LinkedIn: [linkedin.com/in/ranjit-gautam-5b7ab2238](https://linkedin.com/in/ranjit-gautam-5b7ab2238)
- Portfolio: [ranjitgautam828-eng.github.io/ranjit-gautam-portfolio](https://ranjitgautam828-eng.github.io/ranjit-gautam-portfolio/index.html)

---

*Built as part of CIS-245 coursework at the University of the Fraser Valley — extended with full authentication and deployment.*