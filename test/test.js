'use strict';

const test = require('tape');
const parseCommentBody = require('../lib/utils').parseCommentBody;
const getPrMsgFormUrl = require('../lib/utils').getPrMsgFormUrl;
const getBranchMsgFormHtmlUrl = require('../lib/utils').getBranchMsgFormHtmlUrl;

test('utils.parseCommentBody', function(t) {
  t.equal(parseCommentBody('@seanbot bump'), null);
  t.deepEqual(parseCommentBody('@seanbot bump major'), [1, 0, 0]);
  t.deepEqual(parseCommentBody('@seanbot bump minor'), [0, 1, 0]);
  t.deepEqual(parseCommentBody('@seanbot bump patch'), [0, 0, 1]);
  t.deepEqual(parseCommentBody('@sanbot bmp msjor'), [1, 0, 0]);
  t.deepEqual(parseCommentBody('@senbot bup mimor'), [0, 1, 0]);
  t.deepEqual(parseCommentBody('@seanot dump patxh'), [0, 0, 1]);
  t.end();
});

test('utils.getPrMsgFormUrl', function(t) {
  function testit(url, expect) {
    t.deepEqual(getPrMsgFormUrl(url), expect);
  }
  testit('https://api.github.com/repos/weflex/seanbot/pulls/1', {
    user: 'weflex',
    repo: 'seanbot',
    number: '1',
  });
  testit('https://api.github.com/repos/weflex/studio-desktop/pulls/2', {
    user: 'weflex',
    repo: 'studio-desktop',
    number: '2',
  });
  t.end();
});

test('utils.getBranchMsgFormHtmlUrl', function(t) {
  function testit(url, expect) {
    t.deepEqual(getBranchMsgFormHtmlUrl(url), expect);
  }
  testit('https://github.com/weflex/seanbot/blob/master/package.json', {
    user: 'weflex',
    repo: 'seanbot',
    branch: 'master',
  });
  testit('https://github.com/weflex/studio-desktop/blob/fix/gh-123/package.json', {
    user: 'weflex',
    repo: 'studio-desktop',
    branch: 'fix/gh-123',
  });
  t.end();
});
