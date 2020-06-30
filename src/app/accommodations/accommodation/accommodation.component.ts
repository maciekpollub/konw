import { Accommodation } from './../../models/accommodation.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-accommodation',
  templateUrl: './accommodation.component.html',
  styleUrls: ['./accommodation.component.scss']
})
export class AccommodationComponent implements OnInit {

  @Input() kwatera: Accommodation;


  constructor() { }

  ngOnInit(): void {
  }

}
