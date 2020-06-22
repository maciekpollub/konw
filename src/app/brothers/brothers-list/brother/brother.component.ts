import { map, tap } from 'rxjs/operators';
import { Participant } from './../../../models/participant.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';

@Component({
  selector: 'app-brother',
  templateUrl: './brother.component.html',
  styleUrls: ['./brother.component.scss']
})
export class BrotherComponent implements OnInit {
  brother$: Observable<Participant>;

  pForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<{brothers_: {participants: Participant[]}}>) { }

  ngOnInit(): void {
    // this.pForm = new FormGroup({
    //   'participantName': new FormControl ( , Validators.required),
    //   'communityName': new FormControl(null, Validators.required),
    //   'allocation': new FormControl(null, Validators.required),
    //   'presbiterQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'marriageQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'womanQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'manQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'littleChildQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'olderChildQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'familyNannyQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'separateNannyQuantity': new FormControl(null, Validators.pattern(/^[0-9]+/)),
    //   'remarks': new FormControl(null),
    //   'age': new FormControl(null, Validators.pattern(/^[1-9]+[0-9]+/)),
    //   'meansOfTransport': new FormControl(null)
    // })

    let qParams$: Observable<any> = this.activatedRoute.params.pipe(
      map((params: Params) => params['id'])
    );
    
    let participants$: Observable<Participant[]> = this.store.select('brothers_')
    .pipe(map(object => object.participants));

    this.brother$ = combineLatest(qParams$, participants$).pipe(
      map(([param, ps]) => {
        let index = param;
        let bro = ps[index];
        console.log('this is brother: ',bro)
        return bro;
      }),
      tap((brother: Participant) => {
        this.pForm = new FormGroup({
          'participantName': new FormControl (brother.participantName, Validators.required),
          'communityName': new FormControl(brother.communityName, Validators.required),
          'allocation': new FormControl(brother.allocation, Validators.required),
          'presbiterQuantity': new FormControl(brother.presbiterQuantity, Validators.pattern(/^[0-9]+/)),
          'marriageQuantity': new FormControl(brother.marriageQuantity, Validators.pattern(/^[0-9]+/)),
          'womanQuantity': new FormControl(brother.womanQuantity, Validators.pattern(/^[0-9]+/)),
          'manQuantity': new FormControl(brother.manQuantity, Validators.pattern(/^[0-9]+/)),
          'littleChildQuantity': new FormControl(brother.littleChildQuantity, Validators.pattern(/^[0-9]+/)),
          'olderChildQuantity': new FormControl(brother.olderChildQuantity, Validators.pattern(/^[0-9]+/)),
          'familyNannyQuantity': new FormControl(brother.familyNannyQuantity, Validators.pattern(/^[0-9]+/)),
          'separateNannyQuantity': new FormControl(brother.separateNannyQuantity, Validators.pattern(/^[0-9]+/)),
          'remarks': new FormControl(brother.remarks),
          'age': new FormControl(brother.age, Validators.pattern(/^[1-9]+[0-9]+/)),
          'meansOfTransport': new FormControl(brother.meansOfTransport)
        })
      })
    )
    
  }

  onSubmit() {
    console.log('.submited...')
  }


}
