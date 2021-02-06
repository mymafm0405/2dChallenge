import { QuestionsService } from './../shared/questions.service';
import { Component, OnInit } from '@angular/core';
import { RoundService } from '../shared/round.service';
import { Question } from '../shared/question.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  numOfSelected = 0;
  isRound = false;
  selectedQuestions: Question[] = [];
  quesIdFire = [];
  showFolderForm = false;

  constructor(
    private questionsService: QuestionsService,
    private roundService: RoundService,
    private router: Router,
    private http: HttpClient) { }

  ngOnInit() {
    // Get FireId for questions
    this.http.get('https://challenge-app-c9782.firebaseio.com/questions.json')
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
      (quesWithFireId) => {
        this.quesIdFire = quesWithFireId;
      }
    );
    //
    // if (this.roundService.isRoundRunning) {
    //   this.router.navigate(['/']);
    //   console.log('hello');
    //   return;
    // }
    this.isRound = this.roundService.isRoundRunning;
    this.roundService.isRoundStart.subscribe(
      (roundStart: boolean) => {
        this.isRound = roundStart;
      }
    );

    for (const ques of this.questionsService.questions) {
      if (ques.selected === true) {
        this.numOfSelected++;
      }
    }
    // console.log('From for loop: ' + this.numOfSelected);

    this.questionsService.questionsChanged.subscribe(
      (updatedQuestions: Question[]) => {
        for (const ques of updatedQuestions) {
          if (ques.selected === true) {
            this.numOfSelected++;
          } else {
            this.numOfSelected = 0;
          }
        }
        // console.log(updatedQuestions);
      }
    );

    this.questionsService.numOfSelectedChanges.subscribe(
      (numToChange: number) => {
        this.numOfSelected = this.numOfSelected + numToChange;
        this.selectedQuestions = this.questionsService.questions.filter(ques => ques.selected === true );
        this.questionsService.questionsInRound = this.selectedQuestions;
      }
    );
    // console.log(this.numOfSelected);
    // console.log(this.isRound);
  }

  onSubmitRound() {
    if (this.isRound) {
      return;
    }
    this.isRound = true;
    this.roundService.isRoundStart.next(true);
    this.roundService.isRoundRunning = true;
    for (const ques of this.questionsService.questionsInRound) {
      for (const quesWithIdFire of this.quesIdFire) {
        if (ques.id === quesWithIdFire.id) {
          this.http.patch('https://challenge-app-c9782.firebaseio.com/questions/' + quesWithIdFire.fireId + '.json', {
            selected: true
          }).subscribe(
            () => {
              console.log('Ques Selected success');
              this.questionsService.sendQuestions.next(this.questionsService.questionsInRound);
            }, () => {
              console.log('Ques error select');
            }
          );
        }
      }
    }
    // this.questionsService.questionsInRoundChanged.next(this.selectedQuestions);
  }

  showNewFolder() {
    this.showFolderForm = !this.showFolderForm;
  }

}
