import { Accommodation } from './../../../../models/accommodation.model';
import { Store } from '@ngrx/store';
import { Participant } from './../../../../models/participant.model';
import { Component, OnInit, Input, QueryList, ViewChildren, Host } from '@angular/core';
import { FormGroupDirective, FormGroup, FormControl } from '@angular/forms';
import * as BroActions from '../../../store/brothers.actions';

@Component({
  selector: 'app-nights',
  templateUrl: './nights.component.html',
  styleUrls: ['./nights.component.scss']
})
export class NightsComponent implements OnInit {

  @Input() participant: Participant;
  @ViewChildren('input') inputs: QueryList<any> ;
  form: FormGroup;
  constructor(
    @Host() private parentFor: FormGroupDirective, 
    private store: Store<{
      brothers_: { 
        participants: Participant[],
        currentParticipantId: string | number,
        currentKwateraJustBeforeDisaccommodation: string[] | string,
        participantToAdd: Participant,  
      },
      accommodations_: { accommodations: Accommodation[] }
    }>) { }

  ngOnInit(): void {
    this.form = this.parentFor.form;
    this.form.addControl('nights', new FormGroup({
      'noc1': new FormControl(!this.participant.nieobNoc1),
      'noc2': new FormControl(!this.participant.nieobNoc2),
      'noc3': new FormControl(!this.participant.nieobNoc3)
    }))
  }

  onNight1Click() {
    this.store.dispatch(new BroActions.MarkFirstNight());
  }
  onNight2Click() {
    this.store.dispatch(new BroActions.MarkSecondNight());
  }

  onNight3Click() {
    this.store.dispatch(new BroActions.MarkThirdNight());
  }
  onAllNightsClick(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.inputs.forEach(input => input.nativeElement.checked = true)
    this.store.dispatch(new BroActions.MarkAllNights())
    this.store.select('brothers_').subscribe(d => console.log(d.participantToAdd))
  }

}
