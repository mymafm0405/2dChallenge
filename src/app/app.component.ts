import { PlayerService } from './shared/player.service';
import { Component, OnInit } from '@angular/core';
import { RoundService } from './shared/round.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'school-app';
  isCurrentRound = false;
  showNav = false;

  constructor(private roundService: RoundService, private router: Router, private playerService: PlayerService) {}

  ngOnInit() {
    if (!this.showNav) {
      this.router.navigate(['/user']);
    }
    this.playerService.showNavChanged.subscribe(
      (showNavStatus: boolean) => {
        this.showNav = showNavStatus;
      }
    );
    //
    this.roundService.isRoundStart.subscribe(
      (roundStart: boolean) => {
        this.isCurrentRound = roundStart;
      }
    );
  }
}
