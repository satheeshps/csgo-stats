const fs = require("fs");
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morgan = require('morgan');
const app = express();
const sqlite3 = require('sqlite3').verbose();

if (!process.env.NODE_ENV) {
  process.env.BASE_PATH = './dist';
  process.env.DEM_PATH = './dist/assets';
  process.env.DB_PATH = './dist';
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

const DBPATH = process.env.DB_PATH + '/csgo_db';

console.log('starting server...')

function bootstrap() {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS matches (id TEXT PRIMARY KEY, tName TEXT, tScore TEXT, tClan TEXT, tMembers TEXT, tLogo TEXT, tFlagImage TEXT, ctName TEXT, ctScore TEXT, ctClan TEXT, ctMembers TEXT, ctLogo TEXT, ctFlagImage TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS leaderboard (clanTag TEXT, name TEXT, clanName TEXT, assists NUMBER, deaths NUMBER, headShotKills NUMBER, killReward NUMBER, kills NUMBER, liveTime NUMBER, moneySaved NUMBER, objective NUMBER, cashSpendTotal NUMBER, mvps NUMBER, score NUMBER, steamId TEXT PRIMARY KEY)");
  });
  db.close();
}

bootstrap();

function readMatches(cb) {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    const matches = [];
    db.all("SELECT rowid AS id, tName, tScore, tClan, tMembers, tLogo, tFlagImage, ctName, ctScore, ctClan, ctMembers, ctLogo, ctFlagImage FROM matches", function (err, rows) {
      if (err) {
        console.log('db error: ' + err);
        return;
      }
      if (rows) {
        rows.forEach(row => {
          const match = {
            t1: {
              name: row.tName, score: row.tScore, clan: row.tClan, members: row.tMembers.split(','), logo: row.tLogo, flagImage: row.tFlagImage
            }, t2: {
              name: row.ctName, score: row.ctScore, clan: row.ctClan, members: row.ctMembers.split(','), logo: row.ctLogo, flagImage: row.ctFlagImage
            }
          };
          matches.push(match);
        });
        cb(matches);
      }
    });
  });
  db.close();
}

function readLeaderBoard(cb) {
  const db = new sqlite3.Database(DBPATH);
  db.serialize(function () {
    const leaderboard = [];
    db.all("SELECT clanTag, name, clanName, assists, deaths, headShotKills, killReward, kills, liveTime, moneySaved, objective, cashSpendTotal , mvps , score , steamId FROM leaderboard", function (err, rows) {
      if (err) {
        console.log('db error: ' + err);
        return;
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
        cb(leaderboard);
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
  readLeaderBoard(function (leaderboard) {
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
  console.log('initiating web server @ 8080')
})