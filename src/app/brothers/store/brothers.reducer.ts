import { Participant } from './../../models/participant.model';
import { BrothersService } from './../brothers.service';
import * as BroActions from './brothers.actions'

const initialState = {
  participants: [],
  currentParticipantId: null, 
}

export function brothersReducer(state = initialState, action: BroActions.BrothersActions) {
  switch(action.type) {
    case BroActions.LOAD_PARTICIPANTS:
      return {
        ...state,
        participants: [...action.payload]
      }
    case BroActions.EDIT_PARTICIPANT: {
      const currentPartId = action.payload.editedParticipant.id;
      return {
        ...state,
        currentParticipantId: currentPartId,
      }
    } 
  
    case BroActions.UPDATE_PARTICIPANT: {
      let participantsCopy = [...state.participants];
      participantsCopy[action.payload.index] = action.payload.newParticipant;
      let updatedParticipants = participantsCopy;
      return {
        ...state,
        participants: [...updatedParticipants],
        currentParticipantId: null,
      }
    }
    case BroActions.ADD_PARTICIPANT: {
      // const compare = (a, b) => {
      //   let commAName = a.wspolnota.toUpperCase();
      //   let commBName = b.wspolnota.toUpperCase();
      //   let comparison = 0;
      //   if (commAName > commBName) {
      //     comparison = +1;
      //   } else if (commAName <= commBName) {
      //     comparison = -1;
      //   }
      //   return comparison;
      // }
      let participantsCopy = [...state.participants];
      let participantsWithAddedOne = [...participantsCopy, action.payload]
      // .sort(compare);
      let participantsSorted = participantsWithAddedOne;
      console.log('posortowane' ,participantsSorted)
      return {
        ...state,
        participants: [...participantsSorted],
        currentParticipantId: null,
      }
    }
    case BroActions.DELETE_PARTICIPANT: {
      let participantsCopy = [...state.participants];
      let changedParticipantsCopy = participantsCopy.filter(p => p.id !== action.payload.index);
      
      return {
        ...state,
        participants: [...changedParticipantsCopy]
      }
    }
      
    default:
      return state;
  }
}