import session from "express-session"

export default session({
  secret: process.env.SESSION_SECRET || "session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000,
  },
})
