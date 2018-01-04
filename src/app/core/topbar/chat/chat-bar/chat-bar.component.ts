import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common/app-component-base';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})
export class ChatBarComponent extends AppComponentBase implements OnInit {
  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit() {
  }

}
