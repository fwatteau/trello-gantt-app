import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'type'
})
export class TypePipe implements PipeTransform {

  transform(items: any[], filter: string|string[]): any {
    if (!items || !filter) {
        return items;
    }

    if (!Array.isArray(filter)) filter = [filter];

    return items.filter(item => filter.includes(item.type));
  }

}
