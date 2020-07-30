import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameOfSingle'
})
export class NameOfSinglePipe implements PipeTransform {

  transform(value: string): string {
    let surnameAndNameArray = value.split(' ');
    return surnameAndNameArray[1];
  }

}
