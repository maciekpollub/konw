import { Participant } from './../../models/participant.model';
import { BrothersService } from './../brothers.service';
import * as BroActions from './brothers.actions'

const initialState = {
  participants: [],
  currentParticipantId: null,
  currentKwateraJustBeforeDisaccommodation: null,
  participantToAdd: new Participant('','','','',[],'','','','','','','','','','','','','','','',''),
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
      if(+state.currentParticipantId > 0) {
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
      };
      if(!!state.participantToAdd.imieINazwisko) {
        let nieobecnoscNoc1 = state.participantToAdd.nieobNoc1;
        return {
          ...state,
          participantToAdd: {
            ...state.participantToAdd,
            nieobNoc1: nieobecnoscNoc1 === 'tak' ? '' : 'tak'
          }
        }
      } 
    }
    case BroActions.MARK_SECOND_NIGHT: {
      if(+state.currentParticipantId > 0) {
        let participantsCopy = [...state.participants];
        let index = state.currentParticipantId;
        let takenParticipant = participantsCopy.find(p => p.id === index);
        let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
        takenParticipant = {
          ...takenParticipant,
          nieobNoc2: takenParticipant.nieobNoc2 === 'tak' ? '' : 'tak' 
        }      
        participantsCopy[takenParticipantNo] = takenParticipant;
        return {
          ...state,
          participants: [...participantsCopy]
        }
      };
      if(!!state.participantToAdd.imieINazwisko) {
        let nieobecnoscNoc2 = state.participantToAdd.nieobNoc2;
        return {
          ...state,
          participantToAdd: {
            ...state.participantToAdd,
            nieobNoc2: nieobecnoscNoc2 === 'tak' ? '' : 'tak'
          }
        }
      }
    }
    case BroActions.MARK_THIRD_NIGHT: {
      if(+state.currentParticipantId > 0) {
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
      if(!!state.participantToAdd.imieINazwisko) {
        let nieobecnoscNoc3 = state.participantToAdd.nieobNoc3;
        return {
          ...state,
          participantToAdd: {
            ...state.participantToAdd,
            nieobNoc3: nieobecnoscNoc3 === 'tak' ? '' : 'tak'
          }
        }
      }
    }
    case BroActions.MARK_ALL_NIGHTS: {
      let finalState;
      if(+state.currentParticipantId > 0) {
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
        finalState = {
          ...state,
          participants: [...participantsCopy]
        }
      };
      if(!!state.participantToAdd.imieINazwisko) {
        finalState = {
          ...state,
          participantToAdd: {
            ...state.participantToAdd,
            nieobNoc1: '',
            nieobNoc2: '',
            nieobNoc3: '',
          }
        }
      }
      return finalState;
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
        kwatera: [...takenParticipantKwatera, newAccId],
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
        kwatera: [...takenParticipantKwatera],
        p: ''
      }
      participantsCopy[takenParticipantNo] = takenParticipant;
      return {
        ...state,
        participants: [...participantsCopy],
        currentKwateraJustBeforeDisaccommodation: kwateraBeforeDisaccomodation,
      }
    }
    case BroActions.CHOOSE_NEW_PARTICIPANT_SINGLE_STATUS: {
      let participantStatus  = action.payload;
      let basicState = {
        ...state,
        participantToAdd: {
          ...state.participantToAdd,
          wspolnota: participantStatus.community,
          imieINazwisko: participantStatus.name,
          wiek: participantStatus.age,
          srodekTransportu: participantStatus.meansOfTransport,
          uwagi: participantStatus.remarks,
        }
      };
      let newState;
      if (!!participantStatus.presbiter) {
        newState =  {
          ...basicState,
          participantToAdd: {
            ...basicState.participantToAdd,
            prezbiter: action.payload.quantity
          }
        }
      } else {
        if (!!participantStatus.woman) {
          newState =  {
            ...basicState,
            participantToAdd: {
              ...basicState.participantToAdd,
              kobieta: action.payload.quantity
            }
          }  
        } else if (!!participantStatus.man) {
            newState =  {
              ...basicState,
              participantToAdd: {
                ...basicState.participantToAdd,
                mezczyzna: action.payload.quantity
              }
            }
        } else {
          newState =  {
            ...basicState,
            participantToAdd: {
              ...basicState.participantToAdd,
              nianiaOddzielnie: action.payload.quantity
            }
          }
        }
      }; 
      return newState;     
    }
    case BroActions.ACCOMMODATE_NEW_PARTICIPANT_TO_ADD: {
      let newAccId = action.payload.accomId;
      console.log('reducer z akomodacji nowego participanta ...')
      return {
        ...state,
        participantToAdd: {
          ...state.participantToAdd,
          kwatera: [...state.participantToAdd.kwatera, newAccId],
          }
      };
    }
    case BroActions.DISACCOMMODATE_NEW_PARTICIPANT_TO_ADD: {
      let pastAccId = action.payload.accomId;
      let brother: Participant = action.payload.brother;
      let kwateraBeforeDisaccomodation = brother.kwatera;
      let positionOfKwateraToExpell = brother.kwatera.lastIndexOf(pastAccId);
      let brotherKwatera = [...brother.kwatera]
      brotherKwatera.splice(positionOfKwateraToExpell, 1);
      let brotherAfterDisaccommodation: Participant;
      brotherAfterDisaccommodation = {
        ...brother,
        kwatera: [...brotherKwatera],
        p: ''
      }
      return {
        ...state,
        participantToAdd: {
          ...state.participantToAdd,
          kwatera: [...brotherKwatera],
        },
        currentKwateraJustBeforeDisaccommodation: kwateraBeforeDisaccomodation,
      }
    }
    case BroActions.REACCOMMODATE_NEW_PARTICIPANT_TO_ADD: {
      let cancelledAccId = action.payload.cancelledAccomId;
      let newAccId = action.payload.accomId;
      let brother = action.payload.brother;
      let positionToReplace = state.currentKwateraJustBeforeDisaccommodation.lastIndexOf(cancelledAccId);
      let brotherKwatera = [...brother.kwatera];
      brotherKwatera.splice(positionToReplace, 0, newAccId);
      brother = {
        ...brother,
        kwatera: brotherKwatera,
      }
      console.log('po uzupełnieniu arrayka :', [...brotherKwatera])
      return {
        ...state,
        participantToAdd: brother,
        currentKwateraJustBeforeDisaccommodation: brotherKwatera,
      }
    }
    case BroActions.CLEAR_NEW_PARTICIPANT_TO_ADD_STATE: {
      return {
        ...state,
        participantToAdd: new Participant('','','','',[],'','','','','','','','','','','','','','','',''),
      }
    }
    case BroActions.CHOOSE_NEW_PARTICIPANT_FAMILY_STATUS: {
      let participantStatus  = action.payload;
      let basicState = {
        ...state,
        participantToAdd: {
          ...state.participantToAdd,
          wspolnota: participantStatus.community,
          imieINazwisko: participantStatus.name,
          srodekTransportu: participantStatus.meansOfTransport,
          uwagi: participantStatus.remarks,
        }
      };
      let newState = {
        ...basicState,
        participantToAdd: {
          ...basicState.participantToAdd,
          malzenstwo: action.payload.marriageQty,
          bobas: action.payload.babyQty,
          dziecko: action.payload.childrenQty
        }
      }
      return newState;     
    }

      // let participantsCopy = [...state.participants];
      // let takenParticipant = participantsCopy.find(p => p.id === currPartId);
      // let takenParticipantNo = participantsCopy.indexOf(takenParticipant);
      // let takenParticipantKwatera = takenParticipant.kwatera;
      // takenParticipant = {
      //   ...takenParticipant,
      //   kwatera: [...takenParticipantKwatera, newAccId],
      // }
      // participantsCopy[takenParticipantNo] = takenParticipant;
      // return {
      //   ...state,
      //   participants: [...participantsCopy]
      // }
      
    default:
      return state;
  }
}