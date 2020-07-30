import { Participant } from './../../models/participant.model';
import { BrothersService } from './../brothers.service';
import * as BroActions from './brothers.actions'

const initialState = {
  participants: [],
  currentParticipantId: null,
  currentKwateraJustBeforeDisaccommodation: null,
}

export function brothersReducer(state = initialState, action: BroActions.BrothersActions) {
  switch(action.type) {
    case BroActions.LOAD_PARTICIPANTS:
      return {
        ...state,
        participants: [...action.payload]
      }
    case BroActions.EDIT_PARTICIPANT: {
      let currentPartId = action.payload.editedParticipant.id;
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
    case BroActions.MARK_FIRST_NIGHT: {
      let participantsCopy = [...state.participants];
      let index = state.currentParticipantId;
      let takenParticipant = participantsCopy.find(p => p.id === index);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
        takenParticipant = {
          ...takenParticipant,
          nieobNoc1: takenParticipant.nieobNoc1 === 'tak' ? '' : 'tak' 
        }      
      participantsCopy[takenParticipantNo] = takenParticipant
      return {
        ...state,
        participants: [...participantsCopy]
      }
    }
    case BroActions.MARK_SECOND_NIGHT: {
      let participantsCopy = [...state.participants];
      let index = state.currentParticipantId;
      let takenParticipant = participantsCopy.find(p => p.id === index);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
        takenParticipant = {
          ...takenParticipant,
          nieobNoc2: takenParticipant.nieobNoc2 === 'tak' ? '' : 'tak' 
        }      
      participantsCopy[takenParticipantNo] = takenParticipant
      return {
        ...state,
        participants: [...participantsCopy]
      }
    }
    case BroActions.MARK_THIRD_NIGHT: {
      let participantsCopy = [...state.participants];
      let index = state.currentParticipantId;
      let takenParticipant = participantsCopy.find(p => p.id === index);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
        takenParticipant = {
          ...takenParticipant,
          nieobNoc3: takenParticipant.nieobNoc3 === 'tak' ? '' : 'tak' 
        }      
      participantsCopy[takenParticipantNo] = takenParticipant
      return {
        ...state,
        participants: [...participantsCopy]
      }
    }
    case BroActions.MARK_ALL_NIGHTS: {
      let participantsCopy = [...state.participants];
      let index = state.currentParticipantId;
      let takenParticipant = participantsCopy.find(p => p.id === index);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
      takenParticipant = {
        ...takenParticipant,
        nieobNoc1: '',
        nieobNoc2: '',
        nieobNoc3: '',
      }
      participantsCopy[takenParticipantNo] = takenParticipant
      return {
        ...state,
        participants: [...participantsCopy]
      }
    }
    case BroActions.ACCOMMODATE_PARTICIPANT: {
      let newAccId = action.payload.accomId;
      let currPartId = action.payload.currPartId;
      let participantsCopy = [...state.participants];
      let takenParticipant = participantsCopy.find(p => p.id === currPartId);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
      let takenParticipantKwatera = takenParticipant.kwatera;
      takenParticipant = {
        ...takenParticipant,
        kwatera: [...takenParticipantKwatera, newAccId]
      }
      participantsCopy[takenParticipantNo] = takenParticipant;
      return {
        ...state,
        participants: [...participantsCopy]
      }
    }
    case BroActions.REACCOMMODATE_PARTICIPANT: {
      let cancelledAccId = action.payload.cancelledAccomId;
      let newAccId = action.payload.accomId;
      let currPartId = action.payload.currPartId;
      let participantsCopy = [...state.participants];
      let takenParticipant = participantsCopy.find(p => p.id === currPartId);
      let positionToReplace = state.currentKwateraJustBeforeDisaccommodation.lastIndexOf(cancelledAccId);
      console.log('Position to replace: ,', positionToReplace);
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
      let takenParticipantKwatera = [...takenParticipant.kwatera];
      takenParticipantKwatera.splice(positionToReplace, 0, newAccId);
      takenParticipant = {
        ...takenParticipant,
        kwatera: takenParticipantKwatera,
      }
      participantsCopy[takenParticipantNo] = takenParticipant;
      console.log('po uzupełnieniu arrayka :', [...takenParticipantKwatera])
      return {
        ...state,
        participants: [...participantsCopy],
        currentKwateraJustBeforeDisaccommodation: takenParticipantKwatera,
      }
    }
    case BroActions.DISACCOMMODATE_PARTICIPANT: {
      let pastAccId = action.payload.accomId;
      let currPartId = action.payload.currPartId;
      let participantsCopy = [...state.participants];
      let takenParticipant = participantsCopy.find(p => p.id === currPartId);
      let kwateraBeforeDisaccomodation = takenParticipant.kwatera;
      let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
      let positionOfKwateraToExpell = takenParticipant.kwatera.lastIndexOf(pastAccId);
      let takenParticipantKwatera = [...takenParticipant.kwatera]
      takenParticipantKwatera.splice(positionOfKwateraToExpell, 1);
      takenParticipant = {
        ...takenParticipant,
        kwatera: [...takenParticipantKwatera]
      }
      participantsCopy[takenParticipantNo] = takenParticipant;
      return {
        ...state,
        participants: [...participantsCopy],
        currentKwateraJustBeforeDisaccommodation: kwateraBeforeDisaccomodation,
      }
    }
      
    default:
      return state;
  }
}