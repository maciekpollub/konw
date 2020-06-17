import { BrothersService } from './brothers/brothers.service';
import { Participant } from './models/participant.model';
import { ExcelService } from './services/excel.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'konw';

  fileToUpload: File = null;

  importedParticipants: Participant[] = [];

  constructor(private excelService: ExcelService, private brothersService: BrothersService) {}

  handleFileInput(event: any) {
    this.fileToUpload = event.target.files.item(0);
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
      // const importedData = (data as Array<any>).slice(1, -1);
      const importedData = (data as Array<any>).slice();

      this.importedParticipants = importedData
      .map((arr: Array<any>) => {
        const obj = {};
        for (let i = 0; i < header.length; i++) {
          const k = header[i];
          obj[k] = arr[i];
        }
        // if(+obj['no']) {console.log('------------------------------>', obj);}
        return (obj as Participant);
      })
      .filter((participant) => !!participant['participantName'] && !!participant['no'] && (participant['no'].length <= 3));
    }
    reader.readAsBinaryString(target.files[0]);
    console.log('beform setTimout')
    setTimeout(() => {
      console.log('in setTimoeut')
      console.log(this.importedParticipants);
      this.brothersService.participantsEmitter.next(this.importedParticipants);
    }, 3000)
  }

  ngOnInit() {
  }


}