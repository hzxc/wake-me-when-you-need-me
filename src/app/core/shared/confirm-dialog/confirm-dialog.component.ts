import { Component, OnInit, Injector, Inject } from '@angular/core';
import { AppComponentBase } from '../../../shared/common/app-component-base';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent extends AppComponentBase implements OnInit {

  private displayName: string;
  private msg: string;
  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(injector);
    this.msg = data.msg;
    this.displayName = data.displayName;
  }

  ngOnInit() {
  }

}
