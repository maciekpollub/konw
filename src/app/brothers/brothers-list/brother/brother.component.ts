import { AccommodationsActions } from './../../../accommodations/store/accommodations.actions';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Accommodation } from './../../../models/accommodation.model';
import { map, tap, withLatestFrom, take } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription, zip, Subject } from 'rxjs';
import * as BroActions from '../../store/brothers.actions';
import * as AccomActions from '../../../accommodations/store/accommodations.actions';


@Component({
  selector: 'app-brother',
  templateUrl: './brother.component.html',
  styleUrls: ['./brother.component.scss'],
})
export class BrotherComponent implements OnInit, OnDestroy {
  editMode = false;
  participant$: Observable<Participant>;
  participant: Participant;
  childrenArray: number[] = [];
  currentParticipantId: string | number;

  accommodations$: Observable<Accommodation[]>;
  accommodation: Accommodation;

  subscription: Subscription;
  modeSubscription: Subscription;
  accSubs: Subscription;
  formValueSubscription: Subscription;
  statusSubs: Subscription;

  pForm: FormGroup = new FormGroup({});
  //kwatery$: Observable<Array<any>> = of([]);
  kwatery: Subscription;

  change = new Subject<Accommodation>();
  activeSelectCtrlValue: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private store: Store<{
      brothers_: {participants: Participant[], currentParticipantId: string | number},
      accommodations_: {accommodations: Accommodation[]}}>) { }

  ngOnInit(): void {
    this.modeSubscription = this.store.select('brothers_').subscribe((brothersState) => {
      console.log('brothers state: ', brothersState.participants)
      const currentId = brothersState.currentParticipantId;
      this.editMode = !!currentId;
      console.log('Edit mode is:', this.editMode);
      if (this.editMode) { this.currentParticipantId = currentId }; 
    })
    
    this.accommodations$ = this.store.select('accommodations_')
    .pipe(map(object => object.accommodations));

    this.initForm();
     
  }

  private initForm() {
    let accommodationUnits = new FormArray([]);
    let childrenAccommodations = new FormArray([]);
    let participants$: Observable<Participant[]> = this.store.select('brothers_').pipe(
      map((object) => object.participants)
    );

    if (this.editMode) {
      
      this.participant$ = participants$.pipe(
        take(1),
        map((participants) => {
          this.participant = participants.find(el => el.id === this.currentParticipantId);
          if (this.participant.dziecko) {
            for (let i = 1; i < +this.participant.dziecko + 1; i++) {
              this.childrenArray.push(i);
              childrenAccommodations.push(new FormGroup({
                'miejsceDziecka': new FormControl(null)
              }))
            }
            console.log('childrenArray: ', this.childrenArray)
          }
          
          console.log('paricipant: ', this.participant)
          return this.participant;
        }),
        tap((participant: Participant) => {
          if (participant && participant.kwatera) {
            for (let accUnit of participant.kwatera) {
              accommodationUnits.push(new FormGroup({
                'miejsce': new FormControl(accUnit, Validators.required)
              }));
            }
          }
          this.pForm = new FormGroup({
            'imieINazwisko': new FormControl(participant?.imieINazwisko, Validators.required),
            'wspolnota': new FormControl(participant?.wspolnota, Validators.required),
            'kwatera': accommodationUnits,
            'miejsce': new FormControl(null),
            'prezbiter': new FormControl(participant?.prezbiter, Validators.pattern(/^[0-9]+/)),
            'malzenstwo': new FormControl(participant?.malzenstwo, Validators.pattern(/^[0-9]+/)),
            'mazMiejsce': new FormControl(null),
            'zonaMiejsce': new FormControl(null),
            'dzieciMiejsce': childrenAccommodations,
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
        }),
        // tap(() => this.formValueSubscription = this.pForm.valueChanges.subscribe(val => console.log('wartości formularza: ----------', val))),
        tap(() => this.formValueSubscription = this.pForm.valueChanges
        .subscribe(val => console.log('status kontrolki dzieciMiejsce: ----------', this.pForm.controls.dzieciMiejsce)))
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
      this.kwatery = this.pForm.get('kwatera').valueChanges.subscribe(d => console.log('dane z kwatery:', d))
    }
    
  }

  onAccSelectOptionMousemove(event: any) {
    let value = event.target.value;
    this.activeSelectCtrlValue = value;
    console.log('previous select value: ', this.activeSelectCtrlValue);
  }

  onAccSelectOptionChange(event: any) {
    let value = event.target.value;
    console.log('value na miejscu dziecka: ', value)
    if (!this.activeSelectCtrlValue) {
      this.store.dispatch(new AccomActions.TakeAccommodation({index: value}))
    } else {
      this.store.dispatch(new AccomActions.FreeAccommodation({index: this.activeSelectCtrlValue}))
      this.store.dispatch(new AccomActions.TakeAccommodation({index: value}));
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
    console.log('na deletie:' ,this.getControls());
    let ctrlAccUnit = (this.pForm.get('kwatera') as FormArray).controls[index].get('miejsce').value;
    console.log('ctrlAccUnit: ', ctrlAccUnit);
    (this.pForm.get('kwatera') as FormArray).controls.splice(index, 1);
    this.store.dispatch(new AccomActions.FreeAccommodation({index: ctrlAccUnit}))
    return (this.pForm.get('kwatera') as FormArray).controls;
  }

  onBackToList() {
    this.router.navigate(['../'], {relativeTo: this.activatedRoute})
    this.store.select('accommodations_').subscribe(d => console.log('stan accommodations: ', d))
  }

  onSubmit() {
    let arrayOfStringAccUnits: string[] = [];
    

    for (let control of this.getControls()) {
      arrayOfStringAccUnits.push(control.get('miejsce').value)
    }
    console.log('arrayof string acc units:', arrayOfStringAccUnits)
  

    let newP = new Participant(
      '',
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
      this.pForm.value['nianiaOddzielnie'],
      this.pForm.value['uwagi'],
      this.pForm.value['wiek'],
      this.pForm.value['srodekTransportu'],
      this.pForm.value['p'],
      );

      if (this.editMode) {
        newP['id'] = this.currentParticipantId;
        console.log('obecny uczestnik', newP);
        this.subscription = this.httpClient.patch('http://localhost:3000/listaBraci/' + this.currentParticipantId, newP, {
          headers: {
            'Content-Type': 'application/json'
          }}
        )
         .subscribe();
        this.router.navigate(['../'], {relativeTo: this.activatedRoute});
      } else {
        delete newP.id;
        this.subscription = this.httpClient.post('http://localhost:3000/listaBraci', newP, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          })
        })
        .subscribe();
        this.router.navigate(['../'], {relativeTo: this.activatedRoute}); 
      }
  }
  

  getControls = () => {
    return (this.pForm.get('kwatera') as FormArray).controls;
  }
  getChildrenControls = () => {
    return (this.pForm.get('dzieciMiejsce') as FormArray).controls;
  }

  ngOnDestroy() {
    if (this.subscription) {this.subscription.unsubscribe()};
    if (this.modeSubscription) {this.modeSubscription.unsubscribe()};
    if (this.kwatery) {this.kwatery.unsubscribe()};
    if (this.formValueSubscription) {this.formValueSubscription.unsubscribe()};

    if (this.statusSubs) {this.statusSubs.unsubscribe()};
  }
}
