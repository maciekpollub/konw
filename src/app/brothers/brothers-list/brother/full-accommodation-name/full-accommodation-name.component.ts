import { Accommodation } from './../../../../models/accommodation.model';
import { Participant } from './../../../../models/participant.model';
import { Store } from '@ngrx/store';
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-full-accommodation-name',
  templateUrl: './full-accommodation-name.component.html',
  styleUrls: ['./full-accommodation-name.component.scss']
})

export class FullAccommodationNameComponent implements OnInit {

  @Input() accommodationId: string | string[];
  idArray: string[];
  currentAccommodationArraySubscription: Subscription;

  currentAccommodationArray: Accommodation[];

  constructor(private store: Store<{
    brothers_: { participants: Participant[], currentParticipantId: string | number },
    accommodations_: { accommodations: Accommodation[] }
  }>) { }

  ngOnInit(): void {
    this.idArray = [...this.accommodationId];
    this.currentAccommodationArraySubscription = this.store.select('accommodations_').subscribe(
      (stateObject) => {
        let accommodations = stateObject.accommodations;
        this.currentAccommodationArray = [...accommodations.filter(acc => this.idArray.indexOf(acc.id) !== -1)]
        return this.currentAccommodationArray;
          });
  }
  ngOnDestroy() {
    if (this.currentAccommodationArraySubscription) {this.currentAccommodationArraySubscription.unsubscribe()};
  }
}
