'use strict';

const tap = require('tap');
const getMasksFromCommentBody = require('../lib/utils').getMasksFromCommentBody;
const getPrMsgFormUrl = require('../lib/utils').getPrMsgFormUrl;
const getBranchMsgFormHtmlUrl = require('../lib/utils').getBranchMsgFormHtmlUrl;

tap.equal(getMasksFromCommentBody('@seanbot bump'), null);
tap.same(getMasksFromCommentBody('@seanbot bump major'), [1, 0, 0]);
tap.same(getMasksFromCommentBody('@seanbot bump minor'), [0, 1, 0]);
tap.same(getMasksFromCommentBody('@seanbot bump patch'), [0, 0, 1]);

tap.same(getPrMsgFormUrl('https://api.github.com/repos/weflex/seanbot/pulls/1'), {
  user: 'weflex',
  repo: 'seanbot',
  number: '1',
});

tap.same(getBranchMsgFormHtmlUrl('https://github.com/weflex/seanbot/blob/master/package.json'), {
  user: 'weflex',
  repo: 'seanbot',
  branch: 'master',
});
