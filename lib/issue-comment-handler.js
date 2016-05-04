'use strict';

const ghGot = require('gh-got');
const bumpVersion = require('semver-increment');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const parseCommentBody = require('./utils').parseCommentBody;

const username = process.env.SEANBOT_GITHUB_USERNAME;
const token = process.env.SEANBOT_GITHUB_TOKEN;

function exec(command) {
  console.log(command);
  console.log(shell.exec(command).stdout);
}

function which(command) {
  console.log('which ' + command);
  return shell.which(command);
}

function cd(command) {
  console.log('cd ' + command);
  shell.cd(command);
}

function issueCommentHandler(event) {
  const payload = event.payload;
  const pullRequests = payload.issue.pull_request;
  if (!pullRequests) {
    console.log('It isn\'t a pull request.');
    return;
  }
  const commentBody = payload.comment.body.toLowerCase();
  const masks = parseCommentBody(commentBody);
  if (!masks) {
    console.log(commentBody, 'It\'s not a bump action.');
    return;
  }
  console.log(pullRequests.url, token);
  ghGot(pullRequests.url)
  .then((res) => {
    const content = res.body;
    const head = {
      'user': content.head.repo.owner.login,
      'repo': content.head.repo.name,
      'branch': content.head.ref,
    };
    const base = {
      'user': content.base.repo.owner.login,
      'repo': content.base.repo.name,
      'branch': content.base.ref,
    };
    if (head.user !== base.user && head.repo !== base.repo) {
      return Promise.reject(new Error('Can\'t support diffrent repos now'));
    }
    if (!which('git')) {
      return Promise.reject(new Error('Sorry, this script requires git'));
    }
    const user = base.user;
    const repo = base.repo;
    const dir = path.resolve(__dirname, '..', 'repos', user, repo);
    exec(`git clone https://${username}:${token}@github.com/${user}/${repo}.git ${dir}`);
    cd(dir);
    exec(`git checkout -f ${base.branch}`);
    exec('git pull -f');
    const file = path.join(dir, 'package.json');
    const version = JSON.parse(fs.readFileSync(file)).version;
    exec(`git checkout -f ${head.branch}`);
    exec('git pull -f');
    exec(`git rebase ${base.branch}`);
    const packageJson = JSON.parse(fs.readFileSync(file));
    packageJson.version = bumpVersion(masks, version);
    fs.writeFileSync(file, JSON.stringify(packageJson, null, '  '));
    exec('git add package.json');
    exec(`git commit -m "version: v${version} bump to v${packageJson.version}"`);
    exec('git push -f');
    return null;
  })
  .catch((err) => {
    console.error(err.message && err.stack);
  });
}

module.exports = issueCommentHandler;
