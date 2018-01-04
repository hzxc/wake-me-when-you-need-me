import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

export const loadsvgResources = (iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => {
  iconRegistry.addSvgIcon('all', sanitizer.bypassSecurityTrustResourceUrl('assets/svg/iconfont/all.svg'));
};


