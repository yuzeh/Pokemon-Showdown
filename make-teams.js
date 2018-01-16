/* eslint-disable validate-conditionals */
'use strict';

/* eslint-disable indent */

const fs = require('fs');

const cheerio = require('cheerio');

function parse(fname) {
  const data = fs.readFileSync(fname);
  const $ = cheerio.load(data);
  const logData = $('script.log').get()[0].children[0].data;
  const timestamp = $('small.uploaddate').data('timestamp');
  const lines = logData.split(/\r?\n/);
  const rv = {timestamp};
  for (const line of lines) {
    if (line.startsWith('|seed|')) {
      rv.seed = line.substr(6).split(',').map(parseFloat);
      break;
    }
  }
  return rv;
}

function v1(seed) {
  const Common = require('./test/common');

  global.Tools = require('./tools');
  global.Config = require('./config/config-example');
  global.BattleEngine = require('./battle-engine');
  global.toId = Tools.getId;

  const battle = Common.gen(7).createBattle();
  battle.seed = seed.slice(4, 8);
  const t1 = battle.randomTeam();

  battle.seed = seed.slice(8);
  const t2 = battle.randomTeam();
  return {t1, t2};
}

function vNow(seed) {
  const Common = require('./test/common');
  const Dex = require('./sim/dex');
  const PRNG = require('./sim/prng');

  global.Config = require('./config/config-example');
  global.toId = Dex.getId;

  const generator = Dex.getTeamGenerator(`gen7randombattle`);
  generator.seed = new PRNG(seed.slice(4, 8));
  const t1 = generator.generateTeam();

  generator.seed = new PRNG(seed.slice(8));
  const t2 = generator.generateTeam();
  return {t1, t2};
}

let res = parse('../metagrok/data/replays-gen7randombattle/gen7randombattle-491375764.html');
console.log(vNow(res.seed));

// v1([13328,63397,56560,18078,689,63883,49006,53873,2225,31931,47591,47449]);
