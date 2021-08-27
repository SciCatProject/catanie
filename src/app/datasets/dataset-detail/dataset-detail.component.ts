import { Component, Inject, Input, Output, EventEmitter } from "@angular/core";
import { Attachment, Dataset, Proposal, Sample } from "shared/sdk/models";
import { APP_CONFIG, AppConfig } from "app-config.module";
import { ENTER, COMMA, SPACE } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatDialog } from "@angular/material/dialog";
import { SampleEditComponent } from "datasets/sample-edit/sample-edit.component";

/**
 * Component to show details for a data set, using the
 * form component
 * @export
 * @class DatasetDetailComponent
 */
@Component({
  selector: "dataset-detail",
  templateUrl: "./dataset-detail.component.html",
  styleUrls: ["./dataset-detail.component.scss"],
})
export class DatasetDetailComponent {
  @Input() dataset: Dataset | null = null;
  @Input() datasetWithout: Partial<Dataset> | null = null;
  @Input() attachments: Attachment[] | null = null;
  @Input() proposal: Proposal | null = null;
  @Input() sample: Sample | null = null;
  @Input() isPI = false;
  @Input() editingAllowed = false;

  @Output() clickKeyword = new EventEmitter<string>();
  @Output() addKeyword = new EventEmitter<string>();
  @Output() removeKeyword = new EventEmitter<string>();
  @Output() clickProposal = new EventEmitter<string>();
  @Output() clickSample = new EventEmitter<string>();
  @Output() saveMetadata = new EventEmitter<Record<string, unknown>>();
  @Output() sampleChange = new EventEmitter<Sample>();
  @Output() hasUnsavedChanges = new EventEmitter<boolean>();

  editEnabled = false;
  show = false;
  readonly separatorKeyCodes: number[] = [ENTER, COMMA, SPACE];
  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    public dialog: MatDialog
  ) {}

  onClickKeyword(keyword: string): void {
    this.clickKeyword.emit(keyword);
  }

  onAddKeyword(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || "").trim()) {
      const keyword = value.trim().toLowerCase();
      this.addKeyword.emit(keyword);
    }

    if (input) {
      input.value = "";
    }
  }

  onRemoveKeyword(keyword: string): void {
    this.removeKeyword.emit(keyword);
  }

  onClickProposal(proposalId: string): void {
    this.clickProposal.emit(proposalId);
  }

  onClickSample(sampleId: string): void {
    this.clickSample.emit(sampleId);
  }

  openSampleEditDialog() {
    this.dialog
      .open(SampleEditComponent, {
        width: "1000px",
        data: {
          ownerGroup: this.dataset.ownerGroup,
          sampleId: this.sample?.sampleId,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const { sample } = res;
          this.sample = sample;
          this.sampleChange.emit(sample);
        }
      });
  }

  onSaveMetadata(metadata: Record<string, any>) {
    this.saveMetadata.emit(metadata);
  }
  onHasUnsavedChanges($event: boolean){
    this.hasUnsavedChanges.emit($event);
  }
}
