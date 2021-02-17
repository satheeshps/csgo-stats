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
    name: string) {
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

  displayedColumns: string[] = ['clanTag',
    'name',
    'assists',
    'deaths', 
    'headShotKills', 
    'killReward', 
    'kills', 
    'liveTime', 
    'moneySaved', 
    'objective'];
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if(this.members.length == 0) {
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
