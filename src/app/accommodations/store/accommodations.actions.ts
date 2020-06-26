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

export type AccommodationsActions = LoadAccommodations | UpdateAccommodation;