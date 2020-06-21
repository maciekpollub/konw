import { Participant } from './../../models/participant.model';
import { BrothersService } from './../brothers.service';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap } from 'rxjs/operators'; 

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
    private store: Store<{brothers_: {participants: Participant[]}}>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {    
    this.elements$ = this.store.select('brothers_').pipe(
      map(pieceOfState => pieceOfState.participants),
    )
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  onBrotherClick(id: number) {
    this.router.navigate([id], {relativeTo: this.activatedRoute})
  }

  onBackClick() {
    this.router.navigate(['/']);
  }

}
