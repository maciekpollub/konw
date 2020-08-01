import { Participant } from './../../models/participant.model';
import { Component, OnInit, Output, Input } from '@angular/core';
import { EventEmitter } from 'protractor';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  // @Output() close = new EventEmitter<void>();
  // @Input() retrievedInfo: Participant;

  constructor() { }

  ngOnInit(): void {
  }

  // onClose() {
  //   this.close.emit();
  // }

}
