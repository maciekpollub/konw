import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrothersService } from './../../brothers.service';
import { AccommodationsActions } from './../../../accommodations/store/accommodations.actions';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Accommodation } from './../../../models/accommodation.model';
import { map, tap, take, takeUntil } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription, zip, Subject, forkJoin, BehaviorSubject, concat, merge } from 'rxjs';
import * as BroActions from '../../store/brothers.actions';
import * as AccomActions from '../../../accommodations/store/accommodations.actions';


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

  arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$ = new Subject<void>();

  httpExemptedAccommodationsSubscription: Subscription;
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
      brothers_: { participants: Participant[], currentParticipantId: string | number, currentKwateraJustBeforeDisaccommodation: string[] | string },
      accommodations_: { accommodations: Accommodation[] }
    }>) { }

    restApi = window.location.host.includes('localhost') ? 
              "http://" + window.location.host.replace('4200','3000') :
              window.location.protocol + '://' + window.location.host + ':3000';


  ngOnInit(): void {
    this.modeSubscription = this.store.select('brothers_').subscribe((brothersState) => {
      console.log('brothers state: ', brothersState.participants)
      const currentId = brothersState.currentParticipantId;
      this.editMode = !!currentId;
      if (this.editMode) { this.currentParticipantId = currentId };
    })
    this.accommodations$ = this.store.select('accommodations_').pipe(
      map(object => object.accommodations));
    this.participants$ = this.store.select('brothers_').pipe(
      map((object) => object.participants));

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
    this.accommodationsSubscribe = this.accommodations$.subscribe((accs) => this.accommodations = accs);
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
          if (this.participant.kobieta === '1' || this.participant.mezczyzna === '1') {
            this.pForm.patchValue({
              'miejsce': this.participant.kwatera[0]
      
            })
          }
          if (this.participant.malzenstwo === '2') {
            this.pForm.patchValue({
              'mazMiejsce': this.participant.kwatera[0],
              'zonaMiejsce': this.participant.kwatera[1],
            });
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
        'imieINazwisko': new FormControl(null, Validators.required),
        'wspolnota': new FormControl(null, Validators.required),
        'kwatera': accommodationUnits,
        'miejsce': new FormControl(null),
        'prezbiter': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'malzenstwo': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'mazMiejsce': new FormControl(null),
        'zonaMiejsce': new FormControl(null),
        'kobieta': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'mezczyzna': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'bobas': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'dziecko': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'nianiaOddzielnie': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'uwagi': new FormControl(null),
        'wiek': new FormControl(null, Validators.pattern(/^[1-9]+[0-9]+/)),
        'srodekTransportu': new FormControl(null),
        'p': new FormControl(null)
      })
      // this.kwatery = this.pForm.get('kwatera').valueChanges.subscribe(d => console.log('dane z kwatery:', d))
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
    let chosenId = event.target.value;
    this.forbiddenPlaceOwner = this.accommodations.find(el => el.id === chosenId).imieINazwisko;
    console.log('This is again list of taaaken acc ids: ', this.listOfTakenAccommodationIds);
    if ( this.listOfTakenAccommodationIds.indexOf(chosenId) !== -1 && this.participant.kwatera.indexOf(chosenId) === -1) {
      this.forbiddenPlaceInSelectOptionClicked = true;
    }
  }

  onAccSelectOptionChange(event: any) {
    let value = event.target.value;
    if (this.activeSelectCtrlValue === '' && this.participant.p === '') {
      if (this.listOfTakenAccommodationIds.indexOf(value) === -1) {
      this.store.dispatch(new AccomActions.TakeAccommodation({ accomIndex: value, participant: this.participant}));
      this.store.dispatch(new BroActions.AccommodateParticipant({ accomId: value, currPartId: this.currentParticipantId }));
      } else {
        if (this.participant.kwatera.indexOf(value) === -1) {
          this.forbiddenPlaceInSelectOptionClicked = true;
        } else {
          this.forbiddenPlaceWithinTheSameParticipantMembersClicked = true;
          let childAccIds = [...this.participant.kwatera].splice(2, this.participant.kwatera.length);
          for (let accId of childAccIds) {
            this.store.dispatch(new AccomActions.FreeAccommodation({index: accId}));
            this.store.dispatch(new BroActions.DisaccommodateParticipant({accomId: accId, currPartId: this.currentParticipantId}))
          }
        }     
      }
    } else {
      if (
        this.participant.kwatera.indexOf(this.activeSelectCtrlValue) 
        === this.participant.kwatera.lastIndexOf(this.activeSelectCtrlValue)
        && 
        this.listOfTakenAccommodationIds.indexOf(value) === -1) {
        this.store.dispatch(new AccomActions.FreeAccommodation({ index: this.activeSelectCtrlValue }));
        this.store.dispatch(new BroActions.DisaccommodateParticipant({ accomId: this.activeSelectCtrlValue, currPartId: this.currentParticipantId}));
        this.exemptedAccommodationsIdsToSetFreeInDB.push(this.activeSelectCtrlValue);
        this.store.dispatch(new AccomActions.TakeAccommodation({ accomIndex: value, participant: this.participant }));
        this.store.dispatch(new BroActions.ReaccommodateParticipant({cancelledAccomId: this.activeSelectCtrlValue, accomId: value, currPartId: this.currentParticipantId}));
      } else {
        if (this.participant.kwatera.indexOf(this.activeSelectCtrlValue) 
        !== this.participant.kwatera.lastIndexOf(this.activeSelectCtrlValue)) {
          this.forbiddenPlaceWithinTheSameParticipantMembersClicked = true;
        }
        // console.log('llllllllllllllllllllllllll', this.activeFormControlName);
      };
    }
    if (this.exemptedAccommodationsIdsToSetFreeInDB.length !== 0) {
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
    this.router.navigate(['../'], { relativeTo: this.activatedRoute })
    this.store.select('accommodations_').subscribe(d => console.log('stan accommodations: ', d));
    console.log('changed indices: ', this.exemptedAccommodationsIdsToSetFreeInDB)
  }

  onSubmit() {
    let arrayOfStringAccUnits: string[] = [];
    for (let control of this.getControls()) {
      arrayOfStringAccUnits.push(control.get('miejsce').value)
    }
    let updatedP: Participant;

    if (this.editMode) {
      console.log('hej byłem w trybie edycji!');
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
        this.participant.p,
        this.participant.nianiaOddzielnie,
        this.participant.uwagi,
        this.participant.wiek,
        this.participant.srodekTransportu,
        this.participant.nieobNoc1,
        this.participant.nieobNoc2,
        this.participant.nieobNoc3,
      );

      // if (this.exemptedAccommodationsIdsToSetFreeInDB.length !== 0) {
      //   let verifiedExemptedAccIdArray:string[] = []; 
      //   let exemptedAccsAtTheTimeOfSubmit = this.accommodations.filter(acc => {
      //       return this.exemptedAccommodationsIdsToSetFreeInDB.indexOf(acc.id) !== -1;
      //   })    
      //   for (let acc of exemptedAccsAtTheTimeOfSubmit) {
      //     if (!acc.przydzial) {verifiedExemptedAccIdArray.push(acc.id)}
      //   }
      //   console.log('verified:......................', verifiedExemptedAccIdArray)
      //   this.arrayOfHttpExemptingPatchObservables =
      //   this.generateArrayOfHttpExemptingPatchObservables(verifiedExemptedAccIdArray);
      //   console.log('to są patche  ktor mają zwonić pokoje na submici', this.arrayOfHttpExemptingPatchObservables);
      // }

      let httpBrothersListObservable$ = this.httpClient.patch(
        'http://localhost:3000/listaBraci/' + this.currentParticipantId,
        // this.restApi + '/listaBraci/' + this.currentParticipantId,
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
            this.router.navigate(['../'], { relativeTo: this.activatedRoute })
          });


      } else {
        zip(...arrayOfHttpAccsAndBrListObsAndExmptPatchObs).pipe(
          map(data => data.reduce((result, arr) => [...result, ...arr], [])),
          takeUntil(this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$)
        ).subscribe(
          (data) => {
            console.log('Wysyłam dane do serwera z patcha!', data);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
      }

    } else {
      // delete updatedP.id;
      // this.httpBrothersListSubscription = this.httpClient.post('http://localhost:3000/listaBraci', updatedP, {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json',
      //   })
      // })
        // .subscribe();
      // this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }
  }

  generateChildrenControls = (participant: Participant, numberOfParents: number) => {
    let childrenAccs = [];
    if (participant.kwatera) {
      childrenAccs = [...this.participant.kwatera];
    } else {
      let numberOfFamilyMembers = +this.participant.dziecko + numberOfParents;
      for (let i = 0; i < numberOfFamilyMembers; i++) {
        childrenAccs.push(null)
      }
    }
    childrenAccs.splice(0, numberOfParents);  
    for (let i = 1; i < +this.participant.dziecko + 1; i++) {
      this.childrenArray.push(i);
      this.childrenAccommodations.push(new FormGroup({
        'miejsceDziecka' : new FormControl(childrenAccs[i-1])
      }))
    }
    return this.childrenAccommodations;      
  }

  generateArrayOfHttpPatchObservables = () => {
    let arrayOfHttpPatchObservables: Array<Observable<any>> = [];
    for (let updatedAccId of [...this.participant.kwatera]) {
      let currentUpdatedAccPart = {
        id: updatedAccId,
        przydzial: 'tak',
        imieINazwisko: this.participant.imieINazwisko,
        wspolnota: this.participant.wspolnota,
        wolnePrzezNoc1: this.participant.nieobNoc1,
        wolnePrzezNoc2: this.participant.nieobNoc2 ,
        wolnePrzezNoc3: this.participant.nieobNoc3 
      }
      let httpPatchObs$: Observable<any> = this.httpClient.patch(
        'http://localhost:3000/kwateryBuzuna/' + updatedAccId,
        // this.restApi + '/kwateryBuzuna/' + updatedAccId,
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
    console.log('To jest tablica z patch obses: ', arrayOfHttpPatchObservables)
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
        // this.restApi + '/kwateryBuzuna/' + id,
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
    console.log('--------------------------------------------', actFormCtrlName)
    this.pForm.patchValue({
      [actFormCtrlName]: null,
    });
    if (actFormCtrlName = 'miejsceDziecka') {
      switch (this.participant.dziecko) {
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
    // if (this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubscription) { this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubscription.unsubscribe() };
    this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$.next();
    this.arrayOfHttpAccsAndBrListObsAndExmptPatchObsSubject$.complete();
    if (this.httpExemptedAccommodationsSubscription) { this.httpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.wrappedHttpExemptedAccommodationsSubscription) { this.wrappedHttpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.modeSubscription) { this.modeSubscription.unsubscribe() };
    if (this.formValueSubscription) { this.formValueSubscription.unsubscribe() };
    if (this.listOfTakenAccommodationIdsSubscribe) { this.listOfTakenAccommodationIdsSubscribe.unsubscribe()};
    if (this.accommodationsSubscribe) { this.accommodationsSubscribe.unsubscribe()};
    if (this.kwatery) { this.kwatery.unsubscribe() };
  }
}
