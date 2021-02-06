import { QuestionsService } from './../../shared/questions.service';
import { Question } from './../../shared/question.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Answer } from 'src/app/shared/answer.model';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-new-question',
  templateUrl: './new-question.component.html',
  styleUrls: ['./new-question.component.css']
})
export class NewQuestionComponent implements OnInit {
  // @ViewChild('questionForm', {static: false}) questionForm: NgForm;
  chooseForm: FormGroup;
  showQuestionForm = false;
  questionType = '';
  answers = new FormArray([]);
  savedMsg = false;
  selectedImage = null;

  constructor(private questionsService: QuestionsService, private http: HttpClient, private storage: AngularFireStorage) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.chooseForm = new FormGroup({
      title: new FormControl('', Validators.required),
      answers: this.answers,
      imageUrl: new FormControl(null)
    });
  }

  getControls() {
    return (this.chooseForm.get('answers') as FormArray).controls;
  }

  onAddAnswers() {
    (this.chooseForm.get('answers') as FormArray).push(
      new FormGroup({
        answer: new FormControl(null, Validators.required),
        correct: new FormControl(null)
      })
    );
  }

  onPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedImage = event.target.files[0];
    } else {
      this.selectedImage = null;
    }
  }

  onAddQuestion() {
    this.showQuestionForm = !this.showQuestionForm;
  }
  onTypeChoose() {
    this.questionType = 'choose';
  }
  onTypeTrueOrFalse() {
    this.questionType = 'trueOrFalse';
  }
  onTypeWritting() {
    this.questionType = 'writting';
  }
  onSaveChooseQuestion() {
    const quesId = Date.now();
    const quesAnswers: Answer[] = [];
    let i = 1;
    for (const ans of this.chooseForm.controls.answers.value) {
      const answerId = Date.now() + i;
      quesAnswers.push({id: answerId, questionId: quesId, ...ans});
      i++;
      console.log(answerId);
    }
    const newQuestion = new Question(
      quesId,
      0,
      this.chooseForm.controls.title.value,
      false,
      'choose',
      quesAnswers.slice(),
      false,
      false,
      0
    );
    const testUrlQuestion = 'https://challenge-app-test.firebaseio.com/';
    this.http.post(testUrlQuestion + 'questions.json', newQuestion).subscribe(
        () => {
            console.log('Question saved');
            (this.chooseForm.get('answers') as FormArray).clear();
            // this.questionsChanged.next(this.questions.slice());
            // Save the question image
            if (this.selectedImage !== null) {
              const filePath = `chooseQuestionsImages/${quesId}`;
              const fileRef = this.storage.ref(filePath);
              this.storage.upload(filePath, this.selectedImage)
              .snapshotChanges()
              .pipe(
                finalize(
                  () => {
                    fileRef.getDownloadURL().subscribe(
                      (url) => {
                        this.http.post('https://challenge-app-test.firebaseio.com/chooseQuestionsImages.json', {
                          questionId: quesId,
                          imageUrl: url
                        }).subscribe(
                          () => {
                            console.log('Image has been saved successfully');
                          }
                        );
                      }
                    );
                  }
                )
              )
              .subscribe();
            }
        }
    );
    // this.questionsService.saveQuestion(newQuestion);
    console.log(newQuestion);
    console.log(quesAnswers);
    // console.log(this.chooseForm);
    // console.log(quesAnswers);
    this.chooseForm.reset();
    this.savedMsg = true;
    setTimeout(() => {
      this.savedMsg = false;
    }, 2000);
  }

}
