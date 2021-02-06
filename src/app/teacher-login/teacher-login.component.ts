import { AuthService } from './../shared/auth.service';
import { environment } from './../../environments/environment';
import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AuthRes {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: string;
}

@Component({
  selector: 'app-teacher-login',
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.css']
})
export class TeacherLoginComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
  }

  onSubmitTeacher(teacherForm: NgForm) {
    // console.log(teacherForm);
    this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseConfig.apiKey, {
      email: teacherForm.value.email,
      password: teacherForm.value.password
    })
    .subscribe(
      (resData: AuthRes) => {
        console.log(resData);
        localStorage.setItem('teacherData', JSON.stringify(resData));
        this.authService.teacherToken = resData.idToken;
        this.authService.userId = resData.localId;
        this.authService.teacherLoginChanged.next(resData);
      }, (error) => {
        console.log(error);
      }
    );
  }

}
