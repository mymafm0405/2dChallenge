import { Player } from './../shared/player.model';
import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../shared/player.service';
import { Router } from '@angular/router';
import { RoundService } from '../shared/round.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit {
  answerReady = false;
  setMinuts = 0;
  start = this.setMinuts * 60;
  minuts: any = 0;
  seconds: any = 0;
  showTimerError = false;
  //
  //
  totalPlayersLength: number;
  currentPlayersFinishedLength = 0;
  timer: any;
  isRoundFinished = false;
  timeStart = false;
  finishedPlayers: Player[] = [];
  plysUserAndIdArray = [];
  currentRoundTimeId: string;
  // timerSound = new Audio();

  constructor(
    private playerService: PlayerService,
    private router: Router,
    private roundService: RoundService,
    private db: AngularFireDatabase,
    private http: HttpClient) { }

  ngOnInit() {
    console.log(this.start);
    // Get players with fire id
    const testUrl = 'https://challenge-app-test.firebaseio.com/';
    this.http.get(testUrl + 'players.json')
      .pipe(map(
        (res) => {
          const idArray = [];
          for (const key in res) {
            if (res.hasOwnProperty(key)) {
              idArray.push({ ...res[key], fireId: key });
            }
          }
          return idArray;
        }
      ))
      .subscribe(
        (idArray) => {
          this.plysUserAndIdArray = idArray;
        }
      );

    // Get the Answer ready status
    this.db.list('/answerReady').valueChanges().subscribe(
      (status: boolean[]) => {
        this.answerReady = status[0];
        if (status[0] === true) {
          // Delete old times
          this.http.delete('https://challenge-app-test.firebaseio.com/time.json')
            .subscribe(
              () => {
                // Set the total time on database
                this.http.post(
                  'https://challenge-app-test.firebaseio.com/time.json',
                  { totalTime: this.start, remainingTime: this.start })
                  .subscribe(
                    (response: { name: string }) => {
                      this.currentRoundTimeId = response.name;
                      console.log('time added to database');
                      // Start the timer
                      this.timer = setInterval(() => {
                        if (this.start === 1) {
                          this.onStopTimer();
                        }
                        this.start--;
                        // Set the total remaining time on database
                        this.http.patch(
                          'https://challenge-app-test.firebaseio.com/time/' + this.currentRoundTimeId + '.json',
                          { remainingTime: this.start })
                          .subscribe(
                            () => {
                              console.log('remainingTime added to database');
                            }
                          );
                        //
                        console.log(this.start);
                        // this.minuts = Math.floor(this.start / 60);
                        // this.seconds = Math.floor(this.start % 60);
                        this.minuts = Math.floor(this.start / 60) < 10 ? '0' + Math.floor(this.start / 60) : Math.floor(this.start / 60);
                        this.seconds = Math.floor(this.start % 60) < 10 ? '0' + Math.floor(this.start % 60) : Math.floor(this.start % 60);
                      }, 1000);
                    }
                  );
                //
              }
            );
        } else if (status[0] === false) {
          if (this.timer) {
            clearInterval(this.timer);
          }
        }
      }
    );
  }
  onChange() {
    this.start = this.setMinuts * 60;
  }
  onStartTimer() {
    this.start = this.setMinuts * 60;
    this.roundService.onPlayTimerSound();
    this.roundService.onPauseWinnerSound();
    // const x: HTMLElement = document.getElementById('myAudio');
    // x.onplay()
    // this.timerSound.src = '../../assets/sounds/timer.mp3';
    // this.timerSound.load();
    // this.timerSound.play();
    //
    this.http.delete('https://challenge-app-test.firebaseio.com/answers.json')
      .subscribe(
        () => {
          console.log('All answers deleted!');
          for (const p of this.plysUserAndIdArray) {
            this.http.patch('https://challenge-app-test.firebaseio.com/players/' + p.fireId + '.json', {
              finish: false,
              winner: false,
              joined: false
            })
              .subscribe(
                () => {
                  console.log('All players finish status now is false');
                  this.http.patch('https://challenge-app-test.firebaseio.com/answerReady.json', {
                    answerReady: true
                  })
                    .subscribe(
                      () => {
                        console.log('Timer has started and answer is ready');
                      }
                    );
                }
              );
          }
          //
        }
      );
    for (const p of this.plysUserAndIdArray) {
      this.http.patch('https://challenge-app-test.firebaseio.com/players/' + p.fireId + '.json', {
        winner: false,
        finish: false
      }).subscribe(
        () => {
          console.log('Winner and Finish Status has been reset');
        }
      );
    }
  }
  onStopTimer() {
    this.roundService.onPauseTimerSound();
    this.roundService.onPauseWinnerSound();
    this.http.patch('https://challenge-app-test.firebaseio.com/answerReady.json', {
      answerReady: false
    }).subscribe(
      () => {
        console.log('Timer has stopped and answer is not ready!!');
      }
    );
  }
}
