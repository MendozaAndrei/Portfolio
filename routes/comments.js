var express = require('express');
var router = express.Router();

// Mock database for comments
var comments = [];

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

// Route to get all comments
router.get('/', function(req, res, next) {
  res.json(comments);
});

// Route to post a new comment
router.post('/', ensureAuthenticated, function(req, res, next) {
  const comment = {
    user: req.user.displayName, // Use the logged-in user's name
    text: req.body.text,
    date: new Date()
  };
  comments.push(comment);
  res.status(201).json(comment);
});

module.exports = router;