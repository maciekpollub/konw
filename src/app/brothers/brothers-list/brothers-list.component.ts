import { HttpClient } from '@angular/common/http';
import { Participant } from './../../models/participant.model';
import { Accommodation } from './../../models/accommodation.model';
import { BrothersService } from './../brothers.service';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators'; 
import * as BroActions from '../store/brothers.actions';
import * as AccomActions from '../../accommodations/store/accommodations.actions';

@Component({
  selector: 'app-brothers-list',
  templateUrl: './brothers-list.component.html',
  styleUrls: ['./brothers-list.component.scss']
})
export class BrothersListComponent implements OnInit, AfterViewInit {
  elements$: Observable<Participant[]>;
  headElements = ['#', 'Skąd', 'Kto', 'Gdzie']

  participants$: Observable<{participants: Participant[]}>;

  constructor(
    private httpClient: HttpClient,
    private store: Store<{brothers_: {participants: Participant[]}}>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {    
    // this.httpClient.get('assets/konwiwencja2018.json').subscribe(
    //   (data: any) => {
    //     console.log('data:', data);
    //     this.store.dispatch(new BroActions.LoadParticipants(data.listaBraci))
    //     this.store.dispatch(new AccomActions.LoadAccommodations(data.kwateryBuzuna))
    //   }
    // )

    this.httpClient.get('http://localhost:3000/listaBraci?_sort=wspolnota&_order=asc').subscribe(
      (data: Participant[]) => {
        this.store.dispatch(new BroActions.LoadParticipants(data))
      }
    )
    this.httpClient.get('http://localhost:3000/kwateryBuzuna').subscribe(
      (data: Accommodation[]) => {
        this.store.dispatch(new AccomActions.LoadAccommodations(data))
      }
    )



    this.elements$ = this.store.select('brothers_').pipe(
      map(pieceOfState => pieceOfState.participants)
    )
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  onBrotherClick(id: number) {
    this.router.navigate(['/brothers', id])
  }

  onBackClick() {
    this.router.navigate(['/']);
  }

  onAddParticipant() {
    this.router.navigate(['new'], {relativeTo: this.activatedRoute});
  }

  onDeleteParticipant(id: string) {
    this.store.dispatch(new BroActions.DeleteParticipant({index: id}));
    this.httpClient.delete('http://localhost:3000/listaBraci/' + id).subscribe();
  }

}
