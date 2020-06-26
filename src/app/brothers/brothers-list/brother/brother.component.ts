import { Accommodation } from './../../../models/accommodation.model';
import { map, tap } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import * as BroActions from '../../../brothers/store/brothers.actions'

@Component({
  selector: 'app-brother',
  templateUrl: './brother.component.html',
  styleUrls: ['./brother.component.scss']
})
export class BrotherComponent implements OnInit, OnDestroy {
  editMode = false;
  brother$: Observable<Participant>;
  subscription: Subscription;

  accommodations$: Observable<Accommodation[]>;

  pForm: FormGroup;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<{
      brothers_: {participants: Participant[]},
      accommodations_: {accommodations: Accommodation[]},
    }>) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      // this.editMode = params['id'] !== null;
      this.editMode = !isNaN(+params['id']);
    })
    this.accommodations$ = this.store.select('accommodations_')
    .pipe(map(object => object.accommodations));

    this.initForm();
  }

  private initForm() {
    if (this.editMode) {
      let param$: Observable<any> = this.activatedRoute.params.pipe(
        map((params: Params) => params['id'])
      );
      
      let participants$: Observable<Participant[]> = this.store.select('brothers_')
      .pipe(map(object => object.participants));
  
      this.brother$ = combineLatest(param$, participants$).pipe(
        map(([param, prtpts]) => {
          let index = param;
          let bro = prtpts[index];
          return bro;
        }),
        tap((brother: Participant) => {
          this.pForm = new FormGroup({
            'id': new FormControl(+brother.id),
            'imieINazwisko': new FormControl(brother.imieINazwisko, Validators.required),
            'wspolnota': new FormControl(brother.wspolnota, Validators.required),
            'kwatera': new FormControl(brother.kwatera, Validators.required),
            'prezbiter': new FormControl(brother.prezbiter, Validators.pattern(/^[0-9]+/)),
            'malzenstwo': new FormControl(brother.malzenstwo, Validators.pattern(/^[0-9]+/)),
            'kobieta': new FormControl(brother.kobieta, Validators.pattern(/^[0-9]+/)),
            'mezczyzna': new FormControl(brother.mezczyzna, Validators.pattern(/^[0-9]+/)),
            'bobas': new FormControl(brother.bobas, Validators.pattern(/^[0-9]+/)),
            'dziecko': new FormControl(brother.dziecko, Validators.pattern(/^[0-9]+/)),
            'nianiaOddzielnie': new FormControl(brother.nianiaOddzielnie, Validators.pattern(/^[0-9]+/)),
            'uwagi': new FormControl(brother.uwagi),
            'wiek': new FormControl(brother.wiek, Validators.pattern(/^[1-9]+[0-9]+/)),
            'srodekTransportu': new FormControl(brother.srodekTransportu),
            'p': new FormControl(brother.p)
          })
        })
      )
    } else {
      this.pForm = new FormGroup({
        'id': new FormControl(null),
        'imieINazwisko': new FormControl(null, Validators.required),
        'wspolnota': new FormControl(null, Validators.required),
        'kwatera': new FormControl(null, Validators.required),
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
    }
    
  }

  onBackToList() {
    this.router.navigate(['../'], {relativeTo: this.activatedRoute})
  }

  onSubmit() {
    const newParticipant = new Participant(
      this.pForm.value['id'],
      this.pForm.value['wspolnota'],
      this.pForm.value['imieINazwisko'],
      this.pForm.value['kwatera'],
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
    this.subscription = this.activatedRoute.params.pipe(
      map((params: Params) => params['id']),
      map((id: number) => {
        return {index: id, newPart: newParticipant}
      })).subscribe((data) => {
          if(this.editMode) {
            this.store.dispatch(new BroActions.UpdateParticipant({ index: data.index, newParticipant: data.newPart}));
          } else {
            this.store.dispatch(new BroActions.AddParticipant(data.newPart));
          }
          this.router.navigate(['../'], {relativeTo: this.activatedRoute});  
        });

  }

  ngOnDestroy() {
    if (this.subscription) {this.subscription.unsubscribe};
  }
}
