import { Answer } from './../shared/answer.model';
import { Player } from './../shared/player.model';
import { QuestionsService } from './../shared/questions.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoundService } from '../shared/round.service';
import { PlayerService } from '../shared/player.service';
import { Question } from '../shared/question.model';
import { HttpClient } from '@angular/common/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-round-status',
  templateUrl: './round-status.component.html',
  styleUrls: ['./round-status.component.css']
})
export class RoundStatusComponent implements OnInit, OnDestroy {
  currentPlayersFinished: Player[] = [];
  // finishedTime = 0;
  winnerPlayer: Player;
  theWinner: { plyId: number, numOfRightAnswers: number, finishedTime: number };
  // answersArray: {quesId: number, ansId: number, plyId: number, correctId: number}[] = [];
  answersArray: any[] = [];
  // timeFinishedArray = [];
  numOfRightAnswers = 0;
  finalResultsArray: { playerId: number, numOfRightAnswers: number, finishedTime: number }[] = [];
  currentQuestionsInRound: Question[];
  currentPlayersFinishedLength: number;
  currentPlayersJoinedLength: number;
  currentPlayersJoined: Player[];
  plysUserAndIdArray: any[] = [];
  maxRightAnswerArray: number[] = [];
  winnerPlayerId: number;
  fastestArray: number[] = [];
  allPlayers: Player[];
  answerReady = false;
  onOffSound = new Audio();
  noWinnerDetected = false;
  // winnerSound = new Audio();

  constructor(
    private roundService: RoundService,
    private playerService: PlayerService,
    private questionsService: QuestionsService,
    private http: HttpClient,
    private db: AngularFireDatabase) { }

  ngOnInit() {
    // Get answer ready status
    this.db.list('/answerReady').valueChanges().subscribe(
      (status: boolean[]) => {
        console.log('Coming from answer ready');
        this.answerReady = status[0];
        console.log(this.answerReady);
        if (this.answerReady === true) {
          this.winnerPlayerId = null;
        } else if (this.answerReady === false && this.currentPlayersFinishedLength >= 0) {
          console.log('hello from here 3');
          this.endRound();
        }
      }
    );
    //
    // Get ans save player with fireId
    const realUrlPlayers = 'https://challenge-app-c9782.firebaseio.com/';
    const testUrlPlayers = 'https://challenge-app-test.firebaseio.com/';
    this.http.get(testUrlPlayers + 'players.json')
      .pipe(map(
        (res) => {
          const players = [];
          for (const key in res) {
            if (res.hasOwnProperty(key)) {
              this.plysUserAndIdArray.push({ ...res[key], fireId: key });
              players.push(res[key]);
            }
          }
          return players;
        }
      ))
      .subscribe(
        (players: Player[]) => {
          this.allPlayers = players;
          // this.currentPlayersFinished = this.allPlayers.filter(pl => pl.finish === true);
          // console.log(this.currentPlayersFinished);
          this.currentPlayersJoined = this.allPlayers.filter(pl => pl.joined === true);
          this.currentPlayersJoinedLength = this.allPlayers.filter(pl => pl.joined === true).length;
        }
      );
    //
    //
    // Current Finished Players
    this.db.list('/players').valueChanges()
      .subscribe(
        (res: Player[]) => {
          this.allPlayers = res;
          this.currentPlayersFinished = res.filter(pl => pl.finish === true);
          this.currentPlayersFinishedLength = res.filter(pl => pl.finish === true).length;
          this.currentPlayersJoined = res.filter(pl => pl.joined === true);
          this.currentPlayersJoinedLength = res.filter(pl => pl.joined === true).length;
          if (this.currentPlayersJoinedLength > 0) {
            this.onOffSound.src = '../../assets/sounds/on-off.mp3';
            this.onOffSound.load();
            this.onOffSound.play();
          }
          console.log(this.currentPlayersFinished);
          console.log(this.currentPlayersFinishedLength);
          console.log(this.currentPlayersJoined);
          console.log(this.currentPlayersJoinedLength);
          if (this.currentPlayersFinishedLength > 0) {
            console.log(this.answerReady);
            console.log('hello from here 1');
            if (this.currentPlayersFinishedLength === this.currentPlayersJoinedLength && !this.answerReady) {
              //
              // Round should finish now
              console.log('hello from here 4');
              console.log(this.currentPlayersJoined);
              // this.roundService.timeIsStoped.next(true);
              this.endRound();
              //
            }
          } else if (this.currentPlayersFinishedLength > 0 && !this.answerReady) {
            console.log('hello from here 2');
            this.endRound();
          }
        }
      );
    //
    // Get Current Questions in round
    this.db.list('/questions').valueChanges().subscribe(
      (resQues: Question[]) => {
        this.currentQuestionsInRound = resQues.filter(q => q.selected === true);
      }
    );
    //
    // Get all answers
    this.db.list('/answers').valueChanges().subscribe(
      (resAns) => {
        this.answersArray = resAns;
      }
    );
  }

  endRound() {
    // What happened when time stopped
    console.log(this.currentPlayersJoined);
    //
    for (const pl of this.currentPlayersJoined) {
      let numOfAnswersForThisPlayer = 0;
      let numOfRightAnswersForPlayer = 0;
      for (const ans of this.answersArray) {
        if (pl.id === ans.plyId) {
          numOfAnswersForThisPlayer++;
          if (ans.ansId === ans.correctId) {
            numOfRightAnswersForPlayer++;
          }
        }
      }
      if (numOfAnswersForThisPlayer > 0) {
        this.finalResultsArray.push({
          playerId: pl.id,
          numOfRightAnswers: numOfRightAnswersForPlayer,
          finishedTime: pl.finishedTime
        });
      }
      console.log(pl.id);
      console.log(numOfRightAnswersForPlayer);
      console.log(pl.finishedTime);
    }
    console.log(this.finalResultsArray);
    // Check that at least we have one player at the final or return
    if (this.finalResultsArray.length === 0) {
      console.log('No answers found for all joined players in the round!');
      this.noWinnerDetected = true;
      return;
    }
    //
    // Now we compare th final result array to the winner player
    for (const pl of this.currentPlayersJoined) {
      for (const p of this.finalResultsArray) {
        if (pl.id === p.playerId) {
          this.maxRightAnswerArray.push(p.numOfRightAnswers);
        }
      }
    }
    console.log(this.maxRightAnswerArray);
    const maxRightNumber = Math.max(...this.maxRightAnswerArray);
    console.log(maxRightNumber);
    const finalArray = this.finalResultsArray.filter(p => p.numOfRightAnswers === maxRightNumber);
    console.log(finalArray);
    console.log(finalArray.length);
    if (maxRightNumber > 0) {
      if (finalArray.length === 1) {
        this.winnerPlayerId = finalArray[0].playerId;
        console.log('One player in final');
        console.log(this.winnerPlayerId);
      } else if (finalArray.length > 1) {
        console.log('More than one player in final');
        for (const p of finalArray) {
          this.fastestArray.push(p.finishedTime);
        }
        console.log(this.fastestArray);
        const fastTime = Math.min(...this.fastestArray);
        console.log(fastTime);
        this.winnerPlayerId = finalArray.find(p => p.finishedTime === fastTime).playerId;
        console.log(this.winnerPlayerId);
      }
    } else if (maxRightNumber === 0) {
      this.noWinnerDetected = true;
      return;
    }
    // 1- Now we should stop the timer
    // 2- answer ready should be false now
    // 3-
    this.http.patch('https://challenge-app-test.firebaseio.com/answerReady.json', {
      answerReady: false
    }).subscribe(
      () => {
        console.log('answerReady now false');
      }
    );
    // Update the player winner status
    console.log(this.winnerPlayerId);
    if (this.winnerPlayerId) {
      const fireBaseId = this.plysUserAndIdArray.find(pl => pl.id === this.winnerPlayerId).fireId;
      console.log(fireBaseId);
      this.http.patch('https://challenge-app-test.firebaseio.com/players/' + fireBaseId + '.json', {
        winner: true
      }).subscribe(
        () => {
          console.log('winner detected!');
          this.roundService.onPauseTimerSound();
          this.roundService.onPlayerWinnerSound();
          this.finalResultsArray = [];
          this.maxRightAnswerArray = [];
          this.fastestArray = [];
          this.numOfRightAnswers = 0;
        }
      );
    } else {
      console.log('No Winners because all players are have wrong answers');
      this.roundService.onPauseTimerSound();
      this.finalResultsArray = [];
      this.maxRightAnswerArray = [];
      this.fastestArray = [];
      this.numOfRightAnswers = 0;
    }
  }

  ngOnDestroy() {
    this.roundService.onPauseWinnerSound();
    this.winnerPlayerId = null;
    this.winnerPlayer = null;
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
}
