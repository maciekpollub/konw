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
        accommodations: [...action.payload ]
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
    default: 
      return state;
    };
  }  
