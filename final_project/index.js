const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

app.use(express.json());

// Session middleware for /customer routes
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", (req, res, next) => {
  if (!req.session.authorization || !req.session.authorization.token) {
    return res.status(403).json({ message: "User not logged in." });
  }

  jwt.verify(req.session.authorization.token, "fingerprint_customer", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
});

// Mount routers
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
