import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { IngestorMetadaEditorHelper, Schema } from 'ingestor/ingestor-metadata-editor/ingestor-metadata-editor-helper';
import { schema_mask2 } from 'ingestor/ingestor-metadata-editor/ingestor-metadata-editor-schematest';
import { IIngestionRequestInformation } from '../ingestor.component';

@Component({
  selector: 'ingestor.user-metadata-dialog',
  templateUrl: 'ingestor.user-metadata-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../ingestor.component.scss'],
})

export class IngestorUserMetadataDialog {
  metadataSchema: Schema;

  createNewTransferData: IIngestionRequestInformation = IngestorMetadaEditorHelper.createEmptyRequestInformation();

  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.metadataSchema = schema_mask2;
    this.createNewTransferData = data.createNewTransferData;
  }

  onClickBack(): void {
    if (this.data && this.data.onClickNext) {
      this.data.onClickNext(0); // Beispielwert für den Schritt
    }
  }

  onClickNext(): void {
    if (this.data && this.data.onClickNext) {
      this.data.onClickNext(2); // Beispielwert für den Schritt
    }
  }

  onDataChange(event: Object) {
    this.createNewTransferData.userMetaData = event;
  }
}