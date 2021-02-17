const fs = require("fs");
const demofile = require("demofile");
const demoFile = new demofile.DemoFile();
const sqlite3 = require('sqlite3').verbose();

if (!process.env.NODE_ENV) {
  process.env.BASE_PATH = './dist';
  process.env.DEM_PATH = './dist/assets';
  process.env.DB_PATH = './dist/db';
}

const DBPATH = process.env.DB_PATH + '/csgo_db';
const DEM_FILE = process.env.DEM_PATH + '/test.dem';

console.log('starting extractor...')

function bootstrap() {
  const db = new sqlite3.Database(DBPATH);
  console.log('open db: ' + DBPATH);

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

function writeMatch(match, players) {
  if (match) {
    const db = new sqlite3.Database(DBPATH);
    db.serialize(function () {
      db.run('BEGIN EXCLUSIVE TRANSACTION');
      var stmt = db.prepare("INSERT INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(match.id, match.t1.name, match.t1.score, match.t1.clan, match.t1.members, match.t1.logo, match.t1.flagImage, match.t2.name, match.t2.score, match.t2.clan, match.t2.members, match.t2.logo, match.t2.flagImage);
      stmt.finalize();

      var playerScoreStmt = db.prepare("INSERT INTO player_scores VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      players.forEach(p => {
        playerScoreStmt.run(match.id, p.clanTag, p.name, p.clanName, p.assists, p.deaths, p.headShotKills, p.killReward, p.kills, p.liveTime, p.moneySaved, p.objective, p.cashSpendTotal, p.mvps, p.score, p.steamId);
      });
      playerScoreStmt.finalize();
      db.run('COMMIT TRANSACTION;');
    });
    db.close();
  }
}

function parseDems() {
  fs.readFile(DEM_FILE, (err, buffer) => {
    if (err) {
      console.log('read dem file err: ' + DEM_FILE + ', ' + err);
      return;
    }

    demoFile.gameEvents.on("round_end", e => {
      console.log(
        "*** Round ended '%s' (reason: %s)",
        demoFile.gameRules.phase,
        e.reason
      );
    });

    demoFile.on("end", e => {
      if (e.error) {
        console.error("Error during parsing:", e.error);
        process.exitCode = 1;
      } else {
        const teams = demoFile.teams;
        const terrorists = teams[2];
        const cts = teams[3];

        const match = {
          id: DEM_FILE.substring(DEM_FILE.lastIndexOf() + 1),
          t1: {
            name: terrorists.teamName,
            clan: terrorists.clanName,
            score: terrorists.score,
            members: terrorists.members.map(i => i.name),
            logo: terrorists.logoImage,
            flagImage: terrorists.flagImage,
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
        demoFile.players
          .filter(i => !i.isFakePlayer && (i.teamNumber == 3 || i.teamNumber == 2))
          .forEach(i => {
            const playerScore = {
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
              steamId: i.userInfo.xuid.toString()
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

  if (!fs.existsSync(process.env.DEM_PATH)) {
    fs.mkdirSync(process.env.DEM_PATH);
  }

  if (!fs.existsSync(process.env.DB_PATH)) {
    fs.mkdirSync(process.env.DB_PATH);
  }

  bootstrap();
  parseDems();
}

init();