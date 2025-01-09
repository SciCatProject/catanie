import { DatasetEffects } from "./../state-management/effects/datasets.effects";
import { EffectsModule } from "@ngrx/effects";
import { LinkyModule } from "ngx-linky";
import { ArchivingService } from "./archiving.service";
import { BatchViewComponent } from "./batch-view/batch-view.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { NgModule } from "@angular/core";
import { NgxJsonViewerModule } from "ngx-json-viewer";
import { RouterModule } from "@angular/router";
import { SharedScicatFrontendModule } from "shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { datasetsReducer } from "state-management/reducers/datasets.reducer";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  DateAdapter,
  MatNativeDateModule,
  MatOptionModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSortModule } from "@angular/material/sort";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";

import { PublishComponent } from "./publish/publish.component";
import { jobsReducer } from "../state-management/reducers/jobs.reducer";
import { LogbooksModule } from "logbooks/logbooks.module";
import { ReduceComponent } from "./reduce/reduce.component";
import { DatasetDetailsDashboardComponent } from "./dataset-details-dashboard/dataset-details-dashboard.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DatablocksComponent } from "./datablocks-table/datablocks-table.component";
import { DatafilesComponent } from "./datafiles/datafiles.component";
import { JsonScientificMetadataComponent } from "./jsonScientificMetadata/jsonScientificMetadata.component";
import { DatasetDetailComponent } from "./dataset-detail/dataset-detail.component";
import { DatasetTableComponent } from "./dataset-table/dataset-table.component";
import { DatasetsFilterComponent } from "./datasets-filter/datasets-filter.component";
import { AddDatasetDialogComponent } from "./add-dataset-dialog/add-dataset-dialog.component";
import { DatasetTableSettingsComponent } from "./dataset-table-settings/dataset-table-settings.component";
import { DatasetTableActionsComponent } from "./dataset-table-actions/dataset-table-actions.component";
import { DatasetLifecycleComponent } from "./dataset-lifecycle/dataset-lifecycle.component";
import { SampleEditComponent } from "./sample-edit/sample-edit.component";
import { LuxonDateAdapter, MAT_LUXON_DATE_FORMATS } from "ngx-material-luxon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ShareDialogComponent } from "./share-dialog/share-dialog.component";
import { UserEffects } from "state-management/effects/user.effects";
import { ADAuthService } from "users/adauth.service";
import { FileSizePipe } from "shared/pipes/filesize.pipe";
import { ProposalEffects } from "state-management/effects/proposals.effects";
import { proposalsReducer } from "state-management/reducers/proposals.reducer";
import { SampleEffects } from "state-management/effects/samples.effects";
import { samplesReducer } from "state-management/reducers/samples.reducer";
import { PublishedDataEffects } from "state-management/effects/published-data.effects";
import { publishedDataReducer } from "state-management/reducers/published-data.reducer";
import { BatchCardModule } from "./batch-card/batch-card.module";
import { JobEffects } from "state-management/effects/jobs.effects";
import { LogbookEffects } from "state-management/effects/logbooks.effects";
import { logbooksReducer } from "state-management/reducers/logbooks.reducer";
import { PublicDownloadDialogComponent } from "./public-download-dialog/public-download-dialog.component";
import { DatasetFileUploaderComponent } from "./dataset-file-uploader/dataset-file-uploader.component";
import { AdminTabComponent } from "./admin-tab/admin-tab.component";
import { instrumentsReducer } from "state-management/reducers/instruments.reducer";
import { InstrumentEffects } from "state-management/effects/instruments.effects";
import { RelatedDatasetsComponent } from "./related-datasets/related-datasets.component";
import { FullTextSearchBarComponent } from "./dashboard/full-text-search/full-text-search-bar.component";
import { DatafilesActionsComponent } from "./datafiles-actions/datafiles-actions.component";
import { DatafilesActionComponent } from "./datafiles-actions/datafiles-action.component";
import { MatMenuModule } from "@angular/material/menu";
import { DatasetsFilterSettingsComponent } from "./datasets-filter/settings/datasets-filter-settings.component";
import { CdkDrag, CdkDragHandle, CdkDropList } from "@angular/cdk/drag-drop";
import { FiltersModule } from "shared/modules/filters/filters.module";
import { userReducer } from "state-management/reducers/user.reducer";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { TranslateModule } from "@ngx-translate/core";
@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([DatasetEffects]),
    FlexLayoutModule,
    FormsModule,
    LinkyModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatOptionModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    NgxJsonViewerModule,
    ReactiveFormsModule,
    RouterModule,
    SharedScicatFrontendModule,
    BatchCardModule,
    EffectsModule.forFeature([
      UserEffects,
      InstrumentEffects,
      JobEffects,
      ProposalEffects,
      SampleEffects,
      PublishedDataEffects,
      LogbookEffects,
    ]),
    StoreModule.forFeature("datasets", datasetsReducer),
    StoreModule.forFeature("instruments", instrumentsReducer),
    StoreModule.forFeature("jobs", jobsReducer),
    StoreModule.forFeature("proposals", proposalsReducer),
    StoreModule.forFeature("samples", samplesReducer),
    StoreModule.forFeature("publishedData", publishedDataReducer),
    StoreModule.forFeature("logbooks", logbooksReducer),
    StoreModule.forFeature("users", userReducer),
    LogbooksModule,
    FullTextSearchBarComponent,
    MatMenuModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    FiltersModule,
    TranslateModule,
  ],
  declarations: [
    BatchViewComponent,
    DashboardComponent,
    DatablocksComponent,
    JsonScientificMetadataComponent,
    DatafilesComponent,
    DatasetDetailComponent,
    DatasetTableComponent,
    DatasetsFilterComponent,
    PublishComponent,
    ReduceComponent,
    DatasetDetailsDashboardComponent,
    AddDatasetDialogComponent,
    DatasetTableSettingsComponent,
    DatasetTableActionsComponent,
    DatasetLifecycleComponent,
    SampleEditComponent,
    PublicDownloadDialogComponent,
    ShareDialogComponent,
    DatasetFileUploaderComponent,
    AdminTabComponent,
    RelatedDatasetsComponent,
    DatafilesActionsComponent,
    DatafilesActionComponent,
    DatasetsFilterSettingsComponent,
  ],
  providers: [
    ArchivingService,
    AsyncPipe,
    ADAuthService,
    SharedScicatFrontendModule,
    FileSizePipe,
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_LUXON_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "sv-SE" },
  ],
  exports: [
    DashboardComponent,
    DatablocksComponent,
    JsonScientificMetadataComponent,
    DatafilesComponent,
    DatasetDetailComponent,
    DatasetTableComponent,
    DatasetsFilterComponent,
  ],
})
export class DatasetsModule {}
