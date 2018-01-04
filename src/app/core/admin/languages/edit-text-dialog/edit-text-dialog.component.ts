import { Component, OnInit, Injector, Inject } from '@angular/core';
import { AppComponentBase } from '../../../../shared/common/app-component-base';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UpdateLanguageTextInput, LanguageServiceProxy } from '../../../../shared/service-proxies/service-proxies';

@Component({
  selector: 'app-edit-text-dialog',
  templateUrl: './edit-text-dialog.component.html',
  styleUrls: ['./edit-text-dialog.component.scss']
})
export class EditTextDialogComponent extends AppComponentBase implements OnInit {

  private loading = false;
  private model: UpdateLanguageTextInput = new UpdateLanguageTextInput();
  private baseText: string;
  private baseLanguage: abp.localization.ILanguageInfo;
  private targetLanguage: abp.localization.ILanguageInfo;
  constructor(
    injector: Injector,
    public dialogRef: MatDialogRef<EditTextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _languageService: LanguageServiceProxy
  ) {
    super(injector);
    this.model.sourceName = data.sourceName;
    this.model.key = data.key;
    this.model.languageName = data.targetLanguageName;
    this.model.value = data.targetValue;

    this.baseText = data.baseValue;
    this.baseLanguage = abp.localization.languages.find(l => l.name === data.baseLanguageName);
    this.targetLanguage = abp.localization.languages.find(l => l.name === data.targetLanguageName);
  }

  ngOnInit() {
  }

  save(): void {
    this.loading = true;
    this._languageService.updateLanguageText(this.model)
      .delay(2000)
      .finally(() => this.loading = false)
      .subscribe(() => {
        this.notify.info(this.l('SavedSuccessfully'));
        this.dialogRef.close(true);
      });
  }
}
