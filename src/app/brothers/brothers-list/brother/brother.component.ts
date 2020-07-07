import { AccommodationsActions } from './../../../accommodations/store/accommodations.actions';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  styleUrls: ['./brother.component.scss']
})
export class BrotherComponent implements OnInit, OnDestroy {
  editMode = false;
  participant$: Observable<Participant>;
  participant: Participant;
  currentParticipantId: string | number;

  accommodations$: Observable<Accommodation[]>;
  accommodation: Accommodation;

  subscription: Subscription;
  modeSubscription: Subscription;

  pForm: FormGroup = new FormGroup({});
  //kwatery$: Observable<Array<any>> = of([]);
  kwatery: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private store: Store<{
      brothers_: {participants: Participant[], currentParticipantId: string | number},
      accommodations_: {accommodations: Accommodation[]}}>) { }


  ngOnInit(): void {
    this.modeSubscription = this.store.select('brothers_').subscribe((brothersState) => {
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
    let participants$: Observable<Participant[]> = this.store.select('brothers_').pipe(
      map((object) => object.participants)
    );

    if (this.editMode) {
      
      this.participant$ = participants$.pipe(
        map((participants) => {
          this.participant = participants.find(el => el.id === this.currentParticipantId);
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
            'prezbiter': new FormControl(participant?.prezbiter, Validators.pattern(/^[0-9]+/)),
            'malzenstwo': new FormControl(participant?.malzenstwo, Validators.pattern(/^[0-9]+/)),
            'kobieta': new FormControl(participant?.kobieta, Validators.pattern(/^[0-9]+/)),
            'mezczyzna': new FormControl(participant?.mezczyzna, Validators.pattern(/^[0-9]+/)),
            'bobas': new FormControl(participant?.bobas, Validators.pattern(/^[0-9]+/)),
            'dziecko': new FormControl(participant?.dziecko, Validators.pattern(/^[0-9]+/)),
            'nianiaOddzielnie': new FormControl(participant?.nianiaOddzielnie, Validators.pattern(/^[0-9]+/)),
            'uwagi': new FormControl(participant?.uwagi),
            'wiek': new FormControl(participant?.wiek, Validators.pattern(/^[1-9]+[0-9]+/)),
            'srodekTransportu': new FormControl(participant?.srodekTransportu),
            'p': new FormControl(participant?.p)
          })
        }),
        tap(d => console.log('kontrolki na samym początku:', this.getControls()))
      )
    } else {
      this.pForm = new FormGroup({
        'imieINazwisko': new FormControl(null, Validators.required),
        'wspolnota': new FormControl(null, Validators.required),
        'kwatera': accommodationUnits,
        'prezbiter': new FormControl(null, Validators.pattern(/^[0-9]+/)),
        'malzenstwo': new FormControl(null, Validators.pattern(/^[0-9]+/)),
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

  onAccSelectOptionClick(index: string) {
    this.store.dispatch(new AccomActions.TakeAccommodation({index: index}))
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
    (this.pForm.get('kwatera') as FormArray).controls.splice(index, 1);
    return (this.pForm.get('kwatera') as FormArray).controls;
  }

  onBackToList() {
    this.router.navigate(['../'], {relativeTo: this.activatedRoute})
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

  ngOnDestroy() {
    if (this.subscription) {this.subscription.unsubscribe()};
    if (this.modeSubscription) {this.modeSubscription.unsubscribe()};
    if (this.kwatery) {this.kwatery.unsubscribe()};
  }
}
