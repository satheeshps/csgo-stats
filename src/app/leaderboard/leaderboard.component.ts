import { NumberSymbol } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

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
export class LeaderboardComponent implements OnInit, AfterViewInit {
  @Input()
  members: PlayerRank[] = [];

  @Input()
  height: string = '';

  @Input()
  elevation: boolean = false;

  @Input()
  excludes: string[] = ['objective', 'moneySaved', 'liveTime', 'cashSpendTotal', 'killReward', 'threeKills', 'fourKills', 'fiveKills', 'flashedEnemies'];

  @ViewChild(MatSort, { static: true })
  sort: MatSort = new MatSort;

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

  dataSource: MatTableDataSource<PlayerRank>;

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource(this.members);
  }

  ngAfterViewInit() {
    // this.members = [PlayerRank.empty(), PlayerRank.empty()];
    // this.dataSource = new MatTableDataSource(this.members);
    if (this.members.length === 0) {
      this.http
        .get<PlayerRank[]>('/leaderboard')
        .subscribe(
          (restItems: PlayerRank[]) => {
            this.members = restItems;
            this.dataSource = new MatTableDataSource(this.members);
            this.dataSource.sort = this.sort;
          }
        )
    } else {
      this.dataSource = new MatTableDataSource(this.members);
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.displayedColumns = this.displayedColumns.filter(i => this.excludes.indexOf(i) < 0);
  }
}
