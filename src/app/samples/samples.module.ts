import { SampleEffects } from "./../state-management/effects/samples.effects";
import { EffectsModule } from "@ngrx/effects";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { NgModule } from "@angular/core";
import { SampleDetailComponent } from "./sample-detail/sample-detail.component";
import { StoreModule } from "@ngrx/store";
import { samplesReducer } from "../state-management/reducers/samples.reducer";
import { SampleDialogComponent } from "./sample-dialog/sample-dialog.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SampleDashboardComponent } from "./sample-dashboard/sample-dashboard.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgxJsonViewerModule } from "ngx-json-viewer";
import { SharedCatanieModule } from "shared/shared.module";
import { MatChipsModule } from "@angular/material/chips";
import { FileSizePipe } from "shared/pipes/filesize.pipe";

@NgModule({
  imports: [
    CommonModule,
    EffectsModule.forFeature([SampleEffects]),
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    NgxJsonViewerModule,
    ReactiveFormsModule,
    SharedCatanieModule,
    StoreModule.forFeature("samples", samplesReducer),
  ],
  exports: [SampleDetailComponent, SampleDialogComponent],
  declarations: [
    SampleDetailComponent,
    SampleDialogComponent,
    SampleDashboardComponent,
  ],
  providers: [
    FileSizePipe
  ],
})
export class SamplesModule {}
