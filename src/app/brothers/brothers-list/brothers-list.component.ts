import { Participant } from './../../models/participant.model';
import { BrothersService } from './../brothers.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-brothers-list',
  templateUrl: './brothers-list.component.html',
  styleUrls: ['./brothers-list.component.scss']
})
export class BrothersListComponent implements OnInit {
  private participantsSubscr: Subscription;
  participants: Participant[];

  constructor(private brothersService: BrothersService) { }

  ngOnInit(): void {
    this.participantsSubscr = this.brothersService.participantsEmitter.subscribe(
      (participants) => {
        this.participants = participants;
      }
    )
  }

}
