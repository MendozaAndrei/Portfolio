var express = require('express');
var router = express.Router();
var axios = require('axios');
require('dotenv').config(); // Load environment variables
const fs = require('fs');
const path = require('path');

const GITHUB_API = 'https://api.github.com';
const REPOS = [
  'MendozaAndrei/Note-Taking-Application',
  'MendozaAndrei/Python-Website',
  'MendozaAndrei/Portfolio'
  // Add more repositories as needed
];

/* GET home page. */
router.get('/', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default; 
    const reposData = await Promise.all(
      REPOS.map(async (repo) => {
        const repoDetails = await fetch(`${GITHUB_API}/repos/${repo}`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`
          }
        }).then((res) => res.json());

        console.log(`Fetched repo details for ${repo}:`, repoDetails);

        const contributors = await fetch(`${GITHUB_API}/repos/${repo}/contributors`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`
          }
        }).then((res) => res.json());

        console.log(`Fetched contributors for ${repo}:`, contributors);

        const topics = await fetch(`${GITHUB_API}/repos/${repo}/topics`, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.mercy-preview+json'
          }
        }).then((res) => res.json());

        return { ...repoDetails, contributors, topics: topics.names };
      })
    );
    const commentsFilePath = path.join(__dirname, 'comments.json');
    const commentsData = JSON.parse(fs.readFileSync(commentsFilePath, 'utf-8'));
    if (req.user){
	    console.log(req.user)
      res.render('index', { repos: reposData, user: req.user, comments: commentsData})
    } else {
      
      res.render('index', { repos: reposData, user: null});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching repository data.');
  }
});

router.post('/submit-comment', (req, res) => {
  const newComment = {
    username: req.body.username || 'Anonymous',
    comment: req.body.comment,
    date: new Date().toISOString()
  };

  const commentsFilePath = path.join(__dirname, 'comments.json');
  fs.readFile(commentsFilePath, (err, data) => {
    if (err) throw err;
    const comments = JSON.parse(data);
    comments.push(newComment);
    fs.writeFile(commentsFilePath, JSON.stringify(comments, null, 2), (err) => {
      if (err) throw err;
      res.json(newComment);
    });
  });
});

module.exports = router;
