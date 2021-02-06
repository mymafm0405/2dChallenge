import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NewQuestionComponent } from './questions/new-question/new-question.component';
import { QuestionsListComponent } from './questions/questions-list/questions-list.component';
import { QuestionItemComponent } from './questions/question-item/question-item.component';
import { QuestionsComponent } from './questions/questions.component';
import { PlayersListComponent } from './players-list/players-list.component';
import { PlayerComponent } from './players-list/player/player.component';
import { RoundComponent } from './round/round.component';
import { TimerComponent } from './timer/timer.component';
import { RoundStatusComponent } from './round-status/round-status.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './users/user/user.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { NewPlayerComponent } from './players-list/new-player/new-player.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { FolderComponent } from './folder/folder.component';
import { NewFolderComponent } from './new-folder/new-folder.component';

const appRoutes: Routes = [
  {path: 'questions', component: QuestionsComponent},
  {path: 'round', component: RoundComponent},
  {path: 'user', component: UserComponent},
  {path: 'new-player', component: NewPlayerComponent},
  {path: 'teacher', component: TeacherLoginComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NewQuestionComponent,
    QuestionsListComponent,
    QuestionItemComponent,
    QuestionsComponent,
    PlayersListComponent,
    PlayerComponent,
    RoundComponent,
    TimerComponent,
    RoundStatusComponent,
    UsersComponent,
    UserComponent,
    NewPlayerComponent,
    TeacherLoginComponent,
    FolderComponent,
    NewFolderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireStorageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
