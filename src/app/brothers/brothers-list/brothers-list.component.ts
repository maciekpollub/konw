import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Participant } from './../../models/participant.model';
import { Accommodation } from './../../models/accommodation.model';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap, withLatestFrom } from 'rxjs/operators'; 
import * as BroActions from '../store/brothers.actions';
import * as AccomActions from '../../accommodations/store/accommodations.actions';

@Component({
  selector: 'app-brothers-list',
  templateUrl: './brothers-list.component.html',
  styleUrls: ['./brothers-list.component.scss']
})
export class BrothersListComponent implements OnInit, OnDestroy {
  elements$: Observable<Participant[]>;
  headElements = ['#', 'Skąd', 'Kto', 'Gdzie']

  participants$: Observable<{participants: Participant[]}>;
  participants: Participant[];
  participantPotentiallyToDelete: Participant;
  filtersForm: FormGroup = new FormGroup({});
  activeFormControlName: string;
  chosenRadio = 'community';

  filtersFormSubscription: Subscription;
  
  constructor(
    private httpClient: HttpClient,
    private store: Store<{
      brothers_: { 
        participants: Participant[],
        currentParticipantId: string | number,
        currentKwateraJustBeforeDisaccommodation: string[] | string,
        participantToAdd: Participant,  
      },
      accommodations_: { accommodations: Accommodation[] }
    }>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {    
    this.httpClient.get('http://localhost:3000/listaBraci?_sort=wspolnota&_order=asc').subscribe(
      (data: Participant[]) => {
        let dataForStore = data.map((p: Participant) => {
          let extP: Participant;
          if (p.malzenstwo == '2') {
            const husbandAndWifeArray = p.imieINazwisko.split(' ');
            p['mazImie'] = husbandAndWifeArray[1];
            p['zonaImie'] = husbandAndWifeArray[3];
            extP = p;
          } else {
            extP = p;
          }
          return extP;
          })
          console.log('data for store:', dataForStore)

        this.store.dispatch(new BroActions.LoadParticipants(dataForStore))
      }
    )
    this.httpClient.get('http://localhost:3000/kwateryBuzuna').subscribe(
      (data: Accommodation[]) => {
        this.store.dispatch(new AccomActions.LoadAccommodations(data));
        console.log('To są akomodacje z initu komponentu BrothersList: ', data)    
    })

    this.elements$ = this.store.select('brothers_').pipe(
      map(pieceOfState => pieceOfState.participants),
      tap((participantsFromStore) => this.participants = participantsFromStore)
    )
    this.initFiltersForm();

  }

  private initFiltersForm() {
    this.filtersForm = new FormGroup({
      'imieINazwisko': new FormControl(null, Validators.required),
      'wspolnota': new FormControl(null, Validators.required),
      'poCzym': new FormControl('communityName', Validators.required)
      // 'kwatera': accommodationUnits,
      // 'miejsce': new FormControl(null),
      // 'prezbiter': new FormControl(participant?.prezbiter, Validators.pattern(/^[0-9]+/)),
      // 'malzenstwo': new FormControl(participant?.malzenstwo, Validators.pattern(/^[0-9]+/)),
      // 'mazMiejsce': new FormControl(null),
      // 'zonaMiejsce': new FormControl(null),
      // 'dzieciMiejsce': this.childrenAccommodations,
      // 'kobieta': new FormControl(participant?.kobieta, Validators.pattern(/^[0-9]+/)),
      // 'mezczyzna': new FormControl(participant?.mezczyzna, Validators.pattern(/^[0-9]+/)),
      // 'bobas': new FormControl(participant?.bobas, Validators.pattern(/^[0-9]+/)),
      // 'dziecko': new FormControl(participant?.dziecko, Validators.pattern(/^[0-9]+/)),
      // 'nianiaOddzielnie': new FormControl(participant?.nianiaOddzielnie, Validators.pattern(/^[0-9]+/)),
      // 'uwagi': new FormControl(participant?.uwagi),
      // 'wiek': new FormControl(participant?.wiek, Validators.pattern(/^[1-9]+[0-9]+/)),
      // 'srodekTransportu': new FormControl(participant?.srodekTransportu),
      // 'p': new FormControl(participant?.p),
      // 'noc1': new FormControl(!participant?.nieobNoc1),
      // 'noc2': new FormControl(!participant?.nieobNoc2),
      // 'noc3': new FormControl(!participant?.nieobNoc3),
    })
    this.filtersFormSubscription = this.filtersForm.valueChanges.pipe(
      withLatestFrom(this.elements$),
      map(([fValue, participantsFromStore]) => {
        this.chosenRadio = fValue.poCzym === 'communityName' ? 'community' : 'participant';
        this.participants = participantsFromStore;
        if(fValue.poCzym === 'communityName') {
          let communityNameFilteredParticipants = participantsFromStore.filter(el => {
            if (el.wspolnota && fValue.wspolnota) {
              return (el.wspolnota.toUpperCase()).indexOf(fValue.wspolnota.toUpperCase()) !== -1
            }
          });
          if (!!fValue.wspolnota.length) {
            return this.participants = communityNameFilteredParticipants
          } else {
            return this.participants = participantsFromStore;
          }
        } else {
            let participantNameFilteredParticipants = participantsFromStore.filter(el => {
            if(el && el.imieINazwisko && fValue && fValue.imieINazwisko) {
              return (el.imieINazwisko.toUpperCase()).indexOf(fValue.imieINazwisko.toUpperCase()) !== -1
            }
          });
          if (fValue.imieINazwisko && !!fValue.imieINazwisko.length) {
            return this.participants = participantNameFilteredParticipants
          } else {
            return this.participants = participantsFromStore;
          }
        }


        // if (this.activeFormControlName === 'wspolnota') {
        //   this.filtersForm.get('imieINazwisko').setValue('');
        //   let communityNameFilteredParticipants = participantsFromStore.filter(el => {
        //     return (el.wspolnota.toUpperCase()).indexOf(fValue.wspolnota.toUpperCase()) !== -1
        //   });
        //   if (!!fValue.wspolnota.length) {
        //     return this.participants = communityNameFilteredParticipants
        //   } else {
        //     return this.participants = participantsFromStore;
        //   }
        // };
        // if (this.activeFormControlName === 'imieINazwisko') {
        //   this.filtersForm.get('wspolnota').setValue('');
        //   let participantNameFilteredParticipants = participantsFromStore.filter(el => {
        //     return (el.imieINazwisko.toUpperCase()).indexOf(fValue.imieINazwisko.toUpperCase()) !== -1
        //   });
        //   if (!!fValue.imieINazwisko.length) {
        //     return this.participants = participantNameFilteredParticipants
        //   } else {
        //     return this.participants = participantsFromStore;
        //   }
        // };
      })
    ).subscribe();

  }

  

  onBrotherClick(id: number | string, part: Participant) {
    this.router.navigate(['/brothers', +id + 1]);
    this.store.dispatch(new BroActions.EditParticipant({editedParticipant: part}))
  }

  onFilterFocus(event: any) {
    this.activeFormControlName = event.target.attributes['formControlName'].value;
    console.log('to jest aktywna kontrolka: ', this.activeFormControlName)
  }

  onAccListClick() {
    this.router.navigate(['/accommodations']);
  }

  onAddParticipant() {
    this.router.navigate(['/brothers/new']);
  }

  preparePotentialParticipantToDelete(id: string) {
    let sth = this.participantPotentiallyToDelete = this.participants.find(part => part.id === id);
    console.log('to jest potencjalnie ktoś do usunięcia: ', sth)
    console.log('to jest potencjalna tablica akomodacji:  ', [...sth.kwatera])
  }

  onDeleteParticipant(id: string) {
    event.preventDefault();
    event.stopPropagation();
    console.log('to są participants na delecie: ', this.participants);
    console.log('...a to jest kwatera participanta który ma być usunięty...', [this.participantPotentiallyToDelete.kwatera]);
    for (let accId of [...this.participantPotentiallyToDelete.kwatera]) {
      this.store.dispatch(new AccomActions.FreeAccommodationOnDelete({index: accId}));
    }
    this.router.navigate(['/brothers']);
    
    this.httpClient.delete('http://localhost:3000/listaBraci/' + id ).subscribe();
    
    // this.store.dispatch(new BroActions.DeleteParticipant({index: id}));
    
  }

  ngOnDestroy() {
    if (this.filtersFormSubscription) {this.filtersFormSubscription.unsubscribe()};
  }

}
