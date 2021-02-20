const fs = require("fs");
const DemoFile = require("demofile").DemoFile;
const Player = require("demofile").Player;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

if (!process.env.NODE_ENV) {
  process.env.BASE_PATH = './dist';
  process.env.DEM_PATH = './dist/assets';
}

const DBPATH = process.env.BASE_PATH + '/db/csgo_db';
const DEM_FILE_PATH = process.env.DEM_PATH;

console.log('starting extractor...')

function bootstrap(cb) {
  console.log('reading db: ' + DBPATH);
  const db = new sqlite3.Database(DBPATH);
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

function writeMatch(match, players) {
  if (match) {
    const db = new sqlite3.Database(DBPATH);
    console.log('writing the match');
    db.serialize(function () {
      db.run('BEGIN EXCLUSIVE TRANSACTION');
      var stmt = db.prepare("INSERT INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(match.id, match.t1.name, match.t1.score, match.t1.clan, match.t1.members, match.t1.logo, match.t1.flagImage, match.t2.name, match.t2.score, match.t2.clan, match.t2.members, match.t2.logo, match.t2.flagImage);
      stmt.finalize();

      var playerScoreStmt = db.prepare("INSERT INTO player_scores VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      players.forEach(p => {
        playerScoreStmt.run(match.id, p.clanTag, p.name, p.clanName, p.assists, p.deaths, p.headShotKills, p.killReward, p.kills, p.liveTime, p.moneySaved,
          p.objective, p.cashSpendTotal, p.mvps, p.score, p.teamName, p.teamNumber, p.threeKills, p.fourKills, p.fiveKills, p.flashedEnemies, p.steamId);
      });
      playerScoreStmt.finalize();
      db.run('COMMIT TRANSACTION;');
    });
    db.close();
  }
}

function parsedFileNameList(cb) {
  const db = new sqlite3.Database(DBPATH);
  const files = [];
  console.log('reading the matches table');
  db.serialize(function () {
    db.all("SELECT id from matches", function (err, rows) {
      if (err) {
        console.log('db error: ' + err);
        cb(err);
        return;
      }
      if (rows) {
        rows.forEach(row => {
          files.push(row.id);
        });
      }
      cb(null, files);
    });
  });
  db.close();
}

function parseDems() {
  parsedFileNameList((e, files) => {
    fs.readdirSync(DEM_FILE_PATH).forEach(file => {
      const fullFilename = path.resolve(DEM_FILE_PATH, file);
      const fileName = fullFilename.substring(fullFilename.lastIndexOf('/') + 1, fullFilename.lastIndexOf('.'));
      var stats = fs.statSync(fullFilename);

      if (files && !files.includes(fileName)) {
        if (stats.isFile()) {
          parseDemoFile(fullFilename);
        }
      }
    });
  });
}

function parseDemoFile(f) {
  const demoFile = new DemoFile();
  fs.readFile(f, (err, buffer) => {
    const playerObj = {};
    if (err) {
      console.log('read dem file err: ' + f + ', ' + err);
      return;
    }

    console.log('reading dem file: ' + f);
    demoFile.gameEvents.on("round_end", e => {
      console.log(
        "Round ended '%s' (reason: %s)",
        demoFile.gameRules.phase,
        e.reason
      );
    });

    demoFile.gameEvents.on("round_end", () => {
      demoFile.players.forEach(p => {
        playerObj[p.steamId] = p;
      });
    });

    demoFile.on("end", e => {
      const players = [];
      for (const [key, value] of Object.entries(playerObj)) {
        players.push(value);
      }

      if (e.error) {
        console.error("Error during parsing:", e.error);
        process.exitCode = 1;
      } else {
        const teams = demoFile.teams;
        const terrorists = teams[2];
        const cts = teams[3];

        const match = {
          id: f.substring(f.lastIndexOf('/') + 1, f.lastIndexOf('.')),
          t1: {
            name: terrorists.teamName,
            clan: terrorists.clanName,
            score: terrorists.score,
            members: terrorists.members.map(i => i.name),
            logo: terrorists.logoImage,
            flagImage: terrorists.flagImage
          },
          t2: {
            name: cts.teamName,
            clan: cts.clanName,
            score: cts.score,
            members: cts.members.map(i => i.name),
            logo: cts.logoImage,
            flagImage: cts.flagImage
          }
        };

        const playerScores = [];
        players
          .filter(i => !i.isFakePlayer && (i.teamNumber == 3 || i.teamNumber == 2))
          .forEach(i => {
            console.log('player: ' + i.name);
            const playerScore = {
              teamNumber: i.teamNumber,
              teamName: i.teamName,
              assists: i.assists,
              deaths: i.deaths,
              headShotKills: i.matchStats.map(a => a.headShotKills).reduce((a, b) => a + b),
              killReward: i.matchStats.map(a => a.killReward).reduce((a, b) => a + b),
              kills: i.kills,
              liveTime: i.matchStats.map(a => a.liveTime).reduce((a, b) => a + b),
              moneySaved: i.matchStats.map(a => a.moneySaved).reduce((a, b) => a + b),
              objective: i.matchStats.map(a => a.objective).reduce((a, b) => a + b),
              cashSpendTotal: i.cashSpendTotal,
              clanTag: i.clanTag,
              mvps: i.mvps,
              name: i.name,
              score: i.score,
              clanName: i.team.clanName,
              steamId: i.userInfo.xuid.toString(),
              threeKills: demoFile.entities.playerResource.m_iMatchStats_3k_Total,
              fourKills: demoFile.entities.playerResource.m_iMatchStats_4k_Total,
              fiveKills: demoFile.entities.playerResource.m_iMatchStats_5k_Total,
              flashedEnemies: demoFile.entities.playerResource.m_iMatchStats_EnemiesFlashed_Total
            }
            playerScores.push(playerScore);
          })
        writeMatch(match, playerScores);
      }
      console.log("Finished.");
    });

    demoFile.parse(buffer);
  });
}

function init() {
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
    parseDems();
  });
}

init();