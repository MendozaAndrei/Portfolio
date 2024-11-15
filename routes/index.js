var express = require('express');
var router = express.Router();
var axios = require('axios');
require('dotenv').config(); // Load environment variables

const GITHUB_API = 'https://api.github.com';
const REPOS = [
  'MendozaAndrei/Note-Taking-Application',
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

    res.render('index', { repos: reposData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching repository data.');
  }
});

module.exports = router;