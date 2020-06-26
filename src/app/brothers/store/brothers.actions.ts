import { Participant } from './../../models/participant.model';
import { Action } from '@ngrx/store';

export const LOAD_PARTICIPANTS = 'LOAD_PARTICIPANTS';
export class LoadParticipants implements Action {
  readonly type = LOAD_PARTICIPANTS;
  constructor(public payload: Participant[]) {}
}

export const UPDATE_PARTICIPANT = 'UPDATE_PARTICIPANT';
export class UpdateParticipant implements Action {
  readonly type = UPDATE_PARTICIPANT;
  constructor(public payload: {index: number, newParticipant: Participant}){}
}

export const ADD_PARTICIPANT = 'ADD_PARTICIPANT';
export class AddParticipant implements Action {
  readonly type = ADD_PARTICIPANT;
  constructor(public payload: Participant) {}
}

export type BrothersActions = LoadParticipants | UpdateParticipant | AddParticipant;