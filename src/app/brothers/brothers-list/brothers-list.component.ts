import { HttpClient } from '@angular/common/http';
import { Participant } from './../../models/participant.model';
import { Accommodation } from './../../models/accommodation.model';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
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
export class BrothersListComponent implements OnInit {
  elements$: Observable<Participant[]>;
  headElements = ['#', 'Skąd', 'Kto', 'Gdzie']

  participants$: Observable<{participants: Participant[]}>;
  
  constructor(
    private httpClient: HttpClient,
    private store: Store<{
      brothers_: { participants: Participant[] },
      accommodations_: { acccommodations: Accommodation[] }}>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {    
    this.httpClient.get('http://localhost:3000/listaBraci?_sort=wspolnota&_order=asc').subscribe(
      (data: Participant[]) => {
        let dataForStore = data.map((p: Participant) => {
          let extP: Participant;
          if (p.malzenstwo === '2') {
            const husbandAndWifeArray = p.imieINazwisko.split(' ');
            p['mazImie'] = husbandAndWifeArray[1];
            p['zonaImie'] = husbandAndWifeArray[3];
            extP = p;
          } else {
            extP = p;
          }
          return extP;
          })
          console.log('data for store:', dataForStore)

        this.store.dispatch(new BroActions.LoadParticipants(dataForStore))
      }
    )
    this.httpClient.get('http://localhost:3000/kwateryBuzuna').subscribe(
      (data: Accommodation[]) => {
        this.store.dispatch(new AccomActions.LoadAccommodations(data));    
    })

    this.elements$ = this.store.select('brothers_').pipe(
      map(pieceOfState => pieceOfState.participants)
    )
  }

  onBrotherClick(id: number | string, part: Participant) {
    this.router.navigate(['/brothers', +id + 1]);
    this.store.dispatch(new BroActions.EditParticipant({editedParticipant: part}))
  }

  onBackClick() {
    this.router.navigate(['/']);
  }

  onAddParticipant() {
    this.router.navigate(['new'], {relativeTo: this.activatedRoute});
  }

  onDeleteParticipant(id: string) {
    this.store.dispatch(new BroActions.DeleteParticipant({index: id}));
    this.httpClient.delete('http://localhost:3000/listaBraci/' + id ).subscribe();
  }

}
