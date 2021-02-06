import { QuestionsService } from './../shared/questions.service';
import { Component, OnInit } from '@angular/core';
import { RoundService } from '../shared/round.service';
import { Router } from '@angular/router';
import { Question } from '../shared/question.model';
import { Player } from '../shared/player.model';
import { PlayerService } from '../shared/player.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {
  roundStatus: boolean;
  allQues = [];
  plysUserAndIdArray = [];
  introSound = true;
  actionAudio = new Audio();

  constructor(
    private roundService: RoundService,
    private playerService: PlayerService,
    private router: Router,
    private questionsService: QuestionsService,
    private http: HttpClient) { }

  ngOnInit() {
    //
    if (this.introSound) {
      this.actionAudio.src = '../../assets/sounds/action-start.mp3';
      this.actionAudio.load();
      this.actionAudio.play();
    }
    setTimeout(
      () => {
        this.introSound = false;
      }, 22000
    );
    this.http.get('https://challenge-app-c9782.firebaseio.com/players.json')
    .pipe(map(
      (res) => {
        const idArray = [];
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            idArray.push({...res[key], fireId: key});
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
    //
    ///
    this.http.get('https://challenge-app-c9782.firebaseio.com/questions.json')
    .pipe(map(
      (res) => {
        const quesWithFireId = [];
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            quesWithFireId.push({...res[key], fireId: key});
          }
        }
        return quesWithFireId;
      }
    ))
    .subscribe(
      (resQues) => {
        this.allQues = resQues;
      }
    );
    ///
    // this.roundService.isRoundStart.subscribe(
    //   (roundStart: boolean) => {
    //     this.roundStatus = roundStart;
    //     if (this.roundStatus === false) {
    //       this.router.navigate(['/']);
    //     }
    //   }
    // );
    // if (!this.roundService.isRoundRunning) {
    //   this.router.navigate(['/']);
    // }
  }

  onNewRound() {
    //
    //
    this.http.delete('https://challenge-app-c9782.firebaseio.com/answers.json').subscribe(
      () => {
        console.log('answers deleted!');
      }
    );
    //
    for (const p of this.plysUserAndIdArray) {
      this.http.patch('https://challenge-app-c9782.firebaseio.com/players/' + p.fireId + '.json', {
        finish: false
      }).subscribe(
        () => {
          console.log('player finished reset!');
        }
      );
    }
    //
    this.http.patch('https://challenge-app-c9782.firebaseio.com/answerReady.json', {
      answerReady: false
    }).subscribe(
      () => {
        console.log('time started live');
      }, () => {
        console.log('time not started live');
      }
    );
    //
    for (const q of this.allQues) {
      const fireId = q.fireId;
      this.http.patch('https://challenge-app-c9782.firebaseio.com/questions/' + fireId + '.json', {
        selected: false
      }).subscribe(
        () => {
          console.log('all questions are Deselected success!');
        }, () => {
          console.log('Error Questions Deselected!');
        }
      );
    }
    //
    this.roundService.getTime = false;
    const finishedPlayers: Player[] = [];
    for (const ply of this.playerService.players) {
      ply.finish = false;
      ply.finishedTime = 0;
      ply.winner = false;
      finishedPlayers.push(ply);
    }
    this.playerService.playersChanged.next(finishedPlayers);
    //
    this.roundService.isRoundStart.next(false);
    this.roundService.isRoundRunning = false;
    const updatedQuestions: Question[] = [];
    for (const ques of this.questionsService.questions) {
      ques.selected = false;
      ques.answered = false;
      ques.correct = false;
      updatedQuestions.push(ques);
    }
    this.questionsService.questionsInRound = [];
    this.roundService.isTimeStarted = false;
    this.questionsService.questionsChanged.next(updatedQuestions);
    this.router.navigate(['/questions']);
    clearInterval(this.roundService.time);
  }

  onSkipIntro() {
    this.introSound = false;
    this.actionAudio.pause();
  }

}
