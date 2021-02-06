import { Router } from '@angular/router';
import { Player } from './../../shared/player.model';
import { RoundService } from './../../shared/round.service';
import { QuestionsService } from './../../shared/questions.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Question } from 'src/app/shared/question.model';
import { PlayerService } from 'src/app/shared/player.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  foundQuestions: Question[] = [];
  playerQuestions: Question[] = [];
  answerReady = false;
  answersArray = [];
  currentPlayers: Player[] = [];
  // quesAnswer = false;
  userId: number;
  // answerClicked = false;
  foundPlayer: Player;
  username = '';
  playerName: string;
  confirmed = false;
  joinedError = false;
  usernameError = false;
  plysUserAndIdArray = [];
  totalFinishedTime = 0;
  timer: any;
  foundAnswersForPlayerslength: number;
  rightAnsId: number;
  questionsWithImages: { imageUrl: string, questionId: number }[] = [];
  currentIndex = 0;
  loadingQuestions = true;
  currentRoundTimeId: string;

  constructor(
    private questionsService: QuestionsService,
    private roundService: RoundService,
    private playerService: PlayerService,
    private db: AngularFireDatabase,
    private http: HttpClient,
    private router: Router) { }

  ngOnInit() {
    // Get answerReady Status
    this.http.get('https://challenge-app-test.firebaseio.com/answerReady.json').subscribe(
      (response: { answerReady: boolean }) => {
        console.log('Answer status is down here.');
        console.log(response);
        if (response.answerReady === true) {
          console.log('Hellooooo after answer ready');
          // Get the remaining time at the begining
          this.http.get('https://challenge-app-test.firebaseio.com/time.json')
            .pipe(map(
              (resData) => {
                for (const key in resData) {
                  if (resData.hasOwnProperty(key)) {
                    return resData[key];
                  }
                }
              }
            ))
            .subscribe(
              (currentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                if (currentRoundTimeData === undefined) {
                  setTimeout(() => {
                    this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                      .pipe(map(
                        (resData) => {
                          for (const key in resData) {
                            if (resData.hasOwnProperty(key)) {
                              return resData[key];
                            }
                          }
                        }
                      ))
                      .subscribe(
                        (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                          console.log(newCurrentRoundTimeData);
                          this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                          this.roundService.onPlayTimerSound();
                          this.currentIndex = 0;
                          for (const q of this.playerQuestions) {
                            q.answered = false;
                          }
                          this.timer = setInterval(() => {
                            this.totalFinishedTime++;
                            console.log(this.totalFinishedTime);
                          }, 1000);
                        }
                      );
                  }, 2000);
                } else {
                  this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                    .pipe(map(
                      (resData) => {
                        for (const key in resData) {
                          if (resData.hasOwnProperty(key)) {
                            return resData[key];
                          }
                        }
                      }
                    ))
                    .subscribe(
                      (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                        console.log(newCurrentRoundTimeData);
                        this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                        console.log(this.totalFinishedTime);
                        this.roundService.onPlayTimerSound();
                        this.currentIndex = 0;
                        for (const q of this.playerQuestions) {
                          q.answered = false;
                        }
                        this.totalFinishedTime = this.totalFinishedTime;
                        if (!this.timer) {
                          this.timer = setInterval(() => {
                            this.totalFinishedTime++;
                            console.log(this.totalFinishedTime);
                          }, 1000);
                        }
                      }
                    );
                }
              }
            );
          //
        }
      }
    );
    //
    // Get all question with images
    this.db.list('/chooseQuestionsImages').valueChanges()
      .subscribe(
        (quesWithImgs: { imageUrl: string, questionId: number }[]) => {
          this.questionsWithImages = quesWithImgs;
        }
      );
    // this.currentPlayers = this.playerService.players;
    // Get all answers at the beginning
    this.http.get('https://challenge-app-test.firebaseio.com/answers.json')
      .pipe(map(
        (ansRes) => {
          const ansArr = [];
          for (const key in ansRes) {
            if (ansRes.hasOwnProperty(key)) {
              ansArr.push(ansRes[key]);
            }
          }
          return ansArr;
        }
      ))
      .subscribe(
        (allAnsArr) => {
          this.answersArray = allAnsArr;
          if (this.foundPlayer) {
            this.foundAnswersForPlayerslength = this.answersArray.filter(plyAns => plyAns.plyId === this.foundPlayer.id).length;
          }
        }
      );
    //
    this.db.list('/answers').valueChanges().subscribe(
      (resAnswers) => {
        this.answersArray = resAnswers;
        if (this.foundPlayer) {
          this.foundAnswersForPlayerslength = this.answersArray.filter(plyAns => plyAns.plyId === this.foundPlayer.id).length;
        }
        console.log(this.answersArray);
      }
    );
    //
    const realUrl = 'https://challenge-app-c9782.firebaseio.com/';
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
    //
    // I need to reflect answerRead live here...
    this.db.list('/answerReady').valueChanges()
      .pipe(map(
        (res) => {
          return res;
        }
      ))
      .subscribe(
        (status: boolean[]) => {
          this.answerReady = status[0];
          //
          if (this.answerReady === true) {
            if (this.confirmed && this.username !== 'adminasmaa') {
              this.router.navigate(['/']);
              console.log('Not Asmaa');
            } else {
              console.log('Asmaa is here');
              // Get the remaining time at the begining
              this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                .pipe(map(
                  (resData) => {
                    for (const key in resData) {
                      if (resData.hasOwnProperty(key)) {
                        return resData[key];
                      }
                    }
                  }
                ))
                .subscribe(
                  (currentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                    if (currentRoundTimeData === undefined) {
                      setTimeout(() => {
                        this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                          .pipe(map(
                            (resData) => {
                              for (const key in resData) {
                                if (resData.hasOwnProperty(key)) {
                                  return resData[key];
                                }
                              }
                            }
                          ))
                          .subscribe(
                            (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                              console.log(newCurrentRoundTimeData);
                              this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                              this.roundService.onPlayTimerSound();
                              this.currentIndex = 0;
                              for (const q of this.playerQuestions) {
                                q.answered = false;
                              }
                              if (!this.timer) {
                                this.timer = setInterval(() => {
                                  this.totalFinishedTime++;
                                  console.log(this.totalFinishedTime);
                                }, 1000);
                              }
                            }
                          );
                      }, 2000);
                    }
                  }
                );
              //
            }
            // if (this.currentRoundTimeId) {
            // Get the remaining time at the begining
            this.http.get('https://challenge-app-test.firebaseio.com/time.json')
              .pipe(map(
                (resData) => {
                  for (const key in resData) {
                    if (resData.hasOwnProperty(key)) {
                      return resData[key];
                    }
                  }
                }
              ))
              .subscribe(
                (currentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                  if (currentRoundTimeData === undefined) {
                    setTimeout(() => {
                      this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                        .pipe(map(
                          (resData) => {
                            for (const key in resData) {
                              if (resData.hasOwnProperty(key)) {
                                return resData[key];
                              }
                            }
                          }
                        ))
                        .subscribe(
                          (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                            console.log(newCurrentRoundTimeData);
                            this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                            this.roundService.onPlayTimerSound();
                            this.currentIndex = 0;
                            for (const q of this.playerQuestions) {
                              q.answered = false;
                            }
                            if (!this.timer) {
                              this.timer = setInterval(() => {
                                this.totalFinishedTime++;
                                console.log(this.totalFinishedTime);
                              }, 1000);
                            }
                          }
                        );
                    }, 2000);
                  }
                }
              );
            //
            // }
          } else if (this.answerReady === false) {
            this.roundService.onPauseTimerSound();
            clearInterval(this.timer);
            this.totalFinishedTime = 0;
          }
          //
        }
      );
    //
    this.db.list('/players').valueChanges()
      .pipe(map(
        (response) => {
          console.log(response);
          const playersArray = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              playersArray.push(response[key]);
              // this.plysUserAndIdArray.push({...response, id: key});
            }
          }
          return playersArray;
        }
      ))
      .subscribe(
        (allPlayers: Player[]) => {
          this.currentPlayers = allPlayers;
          this.http.get('https://challenge-app-test.firebaseio.com/players.json')
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
          // console.log(this.plysUserAndIdArray);
        }
      );
    //
    this.db.list('/questions').valueChanges()
      .pipe(map(
        (res) => {
          const quesArray = [];
          for (const key in res) {
            if (res.hasOwnProperty(key)) {
              quesArray.push(res[key]);
            }
          }
          return quesArray;
        }
      ))
      .subscribe(
        (quesAll: Question[]) => {
          this.foundQuestions = quesAll.filter(q => q.selected === true);
          this.playerQuestions = this.foundQuestions;
        }
      );
  }

  ngOnDestroy() {
    if (this.foundPlayer) {
      const fireBaseId = this.plysUserAndIdArray.find(user => user.username === this.username).fireId;
      const testUrl = 'https://challenge-app-test.firebaseio.com/';
      const realUrl = 'https://challenge-app-c9782.firebaseio.com/';
      this.http.patch(testUrl + 'players/' + fireBaseId + '.json', {
        joined: false
      }).subscribe(
        () => {
          console.log('Signout success');
          this.router.navigate(['/user']);
        }, () => {
          console.log('Error signout');
        }
      );
    }
  }

  onJoinClick() {
    this.loadingQuestions = true;
    this.username = this.username.toLowerCase();
    if (this.username === 'adminasmaa') {
      this.playerService.showNavChanged.next(true);
      this.username = '';
      return;
    }
    if (this.currentPlayers.find(ply => ply.username === this.username)) {
      ///
      // Get the remaining time at the begining
      this.http.get('https://challenge-app-test.firebaseio.com/time.json')
        .pipe(map(
          (resData) => {
            for (const key in resData) {
              if (resData.hasOwnProperty(key)) {
                return resData[key];
              }
            }
          }
        ))
        .subscribe(
          (currentRoundTimeData: { totalTime: number, remainingTime: number }) => {
            if (currentRoundTimeData === undefined) {
              setTimeout(() => {
                this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                  .pipe(map(
                    (resData) => {
                      for (const key in resData) {
                        if (resData.hasOwnProperty(key)) {
                          return resData[key];
                        }
                      }
                    }
                  ))
                  .subscribe(
                    (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                      console.log(newCurrentRoundTimeData);
                      this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                      this.roundService.onPlayTimerSound();
                      this.currentIndex = 0;
                      for (const q of this.playerQuestions) {
                        q.answered = false;
                      }
                      if (!this.timer) {
                        this.timer = setInterval(() => {
                          this.totalFinishedTime++;
                          console.log(this.totalFinishedTime);
                        }, 1000);
                      }
                    }
                  );
              }, 2000);
            } else {
              this.http.get('https://challenge-app-test.firebaseio.com/time.json')
                .pipe(map(
                  (resData) => {
                    for (const key in resData) {
                      if (resData.hasOwnProperty(key)) {
                        return resData[key];
                      }
                    }
                  }
                ))
                .subscribe(
                  (newCurrentRoundTimeData: { totalTime: number, remainingTime: number }) => {
                    console.log(newCurrentRoundTimeData);
                    this.totalFinishedTime = newCurrentRoundTimeData.totalTime - newCurrentRoundTimeData.remainingTime;
                    this.roundService.onPlayTimerSound();
                    this.currentIndex = 0;
                    for (const q of this.playerQuestions) {
                      q.answered = false;
                    }
                    if (!this.timer) {
                      this.timer = setInterval(() => {
                        this.totalFinishedTime++;
                        console.log(this.totalFinishedTime);
                      }, 1000);
                    }
                  }
                );
            }
          }
        );
      //
      ///
      this.foundPlayer = this.currentPlayers.find(ply => ply.username === this.username);
      const fireBaseId = this.plysUserAndIdArray.find(user => user.username === this.username).fireId;
      if (!this.foundPlayer.joined || this.foundPlayer.joined) {
        this.confirmed = true;
        this.playerName = this.foundPlayer.name;
        //
        // Update join status on firebase
        const testUrl = 'https://challenge-app-test.firebaseio.com/';
        const realUrl = 'https://challenge-app-c9782.firebaseio.com/';
        this.http.patch(testUrl + 'players/' + fireBaseId + '.json', {
          joined: true
        }).subscribe(
          () => {
            // Prevent player from dublicate his answers if he try to join again.
            if (this.foundPlayer.finish) {
              this.currentIndex = this.foundQuestions.length;
              this.loadingQuestions = false;
              return;
            } else {
              this.currentIndex = 0;
              this.loadingQuestions = false;
            }
            //
            console.log('Updated success');
          }, () => {
            console.log('Error updating');
          }
        );
        //
        this.userId = this.foundPlayer.id;
        this.joinedError = false;
        this.usernameError = false;
      } else {
        this.joinedError = true;
      }
    } else {
      this.usernameError = true;
    }
  }

  onSignOut() {
    clearInterval(this.timer);
    this.confirmed = false;
    //
    const fireBaseId = this.plysUserAndIdArray.find(user => user.username === this.username).fireId;
    const testUrlPlayers = 'https://challenge-app-test.firebaseio.com/';
    const realUrlPlayers = 'https://challenge-app-c9782.firebaseio.com/';
    this.http.patch(testUrlPlayers + 'players/' + fireBaseId + '.json', {
      joined: false
    }).subscribe(
      () => {
        console.log('Signout success');
      }, () => {
        console.log('Error signout');
      }
    );
  }

  onAnswerClick(answerId: number, quesId: number, quesIndex: number, playerId: number) {
    // Increase current index
    this.currentIndex++;
    //
    for (const q of this.playerQuestions) {
      if (q.id === quesId) {
        this.rightAnsId = q.answers.find(ans => ans.correct === true).id;
      }
    }
    const userAnswer = {
      quesId: this.playerQuestions[quesIndex].id,
      ansId: answerId,
      plyId: playerId,
      correctId: this.rightAnsId
    };
    const testUrlAnswers = 'https://challenge-app-test.firebaseio.com/';
    const realUrlAnswers = 'https://challenge-app-c9782.firebaseio.com/';
    this.playerQuestions[quesIndex].answered = true;
    this.http.post(testUrlAnswers + 'answers.json', userAnswer)
      .subscribe(
        () => {
          console.log('Answer posted');
          // If user clicked the answer of the question then answer should be disabled for this ques.
          // this.playerQuestions[quesIndex].answered = true;
          // Check if all questions answered for this user then make finish = true for this user.
          console.log(this.playerQuestions.length);
          console.log(this.foundAnswersForPlayerslength);
          // Get all answers at the beginning
          this.http.get('https://challenge-app-test.firebaseio.com/answers.json')
            .pipe(map(
              (ansRes) => {
                const ansArr = [];
                for (const key in ansRes) {
                  if (ansRes.hasOwnProperty(key)) {
                    ansArr.push(ansRes[key]);
                  }
                }
                return ansArr;
              }
            ))
            .subscribe(
              (allAnsArr) => {
                this.answersArray = allAnsArr;
                if (this.foundPlayer) {
                  console.log(this.foundPlayer);
                  console.log('Found player Id' + this.foundPlayer.id);
                  this.foundAnswersForPlayerslength = this.answersArray.filter(plyAns => plyAns.plyId === this.foundPlayer.id).length;
                  console.log('Found Answer Length ' + this.foundAnswersForPlayerslength);
                  if (this.playerQuestions.length === this.foundAnswersForPlayerslength) {
                    console.log('user finished all ques');
                    const plyFireId = this.plysUserAndIdArray.find(p => p.id === playerId).fireId;
                    this.http.patch('https://challenge-app-test.firebaseio.com/players/' + plyFireId + '.json', {
                      finish: true,
                      finishedTime: this.totalFinishedTime,
                      minuts: Math.floor(this.totalFinishedTime / 60),
                      seconds: Math.floor(this.totalFinishedTime % 60)
                    }).subscribe(
                      () => {
                        // Now save the finish time to the user
                        console.log('user finish now is true!');
                        console.log('Player fire Id: ' + plyFireId);
                        // I think here we should clear the timer...
                        //
                        //
                      }, (error) => {
                        console.log('Error when make user finish');
                        console.log(error);
                      }
                    );
                  } else {
                    console.log('Still questions not answered!');
                  }
                }
              }
            );
        }
      );
  }
}
