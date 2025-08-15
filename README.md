# AlgoTrack

This is a code repository for an analytics visualization site for [Codeforces online judge](http://codeforces.com/) users using [Codeforces API](https://codeforces.com/apiHelp). The application now includes Google OAuth authentication and an admin dashboard to manage users.

### Current features

#### Single User Analytics
* Verdicts chart
* Languages chart
* Tags chart
* Levels chart
* Total tried problems count
* Total solved problems count
* Average and max attempts
* Count of problems solved with one submission
* Max AC for a single problem (It indicates in how many ways someone solved a problem)
* List of unsolved problems

#### Comparison between two users
* Current, max and min rating
* Number of contests
* Best and worst position in contest
* Max positive and negative rating change
* Compared rating time-line
* Total tried problem count compared
* Total solved problem count compared
* Average and max attempts compared
* Count of problems solved with one submission compared
* Max AC for a single problem compared
* Tags compared
* Levels compared


#### Authentication Features
* Simple username/password authentication
* User information stored in SQLite database
* Admin dashboard to view all registered users and their credentials

### Installation and Setup

1. Install dependencies:
```
npm install
```

2. No additional configuration is required. The application comes with a default admin user:
   - Username: `admin`
   - Password: `admin123`

3. (Optional) Configure the server port:
   - Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   ```

### Usage

#### Development mode
```
npm run dev
```
This will start the server with nodemon, which automatically restarts when you make changes.

#### Production mode
```
npm start
```
This will start the server in production mode.

#### Static mode (original functionality)
```
npm run static
```
This will start the original static HTTP server without the authentication features.

### Accessing the application
- Main application: http://localhost:3000
- Login page: http://localhost:3000/login.html
- Admin dashboard: http://localhost:3000/admin (requires admin login)

### User Authentication

1. **Registration**:
   - Go to the login page and click "Don't have an account? Register here"
   - Enter a username, password, and optionally your Codeforces handle
   - Click "Register"

2. **Login**:
   - Go to the login page
   - Enter your username and password
   - Click "Login"

3. **Admin Access**:
   - Login with the admin credentials (username: `admin`, password: `admin123`)
   - Click the "Admin" button in the navigation bar

#### Known Issues
* When somebody searches for a handle that doesn't exists, we get Cross-Origin Request blocked and the status code becomes 0 in jQuery. So we can't determine if the user doesn't really exists or some other network problem occurs.
* Firefox hangs for a while when drawing the tags comparison chart. Probably because it's big. I have plan to divide that chart in two parts.
* When counting number of solved problems, some problems that appear both on div 1 and div 2 get counted twice.