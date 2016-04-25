'use strict'

const GitHubApi = require("github");

const github = new GitHubApi({
    version: "3.0.0",
    debug: true,
    protocol: "https",
    host: "api.github.com",
    headers: {
        "user-agent": "seanbot"
    }
});

github.authenticate({
    type: "oauth",
    token: process.env.SEANBOT_GITHUB_TOKEN
});

module.exports =  github
