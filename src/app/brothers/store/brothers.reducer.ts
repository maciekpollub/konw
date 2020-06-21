import { BrothersService } from './../brothers.service';
import * as BroActions from './brothers.actions'

const initialState = {
  participants: [],
}

export function brothersReducer(state = initialState, action: BroActions.BrothersActions) {
  switch(action.type) {
    case BroActions.LOAD_PARTICIPANTS:
      return {
        ...state,
        participants: [...state.participants, ...action.payload]
      }
    default:
      return state;
  }
}