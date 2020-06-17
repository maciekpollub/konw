import { Participant } from './../models/participant.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrothersService {

  participantsEmitter = new Subject<Participant[]>()
  constructor() { }
}
