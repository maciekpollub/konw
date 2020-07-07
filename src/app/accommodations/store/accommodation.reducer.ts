import { Accommodation } from './../../models/accommodation.model';
import * as AccomActions from './accommodations.actions';

const initialState = {
  accommodations: []
}

export function accommodationsReducer(state = initialState, action: AccomActions.AccommodationsActions ) {
  switch(action.type) {
    case AccomActions.LOAD_ACCOMMODATIONS: {
      return {
        ...state,
        accommodations: [...action.payload]
      };
    }
    case AccomActions.UPDATE_ACCOMMODATION: {
      let accommodationsCopy = [...state.accommodations];
      let index = action.payload.index;
      let updatedAccommodation = action.payload.accommodation;
      accommodationsCopy[index] = updatedAccommodation;
      return {
        ...state,
        accommodations: [...accommodationsCopy]
      }
    }
    case AccomActions.TAKE_ACCOMMODATION: {
      let accommodationsCopy = [...state.accommodations];
      let availableAccommodations = [...state.accommodations].filter(el => !el.przydzial);
      let index = action.payload.index;
      let takenAccommodation = availableAccommodations.find(el => el.id === index);
      takenAccommodation.przydzial = 't';
      return {
        ...state,
        accommodations: [...accommodationsCopy]
      }
    }
    case AccomActions.FREE_ACCOMMODATION: {
      let accommodationsCopy = [...state.accommodations];
      let takenAccommodations = [...state.accommodations].filter(el => el.przydzial);
      let index = action.payload.index;
      let accommodationToFree = takenAccommodations.find(el => el.id === index);
      accommodationToFree.przydzial = null;
      return {
        ...state,
        accommodations: [...accommodationsCopy]
      }
    }
    default: 
      return state;
    };
  }  
