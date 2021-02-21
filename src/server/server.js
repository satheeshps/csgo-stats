const fs = require("fs");
const express = require('express')
const http = require('http')
const https = require('https')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

init();

const DBPATH = process.env.BASE_PATH + '/db/csgo_db';

function bootstrap(cb) {
  const dbPath = process.env.BASE_PATH + '/db/csgo_db';
  const db = new sqlite3.Database(dbPath);
  db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS matches " +
      "(id TEXT PRIMARY KEY, tName TEXT, tScore TEXT, tClan TEXT, tMembers TEXT, tLogo TEXT, tFlagImage TEXT," +
      "ctName TEXT, ctScore TEXT, ctClan TEXT, ctMembers TEXT, ctLogo TEXT, ctFlagImage TEXT)", () => {
        db.run("CREATE TABLE IF NOT EXISTS player_scores " +
          "(match_id TEXT, clanTag TEXT, name TEXT, clanName TEXT, assists NUMBER, deaths NUMBER, headShotKills NUMBER, killReward NUMBER," +
          "kills NUMBER, liveTime NUMBER, moneySaved NUMBER, objective NUMBER, cashSpendTotal NUMBER, mvps NUMBER, score NUMBER, teamName TEXT, teamNumber NUMBER," +
          "threeKills NUMBER, fourKills NUMBER, fiveKills  NUMBER, flashedEnemies NUMBER, steamId TEXT PRIMARY KEY," +
          "FOREIGN KEY(match_id) REFERENCES matches(id))", () => {
            db.close();
            console.log('created the tables');
            cb();
          });
      });
  });
}

function init() {
  console.log('starting server...')

  if (!process.env.NODE_ENV) {
    process.env.BASE_PATH = './dist';
    process.env.DEM_PATH = './dist/assets';
  }

  if (!fs.existsSync(process.env.BASE_PATH)) {
    fs.mkdirSync(process.env.BASE_PATH);
  }

  if (!fs.existsSync(process.env.BASE_PATH)) {
    fs.mkdirSync(process.env.BASE_PATH + '/db');
  }

  if (!fs.existsSync(process.env.DEM_PATH)) {
    fs.mkdirSync(process.env.DEM_PATH);
  }

  bootstrap(() => {
    console.log('bootstrap complete');
  });
}

function readMatches(cb) {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    db.all("SELECT m.id, m.tName, m.tScore, m.tClan, m.tMembers, m.tLogo, m.tFlagImage, m.ctName, m.ctScore, m.ctClan," +
      "m.ctMembers, m.ctLogo, m.ctFlagImage, ps.teamNumber, ps.clanTag, ps.name, ps.clanName, ps.assists, ps.deaths, ps.headShotKills, " +
      "ps.killReward, ps.kills, ps.liveTime, ps.moneySaved, ps.objective, ps.cashSpendTotal, ps.mvps, ps.score, ps.steamId" +
      " FROM matches as m LEFT JOIN player_scores as ps ON m.id = ps.match_id", function (err, rows) {
        if (err) {
          console.log('db error: ' + err);
          return;
        }
        if (rows) {
          const match = {};
          rows.forEach(row => {
            if (!match[row.id]) {
              match[row.id] = {
                t1: {
                  name: row.tName, memberIds: row.tMembers, members: [], score: row.tScore, clan: row.tClan, logo: row.tLogo, flagImage: row.tFlagImage
                }, t2: {
                  name: row.ctName, memberIds: row.ctMembers, members: [], score: row.ctScore, clan: row.ctClan, logo: row.ctLogo, flagImage: row.ctFlagImage
                }
              }
            }

            const member = {
              clanTag: row.clanTag,
              name: row.name,
              clanName: row.clanName,
              assists: row.assists,
              deaths: row.assists,
              headShotKills: row.headShotKills,
              killReward: row.killReward,
              kills: row.kills,
              liveTime: row.liveTime,
              moneySaved: row.moneySaved,
              objective: row.objective,
              cashSpendTotal: row.cashSpendTotal,
              mvps: row.mvps,
              score: row.score,
              steamId: row.steamId
            }

            if (row.teamNumber === 2)
              match[row.id].t1.members.push(member);
            else
              match[row.id].t2.members.push(member);
          });

          const matches = [];
          for (const [key, value] of Object.entries(match)) {
            matches.push(value);
          }
          cb(matches);
        }
      });
  });
  console.log('closing');
  db.close();
}

function readLeaderBoard(cb) {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    const leaderboard = [];
    db.all("SELECT clanTag, name, clanName, AVG(assists) as assists, AVG(deaths) as deaths, AVG(headShotKills) as headShotKills, AVG(killReward) as killReward," +
      "AVG(kills) as kills, AVG(liveTime) as liveTime, AVG(moneySaved) as moneySaved, AVG(objective) as objective, AVG(cashSpendTotal) as cashSpendTotal," +
      "AVG(mvps) as mvps , AVG(score) as score , steamId FROM player_scores Group By steamId", function (err, rows) {
        if (err) {
          console.log('db error: ' + err);
          cb(err);
        }
        if (rows) {
          rows.forEach(row => {
            const player = {
              clanTag: row.clanTag,
              name: row.name,
              clanName: row.clanName,
              assists: row.assists,
              deaths: row.assists,
              headShotKills: row.headShotKills,
              killReward: row.killReward,
              kills: row.kills,
              liveTime: row.liveTime,
              moneySaved: row.moneySaved,
              objective: row.objective,
              cashSpendTotal: row.cashSpendTotal,
              mvps: row.mvps,
              score: row.score,
              steamId: row.steamId
            };
            leaderboard.push(player);
          });
          cb(null, leaderboard);
        }
      });
  });
  db.close();
}

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(express.static(process.env.BASE_PATH, {
  cacheControl: true, setHeaders: function (res, path) {
  }
}));

app.get('/leaderboard', function (req, res, next) {
  readLeaderBoard(function (err, leaderboard) {
    if (err)
      req.data = [];
    else
      req.data = leaderboard;
    next();
  });
}, function (req, res) {
  return res.send(req.data);
})

app.get('/matches', function (req, res, next) {
  readMatches(function (matches) {
    req.data = matches;
    next();
  });
}, function (req, res) {
  return res.send(req.data);
})

app.get('/avatar/:steamId', function (req, res, next) {
  const steamId = req.params.steamId;
  const url = 'https://steamcommunity.com/profiles/' + steamId + '/?xml=1';

  https.get(url, (res) => {
    let data = '';
    if (res.statusCode >= 200 && res.statusCode < 400) {
      res.on('data', function (data_) {
        data += data_.toString();
      });
      res.on('end', function () {
        if (data) {
          parser.parseString(data, function (err, result) {
            if (err) {
              req.data = '';
              next();
              return;
            }

            req.data = result.profile && result.profile.avatarIcon && result.profile.avatarIcon.length > 0 ? result.profile.avatarIcon[0] : '';
            next();
          });
        } else {
          req.data = '';
          next();
        }
      });
    }
  }).on("error", (err) => {
    console.log("Error: " + err.message);
    req.data = '';
    next();
  });
}, function (req, res) {
  res.writeHead(303, {'Location': req.data});
  return res.end();
})

var server = http.createServer(app)
server.listen(8080, function () {
  console.log('web server @ 8080')
})