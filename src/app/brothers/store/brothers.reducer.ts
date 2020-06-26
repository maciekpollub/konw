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
    case BroActions.UPDATE_PARTICIPANT: {
      let participantsCopy = [...state.participants];
      participantsCopy[action.payload.index] = action.payload.newParticipant;
      let updatedParticipants = participantsCopy;
      return {
        ...state,
        participants: [...updatedParticipants]
      }
    }
    case BroActions.ADD_PARTICIPANT: {
      const compare = (a, b) => {
        let commAName = a.communityName.toUpperCase();
        let commBName = b.communityName.toUpperCase();
        let comparison = 0;
        if (commAName > commBName) {
          comparison = 1;
        } else if (commAName <= commBName) {
          comparison = -1;
        }
        return comparison;
      }
      let participantsCopy = [...state.participants];
      let participantsWithAddedOne = [...participantsCopy, action.payload].sort(compare);
      let participantsSorted = participantsWithAddedOne;
      console.log('posortowane' ,participantsSorted)
      return {
        ...state,
        participants: [...participantsSorted]
      }
    }
      
    default:
      return state;
  }
}