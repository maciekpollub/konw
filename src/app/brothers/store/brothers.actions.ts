import { Participant } from './../../models/participant.model';
import { Action } from '@ngrx/store';

export const LOAD_PARTICIPANTS = 'LOAD_PARTICIPANTS';
export class LoadParticipants implements Action {
  readonly type = LOAD_PARTICIPANTS;
  constructor(public payload: Participant []) {}
}

export type BrothersActions = LoadParticipants;