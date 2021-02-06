import { Player } from './../../shared/player.model';
import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.component.html',
  styleUrls: ['./new-player.component.css']
})
export class NewPlayerComponent implements OnInit {
  @ViewChild('playerForm', {static: false}) playerForm: NgForm;
  savedMsg = false;
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  onSubmitForm() {
    const newPlayer = new Player(
      Date.now(),
      this.playerForm.controls.username.value,
      this.playerForm.controls.name.value,
      false,
      false,
      0,
      0,
      0,
      false);
    // value to change between test-app and real-app
    const playersUrlTest = 'https://challenge-app-test.firebaseio.com/';
    const playersUrlReal = 'https://challenge-app-c9782.firebaseio.com/';
    //
    this.http.post(playersUrlTest + 'players.json', newPlayer).subscribe(
      () => {
        console.log('player saved');
        this.playerForm.reset();
        this.savedMsg = true;
      }
    );
    // console.log(this.playerForm);
  }

}
