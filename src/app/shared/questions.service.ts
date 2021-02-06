import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Question } from './question.model';
import { Answer } from './answer.model';
import { HttpClient } from '@angular/common/http';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';
import { Folder } from './folder.model';

@Injectable({providedIn: 'root'})

export class QuestionsService {
    numOfSelectedChanges = new Subject<number>();
    questionsChanged = new Subject<Question[]>();
    sendQuestions = new Subject<Question[]>();
    // questionsInRoundChanged = new Subject<Question[]>();
    numOfQuestionsSelected: number;
    questionsInRound: Question[] = [];

    questions: Question[] = [];
    answersArray: Answer[] = [];
    folders: Folder[] = [];

    constructor(private http: HttpClient, private db: AngularFireDatabase) {}

    saveQuestion(question: Question) {
        this.questions.push(question);
        // Save question to the database
        const realUrlQuestion = 'https://challenge-app-c9782.firebaseio.com/';
        const testUrlQuestion = 'https://challenge-app-test.firebaseio.com/';
        this.http.post(testUrlQuestion + 'questions.json', question).subscribe(
            () => {
                console.log('Question saved');
                // this.questionsChanged.next(this.questions.slice());
            }
        );
    }

    getAllFolders() {
      return this.folders;
    }

    addFolder(folder: Folder) {
      this.folders.push(folder);
    }

    getFolder(id: number) {
      return this.folders.find(fo => fo.id === id);
    }
}
