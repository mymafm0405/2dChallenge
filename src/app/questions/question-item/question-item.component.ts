import { AuthService } from './../../shared/auth.service';
import { Answer } from './../../shared/answer.model';
import { QuestionsService } from './../../shared/questions.service';
import { Component, OnInit } from '@angular/core';
import { Question } from 'src/app/shared/question.model';
import { RoundService } from 'src/app/shared/round.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-question-item',
  templateUrl: './question-item.component.html',
  styleUrls: ['./question-item.component.css']
})
export class QuestionItemComponent implements OnInit {
  questions: Question[] = [];
  answers: Answer[];
  viewAnswer = false;
  currentIndex: number;
  isRoundRunning = false;
  quesWithFireId = [];

  constructor(
    private questionsService: QuestionsService,
    private roundService: RoundService,
    private http: HttpClient,
    private db: AngularFireDatabase,
    private authService: AuthService) { }

  ngOnInit() {
    // Get all Questions with fireId
    this.http.get('https://challenge-app-test.firebaseio.com/questions.json')
    .pipe(map(
      (res) => {
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            this.quesWithFireId.push({...res[key], fireId: key});
          }
        }
      }
    ))
    .subscribe(
      () => {
        console.log('ques with fire id created');
      }
    );
    //
    // Get all questions
    this.db.list('/questions').valueChanges().subscribe(
      (currentQuestions: Question[]) => {
        this.questions = currentQuestions;
        // Get all Questions with fireId
        this.http.get('https://challenge-app-test.firebaseio.com/questions.json')
        .pipe(map(
          (res) => {
            const qWfId = [];
            for (const key in res) {
              if (res.hasOwnProperty(key)) {
                qWfId.push({...res[key], fireId: key});
              }
            }
            return qWfId;
          }
        ))
        .subscribe(
          (qWithFid) => {
            this.quesWithFireId = qWithFid;
            console.log('ques with fire id created');
          }
        );
        //
      }
    );
    //
  }

  onSelect(index: number) {
    console.log(!this.quesWithFireId[index].selected);
    console.log(this.quesWithFireId[index]);
    console.log(this.quesWithFireId[index].fireId);
    this.http.patch('https://challenge-app-test.firebaseio.com/questions/' + this.quesWithFireId[index].fireId + '.json', {
      selected: !this.quesWithFireId[index].selected
    }).subscribe(
      () => {
        console.log('question selected changed!');
      }
    );
  }

  onRemoveQuestion(index: number) {
    this.http.delete('https://challenge-app-test.firebaseio.com/questions/' + this.quesWithFireId[index].fireId + '.json')
    .subscribe(
      () => {
        console.log('Question deleted!');
      }
    );
  }

  onViewAnswers(quesId: number, index: number) {
    if (this.currentIndex === index) {
      this.viewAnswer = !this.viewAnswer;
    } else {
      this.viewAnswer = true;
    }
    this.db.list('/questions').valueChanges()
    // Get answers for question
    .subscribe(
        (currentQuestions: Question[]) => {
            this.questions = currentQuestions;
            this.answers = this.questions.find(ques => ques.id === quesId).answers;
            console.log(this.answers);
        }
    );
    //
    // this.answers = this.questionsService.answersArray;
    this.currentIndex = index;
    // console.log(quesId);
  }

}
