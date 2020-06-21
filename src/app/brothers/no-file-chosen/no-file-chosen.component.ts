import { BrothersService } from './../brothers.service';
import { ExcelService } from './../../services/excel.service';
import { Participant } from './../../models/participant.model';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import * as BroActions from '../store/brothers.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-file-chosen',
  templateUrl: './no-file-chosen.component.html',
  styleUrls: ['./no-file-chosen.component.scss']
})
export class NoFileChosenComponent implements OnInit {

  fileToUpload: File = null;
  importedParticipants: Participant[];

  constructor(
    private excelService: ExcelService , 
    private brothersService: BrothersService,
    private router: Router,
    private store: Store <{brothers_: {participants: Participant[]}}>

  ) { }

  handleFileInput(event: any) {
    this.fileToUpload = event.target.files.item(0);
    console.log('this is the file to upload:', event.target.files)
    this.onFileChange(event);
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if(target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const data = this.excelService.importFromFile(bstr);

      const header: string[] = Object.getOwnPropertyNames(new Participant('','','', '', false, '', '', '', '', '', '', '', '', '', '', '', '')); 
      const importedData = (data as Array<any>).slice();
      const data$ = of(importedData)

      data$.subscribe((impData) => {
        this.importedParticipants = impData.map((arr: Array<any>) => {
          const obj = {};
          for (let i = 0; i < header.length; i++) {
            const k = header[i];
            obj[k] = arr[i];
          }
          return (obj as Participant);
        })
        .filter((participant) => {
          return !!participant['participantName'] && !!participant['no'] && (participant['no'].length <= 3);
        });
        this.store.dispatch(new BroActions.LoadParticipants(this.importedParticipants))
        
      })
    }
    reader.readAsBinaryString(target.files[0]);
    this.router.navigate(['/brothers']);
  }

  ngOnInit(): void {
  }

}
