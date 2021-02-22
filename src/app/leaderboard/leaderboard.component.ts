import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { map } from 'rxjs/operators';

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

  constructor() {
    this.name = '';
    this.score = 0;
    this.assists = 0;
    this.deaths = 0;
    this.headShotKills = 0;
    this.killReward = 0;
    this.kills = 0;
    this.liveTime = 0;
    this.moneySaved = 0;
    this.objective = 0;
    this.cashSpendTotal = 0;
    this.clanTag = '';
    this.mvps = 0;
    this.clanName = '';
    this.steamId = '';
    this.teamName = '';
    this.teamNumber = 0;
    this.threeKills = 0;
    this.fourKills = 0;
    this.fiveKills = 0;
    this.flashedEnemies = 0;
  }

  static typify(playerRank: PlayerRank) {
    playerRank.score = playerRank.score ? Number.parseInt(playerRank.score.toString()) : playerRank.score;
    playerRank.assists = playerRank.assists ? Number.parseInt(playerRank.assists.toString()) : playerRank.assists;
    playerRank.deaths = playerRank.deaths ? Number.parseInt(playerRank.deaths.toString()) : playerRank.deaths;
    playerRank.headShotKills = playerRank.headShotKills ? Number.parseInt(playerRank.headShotKills.toString()) : playerRank.headShotKills;
    playerRank.killReward = playerRank.killReward ? Number.parseInt(playerRank.killReward.toString()) : playerRank.killReward;
    playerRank.kills = playerRank.kills ? Number.parseInt(playerRank.kills.toString()) : playerRank.kills;
    playerRank.liveTime = playerRank.liveTime ? Number.parseInt(playerRank.liveTime.toString()) : playerRank.liveTime;
    playerRank.moneySaved = playerRank.moneySaved ? Number.parseInt(playerRank.moneySaved.toString()) : playerRank.moneySaved;
    playerRank.objective = playerRank.objective? Number.parseInt(playerRank.objective.toString()) : playerRank.objective;
    playerRank.cashSpendTotal = playerRank.cashSpendTotal ? Number.parseInt(playerRank.cashSpendTotal.toString()) : playerRank.cashSpendTotal;
    playerRank.mvps = playerRank.mvps ? Number.parseInt(playerRank.mvps.toString()) : playerRank.mvps;
    playerRank.teamNumber = playerRank.teamNumber ? Number.parseInt(playerRank.teamNumber.toString()) : playerRank.teamNumber;
    playerRank.threeKills = playerRank.threeKills ? Number.parseInt(playerRank.threeKills.toString()) : playerRank.threeKills;
    playerRank.fourKills = playerRank.fourKills ? Number.parseInt(playerRank.fourKills.toString()) : playerRank.fourKills;
    playerRank.fiveKills = playerRank.fiveKills ? Number.parseInt(playerRank.fiveKills.toString()) : playerRank.fiveKills;
    playerRank.flashedEnemies = playerRank.flashedEnemies ? Number.parseInt(playerRank.flashedEnemies.toString()) : playerRank.flashedEnemies;
  }

  fill(assists: number, damage: number, deaths: number,
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
    return this;
  }

  static empty(): PlayerRank {
    return new PlayerRank().fill(0, 0, 0, 0, 0, 0,
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
        // .pipe(map(a => a.map(e => Object.assign(new PlayerRank(), e))))
        .subscribe(
          (restItems: PlayerRank[]) => {
            restItems.forEach(p => PlayerRank.typify(p));
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
