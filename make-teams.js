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
  const rv = {timestamp, lines};
  for (const line of lines) {
    if (line.startsWith('|seed|')) {
      rv.seed = line.substr(6).split(',').map(parseFloat);
      break;
    }
  }
  rv.choices = lines.filter(l => l.startsWith('|choice|'));
  return rv;
}

function makeProxy() {
  const p1 = [];
  const p2 = [];
  const rv = {p1, p2};

  let counter = 0;

  rv.send = (cmd, args) => {
    counter += 1;

    console.log(`[send ${counter}] |${[].slice.call(arguments).join('|')}`);
    if (cmd === 'request') {
      const parts = args.split('\n');
      rv[parts[0]].push(JSON.parse(parts[2]));
    }
  };

  rv.run = choice => {
    let [p1, p2] = choice.split('|').slice(-2);
    rv.battle.choose('p1', p1);
    rv.battle.choose('p2', p2);
  };
  return rv;
}

function v1(seed) {
  const Common = require('./test/common');

  global.Tools = require('./tools');
  global.Config = require('./config/config-example');
  global.BattleEngine = require('./battle-engine');
  global.toId = Tools.getId;

  let battle = Common.gen(7).createBattle();
  battle.seed = seed.slice(4, 8);
  const t1 = battle.randomTeam();

  battle.seed = seed.slice(8);
  const t2 = battle.randomTeam();

  battle = Common.gen(7).createBattle({}, [t1, t2]);
  battle.seed = seed.slice(0, 4);
  return battle;
}

function vNow(seed) {
  try {
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
  } catch (e) { }
}

let res = parse('../metagrok/data/replays-gen7randombattle/gen7randombattle-491375764.html');
let battle = v1(res.seed);
let proxy = makeProxy();
battle.send = proxy.send;
proxy.battle = battle;
for (const choice of res.choices) {
  proxy.run(choice);
}

// v1([13328,63397,56560,18078,689,63883,49006,53873,2225,31931,47591,47449]);
