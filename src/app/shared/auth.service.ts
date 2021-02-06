import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthRes } from '../teacher-login/teacher-login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  teacherToken: string;
  userId: string;
  teacherLoginChanged = new Subject<AuthRes>();
  constructor() { }
}
