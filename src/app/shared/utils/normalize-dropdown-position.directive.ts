import { Directive, ElementRef, AfterViewInit } from '@angular/core';
import * as Tether from 'tether';

@Directive({
    selector: '[appNormalizePosition]'
})
export class NormalizeDropdownPositionDirective implements AfterViewInit {

    constructor(
        private _element: ElementRef
    ) {
    }

    ngAfterViewInit(): void {
        $(this._element.nativeElement).on('show.bs.dropdown', function (e) {
            const $this = $(this);
            if (!$this.data('_tether')) {
                const $dropdownButton = $this.find('.dropdown-toggle');
                const $dropdownMenu = $this.find('.dropdown-menu');

                $dropdownMenu.css({
                    'display': 'block'
                });

                $this.data('_tether', new Tether({
                    element: $dropdownMenu[0],
                    target: $dropdownButton[0],
                    attachment: 'top left',
                    targetAttachment: 'bottom left',
                    constraints: [{
                        to: 'window',
                        attachment: 'together',
                        pin: true
                    }]
                }));
            }

            const $dropdownMenu = $($this.data('_tether').element);
            $dropdownMenu.css({
                'display': 'block'
            });
        }).on('hidden.bs.dropdown', function (e) {
            const $this = $(this);
            const $dropdownMenu = $($this.data('_tether').element);
            $dropdownMenu.css({
                'display': 'none'
            });
        });
    }
}
