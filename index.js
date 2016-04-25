'use strict'

const koa = require('koa');
const koaBody = require('koa-body');
const GithubWebhookHandler = require('koa-github-webhook-handler');
const github = require('./github');
const bumpVersion = require('semver-increment');

let app = koa();

let githubWebhookHandler = new GithubWebhookHandler({
  path: '/webhook',
  secret: process.env.SEANBOT_WEBHOOK_SECRET,
});

githubWebhookHandler.on('issue_comment', (event) => {
  const payload = event.payload;

  //judge if the comment is from pull requests
  const pullRequest = payload['issue']['pull_request'];
  if (!pullRequest) {
    return;
  }

  const commentBody = payload['comment']['body'].toLowerCase();

  if (commentBody.match('@seanbot') && commentBody.match('dump')) {

    function getMasksFromCommentBody() {
      let MAJOR = 0;
      let MINOR = 0;
      let PATCH = 0;
      if (commentBody.match('major')) {
        MAJOR = 1;
      } else if (commentBody.match('minor')) {
        MINOR = 1;
      } else if (commentBody.match('patch')) {
        PATCH = 1;
      } else {
        return;
      }
      const masks = [MAJOR, MINOR, PATCH];
      return masks;
    }

    function getMsgFormPrUrl() {
      const list = pullRequest['url'].split('/');
      return {
        user: list[4],
        repo: list[5],
        number: list[7]
      };
    }

    const masks = getMasksFromCommentBody();
    if (!masks) {
      return;
    }

    github.pullRequests.get(getMsgFormPrUrl(), (err, res) => {
      if (err) {
        console.error(err && err.stack);
        return;
      }
      const data = {
        user: res['head']['repo']['owner']['login'],
        repo: res['head']['repo']['name'],
        path: 'package.json',
        ref: res['head']['ref']
      };

      github.repos.getContent(data, (err, res) => {
        if (err) {
          console.error(err && err.stack);
          return;
        }

        const content = res['content'];
        const sha = res['sha'];
        let _package = JSON.parse(new Buffer(content, 'base64').toString());
        _package.version = bumpVersion(masks, _package.version);

        github.repos.updateFile({
          user: data['user'],
          repo: data['repo'],
          path: 'package.json',
          branch: data['ref'],
          message: 'Dump version to ' + _package.version,
          content: new Buffer(JSON.stringify(_package, null, '  ')).toString('base64'),
          sha: res.sha
        }, (err, res) => {
          if (err) {
            console.log(err && err.stack);
            return;
          }
          console.log(res);
        });
      });
    });
  }
});


app.use(koaBody({
  formidable: {
    uploadDir: __dirname}
  }
));
app.use(githubWebhookHandler.middleware());
app.listen((process.env.PORT || 4444));
