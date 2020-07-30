import { AccommodationsActions } from './../../../accommodations/store/accommodations.actions';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Accommodation } from './../../../models/accommodation.model';
import { map, tap, take } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription, zip, Subject, forkJoin, BehaviorSubject } from 'rxjs';
import * as BroActions from '../../store/brothers.actions';
import * as AccomActions from '../../../accommodations/store/accommodations.actions';
import { logWarnings } from 'protractor/built/driverProviders';


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
  accommodation: Accommodation;
  activeSelectCtrlValue: string = '';
  childrenAccommodations = new FormArray([]);
  exemptedAccommodationsIdsToSetFreeInDB: string[] = [];

  httpAccommodationsAndBrothersSubscription: Subscription;
  httpExemptedAccommodationsSubscription: Subscription;
  wrappedHttpExemptedAccommodationsSubscription: Subscription;
  modeSubscription: Subscription;
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

    this.initForm();
  }

  private initForm() {
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
          if (participant.kwatera) {
            this.pForm.patchValue({
              'p': 'tak'
            })
            for (let accUnit of participant.kwatera) {
              accommodationUnits.push(new FormGroup({
                'miejsce': new FormControl(accUnit, Validators.required)
              }));
            }
            if (this.participant.malzenstwo === '2') {
              this.pForm.patchValue({
                'mazMiejsce': this.participant.kwatera[0],
                'zonaMiejsce': this.participant.kwatera[1],
              });
            }  
          }
          
        }),
        tap(() => this.formValueSubscription = this.pForm.valueChanges.subscribe(
          (val) => {
            console.log('kwatera teraz...........:', this.pForm.controls.kwatera)
            console.log('obecnie obsługiwany participant:', this.participant);
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

  onAccSelectOptionMousemove(event: any) {
    let value = event.target.value;
    this.activeSelectCtrlValue = value;
    console.log('mousemove: ', this.activeSelectCtrlValue)
  }

  onAccSelectOptionChange(event: any) {
    let value = event.target.value;
    if (this.activeSelectCtrlValue === '') {
      this.store.dispatch(new AccomActions.TakeAccommodation({ index: value }))
      this.store.dispatch(new BroActions.AccommodateParticipant({ accomId: value, currPartId: this.currentParticipantId }));
    } else {
      if (this.participant.kwatera.indexOf(this.activeSelectCtrlValue) === this.participant.kwatera.lastIndexOf(this.activeSelectCtrlValue)) {
        this.store.dispatch(new AccomActions.FreeAccommodation({ index: this.activeSelectCtrlValue }));
      };
      this.store.dispatch(new BroActions.DisaccommodateParticipant({ accomId: this.activeSelectCtrlValue, currPartId: this.currentParticipantId}));
      this.exemptedAccommodationsIdsToSetFreeInDB.push(this.activeSelectCtrlValue);
      this.store.dispatch(new AccomActions.TakeAccommodation({ index: value }));
      this.store.dispatch(new BroActions.ReaccommodateParticipant({cancelledAccomId: this.activeSelectCtrlValue, accomId: value, currPartId: this.currentParticipantId}));
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
      };

      updatedP = new Participant(
        this.currentParticipantId,
        this.pForm.value['wspolnota'],
        this.pForm.value['imieINazwisko'],
        '',
        arrayOfStringAccUnits,
        this.pForm.value['prezbiter'],
        this.pForm.value['malzenstwo'],
        this.pForm.value['kobieta'],
        this.pForm.value['mezczyzna'],
        this.pForm.value['bobas'],
        this.pForm.value['dziecko'],
        this.pForm.value['p'],
        this.pForm.value['nianiaOddzielnie'],
        this.pForm.value['uwagi'],
        this.pForm.value['wiek'],
        this.pForm.value['srodekTransportu'],
        this.pForm.value['nieobNoc1'],
        this.pForm.value['nieobNoc1'],
        this.pForm.value['nieobNoc1'],
      );
      let httpBrothersListObservable$ = this.httpClient.patch(
        'http://localhost:3000/listaBraci/' + this.currentParticipantId,
        updatedP,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      let arrayOfHttpAccommodations = this.generateArrayOfHttpPatchObservables();
      this.httpAccommodationsAndBrothersSubscription = zip(
        ...arrayOfHttpAccommodations,
        httpBrothersListObservable$
        ).subscribe(
          (data) => console.log('Wysyłam dane do serwera z patcha!', data)
        );

      if (this.exemptedAccommodationsIdsToSetFreeInDB.length !== 0) {
        let verifiedExemptedAccIdArray:string[] = [];
        this.wrappedHttpExemptedAccommodationsSubscription = this.store.select('accommodations_').pipe(
          map((stateObject) => stateObject.accommodations),
          map(accommodations => {
            return accommodations.filter(acc => {
              return this.exemptedAccommodationsIdsToSetFreeInDB.indexOf(acc.id) !== -1;
          })}),
          map((exemptedAccsAtTheTimeOfSubmit: Accommodation[]) => {
            for (let acc of exemptedAccsAtTheTimeOfSubmit) {
              if (!acc.przydzial) {verifiedExemptedAccIdArray.push(acc.id)}
            }
            return verifiedExemptedAccIdArray;
          }),
          tap((verifiedExemptedAccIdArray) => {
            for (let id of verifiedExemptedAccIdArray) {
              let currentUpdatedAccPart = {
                przydzial: '',
                imieINazwisko: '',
                wspolnota: '',
                wolnePrzezNoc1: '',
                wolnePrzezNoc2: '',
                wolnePrzezNoc3: '', 
              }
              this.httpExemptedAccommodationsSubscription = this.httpClient.patch(
                'http://localhost:3000/kwateryBuzuna/' + id,
                currentUpdatedAccPart,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              ).subscribe();
            }
          })
        ).subscribe();
      }

      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    } else {
      // delete updatedP.id;
      // this.httpBrothersListSubscription = this.httpClient.post('http://localhost:3000/listaBraci', updatedP, {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json',
      //   })
      // })
        // .subscribe();
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
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
        przydzial: 'tak',
        imieINazwisko: this.participant.imieINazwisko,
        wspolnota: this.participant.wspolnota,
        wolnePrzezNoc1: this.participant.nieobNoc1,
        wolnePrzezNoc2: this.participant.nieobNoc2 ,
        wolnePrzezNoc3: this.participant.nieobNoc3 
      }
      let httpPatchObs$: Observable<any> = this.httpClient.patch(
        'http://localhost:3000/kwateryBuzuna/' + updatedAccId,
        currentUpdatedAccPart,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      arrayOfHttpPatchObservables.push(httpPatchObs$);
    }
    console.log('To jest tablica z patch obses: ', arrayOfHttpPatchObservables)
    return arrayOfHttpPatchObservables;
  }
  

  getControls = () => {
    return (this.pForm.get('kwatera') as FormArray).controls;
  }

  getChildrenControls = () => {
    let a = (this.pForm.get('dzieciMiejsce') as FormArray).controls;
    return a;
  }

  ngOnDestroy() {
    if (this.httpAccommodationsAndBrothersSubscription) { this.httpAccommodationsAndBrothersSubscription.unsubscribe() };
    if (this.httpExemptedAccommodationsSubscription) { this.httpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.wrappedHttpExemptedAccommodationsSubscription) { this.wrappedHttpExemptedAccommodationsSubscription.unsubscribe() };
    if (this.modeSubscription) { this.modeSubscription.unsubscribe() };
    if (this.formValueSubscription) { this.formValueSubscription.unsubscribe() };
    if (this.kwatery) { this.kwatery.unsubscribe() };
  }
}
