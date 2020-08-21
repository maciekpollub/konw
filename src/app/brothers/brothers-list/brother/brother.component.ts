

import { BrothersService } from './../../brothers.service';
import { AccommodationsActions } from './../../../accommodations/store/accommodations.actions';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Accommodation } from './../../../models/accommodation.model';
import { map, tap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators, NgModel } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription, zip, Subject, forkJoin, BehaviorSubject, concat, merge } from 'rxjs';
import * as BroActions from '../../store/brothers.actions';
import * as AccomActions from '../../../accommodations/store/accommodations.actions';
import { threadId } from 'worker_threads';



@Component({
  selector: 'app-brother',
  templateUrl: './brother.component.html',
  styleUrls: ['./brother.component.scss'],
})
export class BrotherComponent implements OnInit, OnDestroy {
  editMode = false;
  participants$: Observable<Participant[]>;
  participant$: Observable<Participant>;
  participant: Participant;
  currentParticipantId: string | number;
  childrenArray: number[] = [];
  accommodations$: Observable<Accommodation[]>;
  accommodations: Accommodation[];
  accommodation: Accommodation;
  activeSelectCtrlValue: string = '';
  childrenAccommodations = new FormArray([]);
  exemptedAccommodationsIdsToSetFreeInDB: string[] = [];
  forbiddenPlaceInSelectOptionClicked = false;
  forbiddenPlaceWithinTheSameParticipantMembersClicked = false;
  forbiddenPlaceOwner = '';
  activeFormControlName = '';
  listOfTakenAccommodationIds: string[];
  arrayOfHttpExemptingPatchObservables: Array<Observable<any>> = [];
  participantToAdd$: Observable<Participant>;
  newParticipantIsOnTheWay = false;
  newParticipantsAreOnTheWay = false;
  newParticipantOnTheWay: Participant;
  newPartToAddName = '';
  newPartToAddHusbandName = '';
  newPartToAddWifeName = '';
  newPartToAddFormValue = null;

  accommodationsExemptedByForce: string[] = [];
  @ViewChild ('unlockSingle', {static: false}) unlockSingleIcon: ElementRef;
  @ViewChild ('unlockHusband', {static: false}) unlockHusbandIcon: ElementRef;
  @ViewChild ('unlockWife', {static: false}) unlockWifeIcon: ElementRef;

  arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$ = new Subject<void>();
  arrayOfHttpAccsExemptedByForcePatchObsSubject$ = new Subject<void>();

  httpExemptedAccommodationsSubscription: Subscription;
  httpNewParticipantPostSubscription: Subscription;
  wrappedHttpExemptedAccommodationsSubscription: Subscription;
  modeSubscription: Subscription;
  listOfTakenAccommodationIdsSubscribe: Subscription;
  accommodationsSubscribe: Subscription;
  formValueSubscription: Subscription;
  kwatery: Subscription;

  pForm: FormGroup = new FormGroup({});

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private store: Store<{
      brothers_: { 
        participants: Participant[],
        currentParticipantId: string | number,
        currentKwateraJustBeforeDisaccommodation: string[] | string,
        participantToAdd: Participant,  
      },
      accommodations_: { accommodations: Accommodation[] }
    }>) {}

  ngOnInit(): void {
    console.log('znowu się kurcze init wywołał...')
    this.modeSubscription = this.store.select('brothers_').subscribe((brothersState) => {
      console.log('brothers state: ', brothersState.participants)
      const currentId = brothersState.currentParticipantId;
      this.editMode = !!currentId;
      if (this.editMode) { this.currentParticipantId = currentId };
    })
    this.accommodations$ = this.store.select('accommodations_').pipe(
      map(object => object.accommodations),
      tap(accs => this.accommodations = accs)
      );
    this.participants$ = this.store.select('brothers_').pipe(
      map(object => object.participants));
    this.participantToAdd$ = this.store.select('brothers_').pipe(
      map(object => object.participantToAdd));


    this.listOfTakenAccommodationIdsSubscribe = this.accommodations$.pipe(
      map((accommodations: Accommodation[]) => {
        let takenAccs = accommodations.filter(el => el.imieINazwisko !== '');
        return takenAccs;
        }
      ),
      tap((accommodations: Accommodation[]) => {
        this.listOfTakenAccommodationIds = [];
        accommodations.forEach(el => this.listOfTakenAccommodationIds.push(el.id))
      }),
      ).subscribe(() => console.log('This is the list of taken acc ids: ', this.listOfTakenAccommodationIds))

    this.initForm();
  }

  private initForm() {
    // this.accommodationsSubscribe = this.accommodations$.subscribe((accs) => this.accommodations = accs);
    let accommodationUnits = new FormArray([]);

    if (this.editMode) {
      this.participant$ = this.participants$.pipe(
        map((participants) => {
          this.participant = participants.find(el => el.id === this.currentParticipantId);
          if (!!this.participant.dziecko && +this.participant.dziecko !== this.childrenArray.length) {  
            if (this.participant.malzenstwo === '1' ||
               (this.participant.kobieta === '1' || this.participant.mezczyzna === '1')) {
              this.generateChildrenControls(this.participant, 1);
            } else {
              this.generateChildrenControls(this.participant, 2);
            }
          }
          return this.participant;
        }),
        tap((participant: Participant) => {
          this.pForm = new FormGroup({
            'imieINazwisko': new FormControl(participant?.imieINazwisko, Validators.required),
            'wspolnota': new FormControl(participant?.wspolnota, Validators.required),
            'kwatera': accommodationUnits,
            'miejsce': new FormControl(null),
            'prezbiter': new FormControl(participant?.prezbiter, Validators.pattern(/^[0-9]+/)),
            'malzenstwo': new FormControl(participant?.malzenstwo, Validators.pattern(/^[0-9]+/)),
            'mazMiejsce': new FormControl(null),
            'zonaMiejsce': new FormControl(null),
            'dzieciMiejsce': this.childrenAccommodations,
            'kobieta': new FormControl(participant?.kobieta, Validators.pattern(/^[0-9]+/)),
            'mezczyzna': new FormControl(participant?.mezczyzna, Validators.pattern(/^[0-9]+/)),
            'bobas': new FormControl(participant?.bobas, Validators.pattern(/^[0-9]+/)),
            'dziecko': new FormControl(participant?.dziecko, Validators.pattern(/^[0-9]+/)),
            'nianiaOddzielnie': new FormControl(participant?.nianiaOddzielnie, Validators.pattern(/^[0-9]+/)),
            'uwagi': new FormControl(participant?.uwagi),
            'wiek': new FormControl(participant?.wiek, Validators.pattern(/^[1-9]+[0-9]+/)),
            'srodekTransportu': new FormControl(participant?.srodekTransportu),
            'p': new FormControl(participant?.p),
            'noc1': new FormControl(!participant?.nieobNoc1),
            'noc2': new FormControl(!participant?.nieobNoc2),
            'noc3': new FormControl(!participant?.nieobNoc3),
          })
          for (let accUnit of participant.kwatera) {
            accommodationUnits.push(new FormGroup({
              'miejsce': new FormControl(accUnit, Validators.required)
            }));
          }
          if (this.participant.kobieta == '1' || this.participant.mezczyzna == '1' || this.participant.prezbiter == '1') {
            this.pForm.patchValue({
              'miejsce': this.participant.kwatera[0]
      
            })
          }
          if (this.participant.malzenstwo == '2') {
            this.pForm.patchValue({
              'mazMiejsce': (this.participant.kwatera)[0],
              'zonaMiejsce': (this.participant.kwatera)[1],
            });
            console.log('obecny FORM: ', this.pForm.value)
          }
          if (participant.kwatera.length === +participant.kobieta + +participant.mezczyzna + 
            +participant.prezbiter + +participant.malzenstwo + +participant.dziecko) {
            this.pForm.patchValue({
              'p': 'tak'
            })  
          }
          
        }),
        tap(() => this.formValueSubscription = this.pForm.valueChanges.subscribe(
          (val) => {
            console.log('To jest form:', this.pForm.controls);
            console.log('kwatera teraz...........:', this.pForm.controls.kwatera)
            console.log('obecnie obsługiwany participant:', this.participant);
            console.log('stan dla accommodatinos: ', this.accommodations);
            console.log('status kontrolki dzieciMiejsce: ----------', this.pForm.controls.dzieciMiejsce)
          }))
      )
    } else {
      this.pForm = new FormGroup({
        'imieINazwisko': new FormControl('', Validators.required),
        'wspolnota': new FormControl('', Validators.required),
        'kwatera': accommodationUnits,
        'miejsce': new FormControl(null),
        'prezbiter': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'malzenstwo': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'mazMiejsce': new FormControl(null),
        'zonaMiejsce': new FormControl(null),
        'dzieciMiejsce': this.childrenAccommodations,
        'kobieta': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'mezczyzna': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'bobas': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'dziecko': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'nianiaOddzielnie': new FormControl('', Validators.pattern(/^[0-9]+/)),
        'uwagi': new FormControl(''),
        'wiek': new FormControl('', Validators.pattern(/^[1-9]+[0-9]+/)),
        'srodekTransportu': new FormControl(''),
        'p': new FormControl(null),
        'noc1': new FormControl(''),
        'noc2': new FormControl(''),
        'noc3': new FormControl(''),
      });
      
      this.pForm.valueChanges.pipe(
        withLatestFrom(this.participantToAdd$),
        map(([formValue, participantInStore]) => {
          return {fV: formValue, pS: participantInStore}
        }),
      ).subscribe(({fV, pS}) => {
        this.newPartToAddFormValue = fV;
        console.log('To jest nowy fV: ', fV)
        this.newParticipantIsOnTheWay = 
        (fV.imieINazwisko && fV.wspolnota && (+fV.prezbiter > 0 || +fV.kobieta > 0 || +fV.mezczyzna > 0 || +fV.nianiaOddzielnie > 0)) ? true : false;
        // this.newParticipantOnTheWay = {...pS};
        this.newParticipantOnTheWay = {...pS};
        this.newParticipantsAreOnTheWay = 
        (fV.imieINazwisko && fV.wspolnota && +fV.malzenstwo > 0) ? true : false;
        if (fV.malzenstwo === 2) {
          fV.mazMiejsce = '';
          fV.zonaMiejsce = '';
        }
        if (fV.malzenstwo === 1) {
          fV.mazMiejsce = ''
        }
        if (!!fV.dziecko && !this.childrenArray.length) {  
          if (fV.malzenstwo == 1 ) {
            this.generateChildrenControls(pS, 1);
          };
          if (fV.malzenstwo == 2) {
            this.generateChildrenControls(pS, 2);
          };
        }
        if (this.newParticipantsAreOnTheWay) {
          console.log('to jest form dla nowego rodzinnego PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP: ', this.newPartToAddFormValue)
          this.store.dispatch(new BroActions.ChooseNewParticipantFamilyStatus(
          {
            marriageQty: this.newPartToAddFormValue.malzenstwo,
            babyQty: this.newPartToAddFormValue.bobas,
            childrenQty: this.newPartToAddFormValue.dziecko,
            community: this.newPartToAddFormValue.wspolnota,
            name: this.newPartToAddFormValue.imieINazwisko,
            meansOfTransport: this.newPartToAddFormValue.srodekTransportu,
            remarks: this.newPartToAddFormValue.uwagi
        }))};
        this.newParticipantOnTheWay = {...pS};
        this.newPartToAddHusbandName = (this.newParticipantOnTheWay.imieINazwisko.split(' '))[1];
        this.newPartToAddWifeName = (this.newParticipantOnTheWay.imieINazwisko.split(' '))[3];
        console.log('-------------------------------------to jest pS ze stora w takcie valuChanges: ', this.newParticipantOnTheWay)
        this.newPartToAddName = fV.imieINazwisko;
        if (pS && pS.kwatera && pS.kwatera.length) {
           for (let accUnit of pS.kwatera) {
            fV.kwatera.push(new FormGroup({
              'miejsce': new FormControl(accUnit, Validators.required)
              }));
            }
        }
      });
    }

  }

  onFocus(event: any) {
    this.activeFormControlName = event.target.attributes['formControlName'].value;
  }

  onAccSelectOptionMousemove(event: any) {
    let value = event.target.value;
    this.activeSelectCtrlValue = value;
    console.log('mousemove: ', this.activeSelectCtrlValue);
    // console.log('to jest kontrolka wartośćkontrolki mazMiejsce i zona Miejsce: ', this.pForm.controls.mazMiejsce.value)
  }

  onForeignPlaceClick = (event: any) => {
    // this.accommodations$.subscribe(a => this.accommodations = a);
    let chosenId = event.target.value;
    let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
    console.log('to jest brother: ', brother)
    if (
      !!brother.kwatera.length && brother.kwatera.length === 
      +brother.kobieta + +brother.mezczyzna + +brother.prezbiter + 
      +brother.malzenstwo + +brother.dziecko +
      +brother.nianiaOddzielnie) {
        console.log('zupa pomidorowa!!!!!!!!!!!!!!!!!!')
        this.pForm.patchValue({
          'p': 'tak'
        })
        
    }

    console.log('to są akomodacje: ', this.accommodations)
    // this.forbiddenPlaceOwner = this.accommodations?.find(el => el.id === chosenId).imieINazwisko;
    this.forbiddenPlaceOwner = (this.accommodations?.find(el => el.id === chosenId))?.imieINazwisko;
    console.log('This is again list of taaaken acc ids: ', this.listOfTakenAccommodationIds);
    if ( this.listOfTakenAccommodationIds.indexOf(chosenId) !== -1 && brother?.kwatera.indexOf(chosenId) === -1) {
      this.forbiddenPlaceInSelectOptionClicked = true;
    }  
  }

  onAccSelectOptionChange(event: any) {
    let value = event.target.value;
    this.participantToAdd$.subscribe((p) => this.newParticipantOnTheWay = p)
    let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
    console.log('to jest brohter na początku on Accslect....:', brother)
    console.log('a to jest value: ', value)
    if (this.activeSelectCtrlValue === '' && brother?.p !== 'tak') {
      console.log('To jest lista zajętych miejsc na chwilę obecną...:', this.listOfTakenAccommodationIds)
      console.log('...a to jest value obecne: ', value)
      if (this.listOfTakenAccommodationIds.indexOf(value) === -1) {
        this.store.dispatch(new AccomActions.TakeAccommodation({ accomIndex: value, participant: brother}));
        if (this.editMode) {
          this.store.dispatch(new BroActions.AccommodateParticipant({ accomId: value, currPartId: this.currentParticipantId }));
        } else {
          if (this.newParticipantIsOnTheWay) {
            console.log('to jest form dla nowego P  któ©y teraz sprawdzamy: ', this.newPartToAddFormValue)
            this.store.dispatch(new BroActions.ChooseNewParticipantSingleStatus(
            {
              presbiter: !!this.newPartToAddFormValue.prezbiter,
              woman: !!this.newPartToAddFormValue.kobieta,
              man: !!this.newPartToAddFormValue.mezczyzna,
              separateNanny: !!this.newPartToAddFormValue.nianiaOddzielnie,
              quantity: (+this.newPartToAddFormValue.prezbiter + +this.newPartToAddFormValue.kobieta + +this.newPartToAddFormValue.mezczyzna + +this.newPartToAddFormValue.nianiaOddzielnie).toString(),
              community: this.newPartToAddFormValue.wspolnota,
              name: this.newPartToAddFormValue.imieINazwisko,
              age: this.newPartToAddFormValue.wiek,
              meansOfTransport: this.newPartToAddFormValue.srodekTransportu,
              remarks: this.newPartToAddFormValue.uwagi
          }))};

          this.store.dispatch(new BroActions.AccommodateNewParticipantToAdd({accomId: value}))
          
          this.participantToAdd$.subscribe(
            d => console.log('to jest brother tuż po akcji accommodateNewPartcipantToAdd: ', d)
          )
        }
        
      
      } else {
        if (brother.kwatera.indexOf(value) === -1) {
          this.forbiddenPlaceInSelectOptionClicked = true;
        } else {
          this.forbiddenPlaceWithinTheSameParticipantMembersClicked = true;
          let childAccIds = [...brother.kwatera].splice(2, brother.kwatera.length);
          for (let accId of childAccIds) {
            this.store.dispatch(new AccomActions.FreeAccommodation({index: accId}));
            if (this.editMode) {
              this.store.dispatch(new BroActions.DisaccommodateParticipant({accomId: accId, currPartId: this.currentParticipantId}))
            } else {
              this.store.dispatch(new BroActions.DisaccommodateNewParticipantToAdd({accomId: accId, brother: this.newParticipantOnTheWay}))
            }
            
          }
        }     
      }
    } else {
      console.log('to się dzieje .... i aktywną wartością w selekcie jest :', this.activeSelectCtrlValue)
      if (
        brother.kwatera.indexOf(this.activeSelectCtrlValue) === brother.kwatera.lastIndexOf(this.activeSelectCtrlValue)
        && 
        this.listOfTakenAccommodationIds.indexOf(value) === -1) {
        this.store.dispatch(new AccomActions.FreeAccommodation({ index: this.activeSelectCtrlValue }));
        if (this.editMode) {
          this.store.dispatch(new BroActions.DisaccommodateParticipant({ accomId: this.activeSelectCtrlValue, currPartId: this.currentParticipantId}));
          this.exemptedAccommodationsIdsToSetFreeInDB.push(this.activeSelectCtrlValue);
        } else {
          console.log('to jest new ParticipantONTheWay: ', this.newParticipantOnTheWay)
          this.store.dispatch(new BroActions.DisaccommodateNewParticipantToAdd({accomId: this.activeSelectCtrlValue, brother: this.newParticipantOnTheWay}))
        }
        this.store.dispatch(new AccomActions.TakeAccommodation({ accomIndex: value, participant: brother }));
        if (this.editMode) {
          this.store.dispatch(new BroActions.ReaccommodateParticipant({cancelledAccomId: this.activeSelectCtrlValue, accomId: value, currPartId: this.currentParticipantId}));
        } else {
          this.store.dispatch(new BroActions.ReaccommodateNewParticipantToAdd({cancelledAccomId: this.activeSelectCtrlValue, accomId: value, brother: this.newParticipantOnTheWay}));
        }
        
      } else {
        if (brother.kwatera.indexOf(this.activeSelectCtrlValue) 
        !== brother.kwatera.lastIndexOf(this.activeSelectCtrlValue)) {
          this.forbiddenPlaceWithinTheSameParticipantMembersClicked = true;
        }
      };
    }
    console.log('to jest newParticipantToAdd: ', this.newParticipantOnTheWay);
    
    if (this.editMode && this.exemptedAccommodationsIdsToSetFreeInDB.length !== 0) {
      let verifiedExemptedAccIdArray:string[] = []; 
      let exemptedAccsAtTheTimeOfSubmit = this.accommodations.filter(acc => {
          return this.exemptedAccommodationsIdsToSetFreeInDB.indexOf(acc.id) !== -1;
      })    
      for (let acc of exemptedAccsAtTheTimeOfSubmit) {
        if (!acc.przydzial) {verifiedExemptedAccIdArray.push(acc.id)}
      }
      console.log('verified:......................', verifiedExemptedAccIdArray)
      this.arrayOfHttpExemptingPatchObservables =
      this.generateArrayOfHttpExemptingPatchObservables(verifiedExemptedAccIdArray);
    }
  }

  onAddAccommodationUnit() {
    (this.pForm.get('kwatera') as FormArray).push(
      new FormGroup({
        'miejsce': new FormControl(null, Validators.required)
      })
    )
  }

  onDeleteAccommodationUnit(index: number) {
    console.log('na deletie:', this.getControls());
    let ctrlAccUnit = (this.pForm.get('kwatera') as FormArray).controls[index].get('miejsce').value;
    console.log('ctrlAccUnit: ', ctrlAccUnit);
    (this.pForm.get('kwatera') as FormArray).controls.splice(index, 1);
    this.store.dispatch(new AccomActions.FreeAccommodation({ index: ctrlAccUnit }))
    return (this.pForm.get('kwatera') as FormArray).controls;
  }

  onBackToList() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    if (this.newParticipantOnTheWay)  {
      this.store.dispatch(new BroActions.DisaccommodateNewParticipantToAdd({accomId: this.activeSelectCtrlValue, brother: this.newParticipantOnTheWay}));
    }
    this.store.dispatch(new BroActions.ClearNewParticipantToAddState());
    console.log('changed indices: ', this.exemptedAccommodationsIdsToSetFreeInDB)
    if (!!this.accommodationsExemptedByForce.length) {
      zip(...this.generateArrayOfHttpExemptingPatchObservables(this.accommodationsExemptedByForce)).pipe(
        map(data => data.reduce((result, arr) => [...result, ...arr], [])),
        takeUntil(this.arrayOfHttpAccsExemptedByForcePatchObsSubject$)
      ).subscribe();
    }
  }

  onForceAccExemptionClick(accId: string, whoseIcon: string) {
    this.accommodationsExemptedByForce.push(accId);
    console.log('-----------', this.accommodationsExemptedByForce)
    console.log('Tp jest accId które jest inputowane oraz whoseIcon: ', accId, whoseIcon)
    this.store.dispatch(new AccomActions.FreeAccommodation({index: accId}));
    this[whoseIcon].nativeElement.setAttribute('style', 'background: #f28f8f; border: 1px solid #f28f8f');

  }

  onSubmit() {
    let arrayOfStringAccUnits: string[] = [];
    for (let control of this.getControls()) {
      arrayOfStringAccUnits.push(control.get('miejsce').value)
    }

    if (this.editMode) {
      let updatedP: Participant;
      if (!!this.participant.malzenstwo) {
        arrayOfStringAccUnits = [];
        arrayOfStringAccUnits.push(
          this.pForm.value['mazMiejsce'],
          this.pForm.value['zonaMiejsce']
        );
        if (!!this.participant.dziecko) {
          for (let ctrl of this.getChildrenControls()) {
            arrayOfStringAccUnits.push(ctrl.value.miejsceDziecka)
          }
        }
      } else {
        arrayOfStringAccUnits = [];
        arrayOfStringAccUnits.push(this.pForm.value['miejsce']);
      };
      updatedP = new Participant(
        this.currentParticipantId,
        this.participant.wspolnota,
        this.participant.imieINazwisko,
        '',
        arrayOfStringAccUnits,
        this.participant.prezbiter,
        this.participant.malzenstwo,
        this.participant.kobieta,
        this.participant.mezczyzna,
        this.participant.bobas,
        this.participant.dziecko,
        // 16.08 this.participant.p,
        this.pForm.get('p').value,
        this.participant.nianiaOddzielnie,
        this.participant.uwagi,
        this.participant.wiek,
        this.participant.srodekTransportu,
        this.participant.mazImie,
        this.participant.zonaImie,
        this.participant.nieobNoc1,
        this.participant.nieobNoc2,
        this.participant.nieobNoc3,
      );
      let httpBrothersListObservable$ = this.httpClient.patch(
        'http://localhost:3000/listaBraci/' + this.currentParticipantId,
        updatedP,
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          responseType: 'json',
        }
      );
      let arrayOfHttpAccommodations = this.generateArrayOfHttpPatchObservables();
      let arrayOfHttpAccsAndBrListObsAndExmptPatchObs: Array<Observable<any>> =
      [...this.arrayOfHttpExemptingPatchObservables, ...arrayOfHttpAccommodations, httpBrothersListObservable$];
      console.log('jestem tutaj......')
      console.log('to jest ta nowa tablica: ', arrayOfHttpAccsAndBrListObsAndExmptPatchObs)
      // let arrayOfHttpRequests = [...arrayOfHttpAccsAndBrListObsAndExmptPatchObs]; 
      if (this.exemptedAccommodationsIdsToSetFreeInDB.length !== 0) {
        zip(...arrayOfHttpAccsAndBrListObsAndExmptPatchObs).pipe(
          tap(d => console.log('To jest tużpo zipie: ', d)),
          map(data => data.reduce((result,arr) => [...result, ...arr], [])),
          tap(d => console.log('A to jest jeszcze po mapie: ', d)),
          takeUntil(this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$)
        ).subscribe(
          (data) => {
            console.log('Wysyłam dane do serwera z patcha!', data);
          });
          this.router.navigate(['../'], { relativeTo: this.activatedRoute })

      } else {
        zip(...arrayOfHttpAccsAndBrListObsAndExmptPatchObs).pipe(
          map(data => data.reduce((result, arr) => [...result, ...arr], [])),
          takeUntil(this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$)
        ).subscribe(
          (data) => {
            console.log('Wysyłam dane do serwera z patcha!', data);
          }
        );
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }

    } else {
      let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
      this.newParticipantIsOnTheWay = false;
      let participantToAdd: Participant;
      if (+this.newParticipantOnTheWay.malzenstwo > 0) {
        arrayOfStringAccUnits = [];
        if (+this.newParticipantOnTheWay.malzenstwo === 1) arrayOfStringAccUnits.push(this.newParticipantOnTheWay.kwatera[0]);
        if (+this.newParticipantOnTheWay.malzenstwo === 2) {
          arrayOfStringAccUnits.push(this.newParticipantOnTheWay.kwatera[0], this.newParticipantOnTheWay.kwatera[1]);
        }
        console.log('to jest array OfSTringUnits na submicie: -------------', arrayOfStringAccUnits)
        if (!!brother.dziecko) {
          for (let ctrl of this.getChildrenControls()) {
            arrayOfStringAccUnits.push(ctrl.value.miejsceDziecka)
          }
        }
      } else {
        arrayOfStringAccUnits = [];
        arrayOfStringAccUnits.push(this.pForm.value['miejsce']);
      };
      participantToAdd = new Participant(
        '',
        this.newParticipantOnTheWay.wspolnota,
        this.newParticipantOnTheWay.imieINazwisko,
        '',
        arrayOfStringAccUnits,
        this.newParticipantOnTheWay.prezbiter,
        this.newParticipantOnTheWay.malzenstwo,
        this.newParticipantOnTheWay.kobieta,
        this.newParticipantOnTheWay.mezczyzna,
        this.newParticipantOnTheWay.bobas,
        this.newParticipantOnTheWay.dziecko,
        this.pForm.get('p').value,
        this.newParticipantOnTheWay.nianiaOddzielnie,
        this.newParticipantOnTheWay.uwagi,
        this.newParticipantOnTheWay.wiek,
        this.newParticipantOnTheWay.srodekTransportu,
        this.newParticipantOnTheWay.mazImie,
        this.newParticipantOnTheWay.zonaImie,
        this.newParticipantOnTheWay.nieobNoc1,
        this.newParticipantOnTheWay.nieobNoc2,
        this.newParticipantOnTheWay.nieobNoc3,
      );
      delete participantToAdd.id;
      console.log('to jest submitowany paricpant dodawany do b d : ', participantToAdd)
      let httpNewParticipantPost$ = this.httpClient.post('http://localhost:3000/listaBraci', participantToAdd, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Credentials': 'true',
        })
      });

      let arrayOfHttpAccommodations = this.generateArrayOfHttpPatchObservables();
      this.httpNewParticipantPostSubscription = zip(httpNewParticipantPost$, ...arrayOfHttpAccommodations).pipe(
        map(data => data.reduce((result, arr) => [...result, ...arr], []))
      ).subscribe();
    }
    this.store.dispatch(new BroActions.ClearNewParticipantToAddState());
    this.pForm.reset();
  }

  generateChildrenControls = (participant: Participant, numberOfParents: number) => {
    console.log('wykonała się metoda generateChildrenControls....!!!')
    let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
    let childrenAccs = [];
    if (participant.kwatera.length > 0) {
      childrenAccs = [...brother.kwatera];
    } else {
      let numberOfFamilyMembers = +brother.dziecko + numberOfParents;
      for (let i = 0; i < numberOfFamilyMembers; i++) {
        childrenAccs.push(null)
      }
    }
    childrenAccs.splice(0, numberOfParents);  
    for (let i = 1; i < +brother.dziecko + 1; i++) {
      this.childrenArray.push(i);
      this.childrenAccommodations.push(new FormGroup({
        'miejsceDziecka' : new FormControl(childrenAccs[i-1])
      }))
    }
    return this.childrenAccommodations;      
  }

  generateArrayOfHttpPatchObservables = () => {
    let arrayOfHttpPatchObservables: Array<Observable<any>> = [];
    let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
    for (let updatedAccId of [...brother.kwatera]) {
      let currentUpdatedAccPart = {
        id: updatedAccId,
        przydzial: 'tak',
        imieINazwisko: brother.imieINazwisko,
        wspolnota: brother.wspolnota,
        wolnePrzezNoc1: brother.nieobNoc1,
        wolnePrzezNoc2: brother.nieobNoc2 ,
        wolnePrzezNoc3: brother.nieobNoc3 
      }
      let httpPatchObs$: Observable<any> = this.httpClient.patch(
        'http://localhost:3000/kwateryBuzuna/' + updatedAccId,
        currentUpdatedAccPart,
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          responseType: 'json',
        }
      );
      arrayOfHttpPatchObservables.push(httpPatchObs$);
    }
    // console.log('To jest tablica z patch obses: ', arrayOfHttpPatchObservables)
    return arrayOfHttpPatchObservables;
  }

  generateArrayOfHttpExemptingPatchObservables = (arrayOfIds: string[]) => {
    let arrayOfHttpExemptingPatchObservables: Array<Observable<any>> = [];
    for (let id of arrayOfIds) {
      let currentUpdatedAccPart = {
        id: id,
        przydzial: '',
        imieINazwisko: '',
        wspolnota: '',
        wolnePrzezNoc1: '',
        wolnePrzezNoc2: '',
        wolnePrzezNoc3: '', 
      }
      console.log('=to jest w parchu to wyczyszczenia zajętości: ', currentUpdatedAccPart)
      let httpPatchObs$: Observable<any> = this.httpClient.patch(
        'http://localhost:3000/kwateryBuzuna/' + id,
        currentUpdatedAccPart,
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
          },
          responseType: 'json',
        }
      );
      arrayOfHttpExemptingPatchObservables.push(httpPatchObs$);
    }
    return arrayOfHttpExemptingPatchObservables;
  }
  

  getControls = () => {
    return (this.pForm.get('kwatera') as FormArray).controls;
  }

  getChildrenControls = () => {
    let a = (this.pForm.get('dzieciMiejsce') as FormArray).controls;
    return a;
  }

  onCloseModal = () => {
    this.forbiddenPlaceInSelectOptionClicked = false;
    this.forbiddenPlaceOwner = '';
    let actFormCtrlName: string  = this.activeFormControlName;
    this.pForm.patchValue({
      [actFormCtrlName]: null,
    });
    let brother = this.editMode ? this.participant : this.newParticipantOnTheWay;
    if (actFormCtrlName = 'miejsceDziecka') {
      switch (brother.dziecko.toString()) {
        case '1': {
          this.pForm.patchValue({
            'dzieciMiejsce': [
              {
                'miejsceDziecka': null
              }
            ]
          })
        }
        case '2': {
          this.pForm.patchValue({
            'dzieciMiejsce': [
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              }
            ]
          })
        }
        case '3': {
          this.pForm.patchValue({
            'dzieciMiejsce': [
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              }
            ]
          })
        }
        case '4': {
          this.pForm.patchValue({
            'dzieciMiejsce': [
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              },
              {
                'miejsceDziecka': null
              }
            ]
          })
        }
        default: console.log('sth went wrong in switch brotherComponent.ts')
      } 
    }
    this.forbiddenPlaceWithinTheSameParticipantMembersClicked = false;
  }

  ngOnDestroy() {
    this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$.next();
    this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$.complete();
    this.arrayOfHttpAccsExemptedByForcePatchObsSubject$.next();
    this.arrayOfHttpAccsExemptedByForcePatchObsSubject$.complete();
    if (this.httpExemptedAccommodationsSubscription) { this.httpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.httpNewParticipantPostSubscription) { this.httpNewParticipantPostSubscription.unsubscribe()};
    if (this.wrappedHttpExemptedAccommodationsSubscription) { this.wrappedHttpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.modeSubscription) { this.modeSubscription.unsubscribe() };
    if (this.formValueSubscription) { this.formValueSubscription.unsubscribe() };
    if (this.listOfTakenAccommodationIdsSubscribe) { this.listOfTakenAccommodationIdsSubscribe.unsubscribe()};
    if (this.accommodationsSubscribe) { this.accommodationsSubscribe.unsubscribe()};
    if (this.kwatery) { this.kwatery.unsubscribe() };
  }
}
