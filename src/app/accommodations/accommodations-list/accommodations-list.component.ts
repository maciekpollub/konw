import { map, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Participant } from './../../models/participant.model';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Accommodation } from './../../models/accommodation.model';
import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-accommodations-list',
  templateUrl: './accommodations-list.component.html',
  styleUrls: ['./accommodations-list.component.scss']
})
export class AccommodationsListComponent implements OnInit {
  elements$: Observable<Accommodation[]>;
  headElements = ['#', 'Kwatera', 'Kto', 'Detale']

  accommodatinos$: Observable<{accommodations: Accommodation[]}>;
  accommodations: Accommodation[];
  // participantPotentiallyToDelete: Participant;
  
  constructor(
    private httpClient: HttpClient ,
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
    this.elements$ = this.store.select('accommodations_').pipe(
      map(pieceOfState => pieceOfState.accommodations),
      tap((accommodationsFromStore) => this.accommodations = accommodationsFromStore)
    )
  }

  onPartListClick(): void {
    this.router.navigate(['/brothers']);
  }

}
