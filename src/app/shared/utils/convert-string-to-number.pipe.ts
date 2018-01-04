import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'convertToInt' })
export class ConvertStringToNumberPipe implements PipeTransform {
  transform(value: string) {
    return parseInt(value, 10);
  }
}
