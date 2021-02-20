import { NumberSymbol } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

export class PlayerRank {
  clanTag: string;
  name: string;
  clanName: string;
  assists: number;
  deaths: number;
  headShotKills: number;
  killReward: number;
  kills: number;
  liveTime: number;
  moneySaved: number;
  objective: number;
  cashSpendTotal: number;
  mvps: number;
  score: number;
  teamName: string;
  teamNumber: number;
  threeKills: number;
  fourKills: number;
  fiveKills: number;
  flashedEnemies: number;
  steamId: string;

  constructor(assists: number, damage: number, deaths: number,
    headShotKills: number,
    killReward: number,
    kills: number,
    liveTime: number,
    moneySaved: number,
    objective: number,
    cashSpendTotal: number,
    clanTag: string,
    mvps: number,
    score: number,
    clanName: string,
    steamId: string,
    name: string,
    teamName: string,
    teamNumber: number,
    threeKills: number,
    fourKills: number,
    fiveKills: number,
    flashedEnemies: number) {
    this.name = name;
    this.score = score;
    this.assists = assists;
    this.deaths = deaths;
    this.headShotKills = headShotKills;
    this.killReward = killReward;
    this.kills = kills;
    this.liveTime = liveTime;
    this.moneySaved = moneySaved;
    this.objective = objective;
    this.cashSpendTotal = cashSpendTotal;
    this.clanTag = clanTag;
    this.mvps = mvps;
    this.clanName = clanName;
    this.steamId = steamId;
    this.teamName = teamName;
    this.teamNumber = teamNumber;
    this.threeKills = threeKills;
    this.fourKills = fourKills;
    this.fiveKills = fiveKills;
    this.flashedEnemies = flashedEnemies;
  }

  static empty(): PlayerRank {
    return new PlayerRank(0, 0, 0, 0, 0, 0,
      0,
      0,
      0,
      0,
      'devillz',
      0,
      0,
      'devillz',
      '13123',
      'name',
      'ct',
      3,
      0, 0, 0, 0);
  }
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  @Input()
  members: PlayerRank[] = [];

  @Input()
  excludes: string[] = ['objective', 'moneySaved', 'liveTime', 'cashSpendTotal', 'killReward', 'threeKills', 'fourKills', 'fiveKills', 'flashedEnemies'];

  displayedColumns: string[] = ['name',
    'assists',
    'deaths',
    'headShotKills',
    'killReward',
    'kills',
    'liveTime',
    'moneySaved',
    'objective',
    'cashSpendTotal',
    'mvps',
    'score',
    'threeKills',
    'fourKills',
    'fiveKills',
    'flashedEnemies'];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.displayedColumns = this.displayedColumns.filter(i => this.excludes.indexOf(i) < 0);
    if (this.members.length == 0) {
      // this.members = [PlayerRank.empty(), PlayerRank.empty()];
      this.http
        .get<PlayerRank[]>('/leaderboard')
        .subscribe(
          (restItems: PlayerRank[]) => {
            this.members = restItems;
          }
        )
    }
  }
}
