import { Participant } from './../../models/participant.model';
import { UPDATE_PARTICIPANT } from './../../brothers/store/brothers.actions';
import { Accommodation } from './../../models/accommodation.model';
import { Action } from '@ngrx/store';



export const LOAD_ACCOMMODATIONS = 'LOAD_ACCOMMODATIONS';
export class LoadAccommodations implements Action {
  readonly type = LOAD_ACCOMMODATIONS;
  constructor(public payload: Accommodation[]) {}
}

export const UPDATE_ACCOMMODATION = 'UPDATE_ACCOMMODATION';
export class UpdateAccommodation implements Action {
  readonly type = UPDATE_ACCOMMODATION;
  constructor(public payload: {index: number, accommodation: Accommodation}) {}
}

export const TAKE_ACCOMMODATION = 'TAKE_ACCOMMODATION';
export class TakeAccommodation implements Action {
  readonly type = TAKE_ACCOMMODATION;
  constructor(public payload: {accomIndex: string, participant: Participant}) {}
}

export const FREE_ACCOMMODATION = 'FREE_ACCOMMODATION';
export class FreeAccommodation implements Action {
  readonly type = FREE_ACCOMMODATION;
  constructor(public payload: {index: string}) {}
}

export const FREE_ACCOMMODATION_ON_DELETE = 'FREE_ACCOMMODATION_ON_DELETE';
export class FreeAccommodationOnDelete implements Action {
  readonly type = FREE_ACCOMMODATION_ON_DELETE;
  constructor(public payload: {index: string}) {}
}

export type AccommodationsActions =
 LoadAccommodations
| UpdateAccommodation
| TakeAccommodation
| FreeAccommodation
| FreeAccommodationOnDelete;