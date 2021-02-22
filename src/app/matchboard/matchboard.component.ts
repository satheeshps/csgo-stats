import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerRank } from '../leaderboard/leaderboard.component';
import { map } from 'rxjs/operators';

export class Team {
  name: string;
  score: number;
  clan: string;
  members: PlayerRank[] = [];
  logo: string;
  flagImage: string;
  teamName: string;

  constructor() {
    this.name = '';
    this.score = 0;
    this.clan = '';
    this.members = [];
    this.logo = '';
    this.flagImage = '';
    this.teamName = '';
  }

  fill(name: string, score: number, clan: string, members: PlayerRank[], logo: string, flagImage: string, teamName: string) {
    this.name = name;
    this.score = score;
    this.clan = clan;
    this.members = members;
    this.logo = logo;
    this.flagImage = flagImage;
    this.teamName = teamName;
    return this;
  }

  static empty(): Team {
    return new Team().fill('ct', 10, 'counter terrorists', [], 'SDS', 'IN', 'CT');
  }

  static typify(team: Team) {
    team.score = team.score ? Number.parseInt(team.score.toString()) : team.score;
    team.members.forEach(m => PlayerRank.typify(m));
  }
}

export class Match {
  t1: Team = new Team;
  t2: Team = new Team;

  static empty(): Match {
    return new Match();
  }

  static typify(match: Match) {
    Team.typify(match.t1);
    Team.typify(match.t2);
  }
}

@Component({
  selector: 'app-matchboard',
  templateUrl: './matchboard.component.html',
  styleUrls: ['./matchboard.component.css']
})
export class MatchboardComponent implements AfterViewInit {
  displayedColumns: string[] = ['members'];
  matches: Match[] = [];

  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    // this.matches = [Match.empty(), Match.empty()];
    this.http
      .get<Match[]>('/matches')
      .pipe(map(a => a.map(e => Object.assign(new Match(), e))))
      .subscribe(
        (restItems: Match[]) => {
          restItems.forEach(r => Match.typify(r));
          this.matches = restItems;
        }
      )
  }
}
