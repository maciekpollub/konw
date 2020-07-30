
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

export const MARK_FIRST_NIGHT = 'MARK_FIRST_NIGHT';
export class MarkFirstNight implements Action {
  readonly type = MARK_FIRST_NIGHT;
  constructor() {}
}

export const MARK_SECOND_NIGHT = 'MARK_SECOND_NIGHT';
export class MarkSecondNight implements Action {
  readonly type = MARK_SECOND_NIGHT;
  constructor() {}
}

export const MARK_THIRD_NIGHT = 'MARK_THIRD_NIGHT';
export class MarkThirdNight implements Action {
  readonly type = MARK_THIRD_NIGHT;
  constructor() {}
}

export const MARK_ALL_NIGHTS = 'MARK_ALL_NIGHTS';
export class MarkAllNights implements Action {
  readonly type = MARK_ALL_NIGHTS;
  constructor() {}
}

export const ACCOMMODATE_PARTICIPANT = 'ACCOMMODATE_PARTICIPANT';
export class AccommodateParticipant implements Action {
  readonly type = ACCOMMODATE_PARTICIPANT;
  constructor(public payload: {accomId: string, currPartId: string | number}) {}
}

export const REACCOMMODATE_PARTICIPANT = 'REACCOMMODATE_PARTICIPANT';
export class ReaccommodateParticipant implements Action {
  readonly type = REACCOMMODATE_PARTICIPANT;
  constructor(public payload: {cancelledAccomId: string, accomId: string, currPartId: string | number}) {}
}

export const DISACCOMMODATE_PARTICIPANT = 'DISACCOMMODATE_PARTICIPANT';
export class DisaccommodateParticipant implements Action {
  readonly type = DISACCOMMODATE_PARTICIPANT;
  constructor(public payload: {accomId: string, currPartId: string | number}) {}
}

export type BrothersActions =
    LoadParticipants
  | EditParticipant
  | UpdateParticipant
  | AddParticipant
  | DeleteParticipant
  | MarkAllNights
  | MarkFirstNight
  | MarkSecondNight
  | MarkThirdNight
  | AccommodateParticipant
  | ReaccommodateParticipant
  | DisaccommodateParticipant;