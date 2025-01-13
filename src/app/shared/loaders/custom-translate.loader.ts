import { TranslateLoader, TranslationObject } from "@ngx-translate/core";
import { AppConfigService } from "app-config.service";
import { Observable, of } from "rxjs";

export class CustomTranslateLoader implements TranslateLoader {
  appConfig = this.appConfigService.getConfig();

  constructor(private appConfigService: AppConfigService) {}

  getTranslation(): Observable<TranslationObject> {
    const { currentLabelSet = "", labelSets = {} } =
      this.appConfig.datasetDetailView || {};

    if (currentLabelSet in labelSets) {
      return of(labelSets[currentLabelSet]);
    }
    return of({});
  }
}
