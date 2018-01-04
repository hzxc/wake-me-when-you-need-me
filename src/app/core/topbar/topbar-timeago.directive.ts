import { Directive, Input, OnChanges, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTopbarTimeago]'
})
export class TopbarTimeagoDirective implements OnChanges {

  @Input() isTrigger: boolean;
  constructor(
    private _element: ElementRef
  ) { }

  ngOnChanges() {
    const $element = $(this._element.nativeElement);
    const pluginName = $element.attr('appTopbarTimeago');
    $element[pluginName]();
  }
}
