import { map } from 'rxjs/operators';
import { Player } from './../../shared/player.model';
import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/shared/player.service';
import { RoundService } from 'src/app/shared/round.service';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  currentPlayers: Player[] = [];
  playerAlreadyClicked = false;
  currentPlayerIndex: number;
  isTimerStart = false;
  currentPlayersLength: number;
  finishedPlayers: Player[] = [];
  finishedPlayersLength = 0;

  constructor(private playerService: PlayerService, private roundService: RoundService, private db: AngularFireDatabase) {}

  ngOnInit() {
    if (this.roundService.getTime) {
      this.isTimerStart = true;
    }
    //
    this.db.list('/players').valueChanges()
    .pipe(map(
      (response) => {
        const playersArray = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            playersArray.push(response[key]);
          }
        }
        return playersArray;
      }
    ))
    .subscribe(
      (allPlayers: Player[]) => {
        // this.currentPlayers = allPlayers.filter(ply => ply.joined === true);
        this.currentPlayers = allPlayers;
      }
    );
    //
    this.currentPlayersLength = this.currentPlayers.length;
    this.playerService.playersChanged.subscribe(
      (updatedPlayers: Player[]) => {
        this.currentPlayers = updatedPlayers;
        this.currentPlayersLength = this.currentPlayers.length;
      }
    );
    this.roundService.isTimerStart.subscribe(
      (updatedTimer: boolean) => {
        this.isTimerStart = updatedTimer;
      }
    );
    this.roundService.timeIsStoped.subscribe(() => {
      this.onStopRound();
    });
  }

  // onPlayerClick(index: number) {
  //   if (this.currentPlayers[index].finish === true) {
  //     return;
  //   }
  //   this.currentPlayers[index].finish = true;
  //   this.currentPlayers[index].finishedTime = this.roundService.playerFinishedIn;
  //   const minuts: number = Math.floor(this.roundService.playerFinishedIn / 60);
  //   //
  //   const seconds: number =
  //     Math.floor(this.roundService.playerFinishedIn % 60) === 0 ?
  //     this.roundService.totalTime : Math.floor(this.roundService.playerFinishedIn % 60);
  //   //
  //   this.currentPlayers[index].minuts = minuts;
  //   this.currentPlayers[index].seconds = seconds;
  //   //
  //   // Get the numbers of finished players and compare it to the currentPlayers length
  //   this.finishedPlayers.push(this.currentPlayers[index]);
  //   this.finishedPlayersLength = this.finishedPlayers.length;
  //   //
  //   console.log(this.finishedPlayers);
  //   console.log(this.finishedPlayersLength);
  //   //
  //   this.playerService.playersChanged.next(this.currentPlayers.slice());
  // }

  onStopRound() {
    // const playersNotFinished: Player[] = this.currentPlayers.filter(ply => ply.finish === false);
    for (const player of this.currentPlayers) {
      if (player.finish === false) {
        player.finish = true;
        player.finishedTime = this.roundService.playerFinishedIn;
        player.minuts = Math.floor(this.roundService.playerFinishedIn / 60);
        player.seconds =
          Math.floor(this.roundService.playerFinishedIn % 60) === 0 ?
          this.roundService.totalTime : Math.floor(this.roundService.playerFinishedIn % 60);
      }
      // this.currentPlayers.slice();
    }
    this.playerService.playersChanged.next(this.currentPlayers.slice());
  }

}
