import { Participant } from './../../models/participant.model';
import { Action } from '@ngrx/store';

export const LOAD_PARTICIPANTS = 'LOAD_PARTICIPANTS';
export class LoadParticipants implements Action {
  readonly type = LOAD_PARTICIPANTS;
  constructor(public payload: Participant[]) {}
}

export const EDIT_PARTICIPANT = 'EDIT_PARTICIPANT';
export class EditParticipant implements Action {
  readonly type = EDIT_PARTICIPANT;
  constructor(public payload: {editedParticipant: Participant}) {}
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

export const DELETE_PARTICIPANT = 'DELETE_PARTICIPANT';
export class DeleteParticipant implements Action {
  readonly type = DELETE_PARTICIPANT;
  constructor(public payload: {index: string}) {}
}

export type BrothersActions =
    LoadParticipants
  | EditParticipant
  | UpdateParticipant
  | AddParticipant
  | DeleteParticipant;