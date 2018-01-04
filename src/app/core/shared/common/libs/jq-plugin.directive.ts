import { Directive, ElementRef, AfterViewInit, OnInit, Input } from '@angular/core';
import { AfterContentInit, OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[jq-plugin]'
})
export class JqPluginDirective implements AfterViewInit {

  constructor(
    private _element: ElementRef
  ) {
  }

  ngAfterViewInit(): void {
    const $element = $(this._element.nativeElement);
    const pluginName = $element.attr('jq-plugin');
    const options = $element.attr('jq-options');

    if (!options) {
      $element[pluginName]();
    } else {
      // tslint:disable-next-line:no-eval
      $element[pluginName](eval('(' + options + ')'));
    }
  }
}
