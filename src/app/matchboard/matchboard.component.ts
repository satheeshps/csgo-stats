import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerRank } from '../leaderboard/leaderboard.component';

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
}

export class Match {
  t1: Team = new Team;
  t2: Team = new Team;

  static empty(): Match {
    return new Match();
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
      .subscribe(
        (restItems: Match[]) => {
          this.matches = restItems;
        }
      )
  }
}
