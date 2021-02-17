const fs = require("fs");
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const app = express();
const sqlite3 = require('sqlite3').verbose();

init();

const DBPATH = process.env.DB_PATH + '/csgo_db';

function bootstrap() {
  const dbPath = process.env.DB_PATH + '/csgo_db';
  const db = new sqlite3.Database(dbPath);
  db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS matches " +
      "(id TEXT PRIMARY KEY, tName TEXT, tScore TEXT, tClan TEXT, tMembers TEXT, tLogo TEXT, tFlagImage TEXT," +
      "ctName TEXT, ctScore TEXT, ctClan TEXT, ctMembers TEXT, ctLogo TEXT, ctFlagImage TEXT)");

    db.run("CREATE TABLE IF NOT EXISTS player_scores " +
      "(match_id TEXT, clanTag TEXT, name TEXT, clanName TEXT, assists NUMBER, deaths NUMBER, headShotKills NUMBER, killReward NUMBER," +
      "kills NUMBER, liveTime NUMBER, moneySaved NUMBER, objective NUMBER, cashSpendTotal NUMBER, mvps NUMBER, score NUMBER, steamId TEXT PRIMARY KEY," +
      "FOREIGN KEY(match_id) REFERENCES matches(id))");
  });
  db.close();
}

function init() {
  console.log('starting server...')

  if (!process.env.NODE_ENV) {
    process.env.BASE_PATH = './dist';
    process.env.DEM_PATH = './dist/assets';
    process.env.DB_PATH = './dist/db';
  }

  if (!fs.existsSync(process.env.BASE_PATH)) {
    fs.mkdirSync(process.env.BASE_PATH);
  }

  if (!fs.existsSync(process.env.DEM_PATH)) {
    fs.mkdirSync(process.env.DEM_PATH);
  }

  if (!fs.existsSync(process.env.DB_PATH)) {
    fs.mkdirSync(process.env.DB_PATH);
  }

  bootstrap();
}

function readMatches(cb) {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    const matches = [];
    db.all("SELECT m.id, m.tName, m.tScore, m.tClan, m.tMembers, m.tLogo, m.tFlagImage, m.ctName, m.ctScore, m.ctClan," +
      "m.ctMembers, m.ctLogo, m.ctFlagImage, ps.clanTag, ps.name, ps.clanName, ps.assists, ps.deaths, ps.headShotKills, " +
      "ps.killReward, ps.kills, ps.liveTime, ps.moneySaved, ps.objective, ps.cashSpendTotal, ps.mvps, ps.score, ps.steamId" +
      " FROM matches as m, player_scores as ps WHERE m.id = ps.match_id", function (err, rows) {
        if (err) {
          console.log('db error: ' + err);
          return;
        }
        if (rows) {
          var match;
          rows.forEach(row => {
            if (matches.indexOf(match) < 0) {
              match = {
                t1: {
                  name: row.tName, score: row.tScore, clan: row.tClan, logo: row.tLogo, flagImage: row.tFlagImage
                }, t2: {
                  name: row.ctName, score: row.ctScore, clan: row.ctClan, logo: row.ctLogo, flagImage: row.ctFlagImage
                }
              }
              match.t1.members = [];
              match.t2.members = [];

              matches.push(match);
            }
            var team = match.clanName == match.tClan ? match.t1 : match.t2;
            team.members.push({
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
            });
          });
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

var server = http.createServer(app)
server.listen(8080, function () {
  console.log('web server @ 8080')
})