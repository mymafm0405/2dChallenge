import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Player } from './player.model';

@Injectable({ providedIn: 'root' })
export class RoundService {
    getTime = false;
    isRoundRunning = false;
    isTimeStarted = false;
    isRoundStart = new Subject<boolean>();
    playersFinishedChanged = new Subject<Player>();
    isTimerStart = new Subject<boolean>();
    timeIsStoped = new Subject<boolean>();
    answersArrayChanged = new Subject<any>();
    playersFinished: Player[] = [];
    currentTime: number;
    totalTime: number;
    playerFinishedIn: number;
    time: any;
    answersArray: { quesId: number, ansId: number, plyId: number, correctId: number }[];
    minuts: number;
    seconds: number;
    timerSound = new Audio();
    winnerSound = new Audio();

    onPlayTimerSound() {
        this.timerSound.src = '../../assets/sounds/timer.mp3';
        this.timerSound.load();
        this.timerSound.play();
        this.timerSound.loop = true;
        // setTimeout(() => {
        //   this.timerSound.pause();
        // }, 20000);
        // this.timerSound.autoplay = true;
    }
    onPauseTimerSound() {
        this.timerSound.src = '../../assets/sounds/timer.mp3';
        this.timerSound.load();
        this.timerSound.pause();
    }

    onPlayerWinnerSound() {
        this.winnerSound.src = '../../assets/sounds/winner.mp3';
        this.winnerSound.load();
        this.winnerSound.play();
        setTimeout(() => {
          this.winnerSound.pause();
        }, 15000)
    }

    onPauseWinnerSound() {
        this.winnerSound.src = '../../assets/sounds/winner.mp3';
        this.winnerSound.load();
        this.winnerSound.pause();
    }

    onTimerStart(totalTime: number, remainingTime: number) {
        this.totalTime = totalTime;
        this.time = setInterval(() => {
            remainingTime--;
            this.currentTime = remainingTime;
            this.playerFinishedIn = totalTime - this.currentTime;
            this.minuts = Math.floor(this.totalTime / 60);
            this.seconds = Math.floor(this.totalTime % 60);
        }, 1000);
        this.isTimeStarted = true;
        // console.log(this.playerFinishedIn);
    }

    onTimerStop() {
        this.timeIsStoped.next(true);
    }
}
