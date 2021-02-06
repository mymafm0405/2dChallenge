import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Player } from './player.model';

@Injectable({providedIn: 'root'})
export class PlayerService {
    showNavChanged = new Subject<boolean>();
    playersChanged = new Subject<Player[]>();
    players: Player[] = [];
}
