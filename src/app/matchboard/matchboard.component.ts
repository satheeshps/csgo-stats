import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerRank } from '../leaderboard/leaderboard.component';

export class Team {
  name: string;
  score: number;
  clan: string;
  members: PlayerRank[];
  logo: string;
  flagImage: string;

  constructor(name: string, score: number, clan: string, members: PlayerRank[], logo: string, flagImage: string) {
    this.name = name;
    this.score = score;
    this.clan = clan;
    this.members = members;
    this.logo = logo;
    this.flagImage = flagImage;
  }

  static empty(): Team {
    return new Team('ct', 10, 'devillz', [], 'SDS', 'IN');
  }
}

export class Match {
  t1: Team = Team.empty();
  t2: Team = Team.empty();

  static empty(): Match {
    return new Match();
  }
}

@Component({
  selector: 'app-matchboard',
  templateUrl: './matchboard.component.html',
  styleUrls: ['./matchboard.component.css']
})
export class MatchboardComponent implements OnInit {
  displayedColumns: string[] = ['members'];
  matches: Match[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http
      .get<Match[]>('/matches')
      .subscribe(
        (restItems: Match[]) => {
          this.matches = restItems;
        }
      )
  }

}
