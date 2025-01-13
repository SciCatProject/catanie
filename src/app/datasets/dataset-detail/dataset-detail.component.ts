import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { ENTER, COMMA, SPACE } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";

import { MatDialog } from "@angular/material/dialog";
// import { SampleEditComponent } from "datasets/sample-edit/sample-edit.component";
import { DialogComponent } from "shared/modules/dialog/dialog.component";
import { combineLatest, fromEvent, Observable, Subscription } from "rxjs";
import { Store } from "@ngrx/store";

import { showMessageAction } from "state-management/actions/user.actions";
import {
  selectCurrentAttachments,
  selectCurrentDataset,
  selectCurrentDatasetWithoutFileInfo,
} from "state-management/selectors/datasets.selectors";
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsLoading,
  selectProfile,
} from "state-management/selectors/user.selectors";
import { map } from "rxjs/operators";
import {
  addKeywordFilterAction,
  clearFacetsAction,
  updatePropertyAction,
} from "state-management/actions/datasets.actions";
import { Router } from "@angular/router";
import { selectCurrentProposal } from "state-management/selectors/proposals.selectors";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { EditableComponent } from "app-routing/pending-changes.guard";
import { AppConfigService } from "app-config.service";
import { selectCurrentSample } from "state-management/selectors/samples.selectors";
import { selectCurrentInstrument } from "state-management/selectors/instruments.selectors";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Message, MessageType } from "state-management/models";
import { DOCUMENT } from "@angular/common";
import {
  Instrument,
  OutputDatasetObsoleteDto,
  ProposalClass,
  ReturnedUserDto,
  SampleClass,
} from "@scicatproject/scicat-sdk-ts";
import { AttachmentService } from "shared/services/attachment.service";
import { TranslateService } from "@ngx-translate/core";

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
  standalone: false,
})
export class DatasetDetailComponent
  implements OnInit, OnDestroy, EditableComponent
{
  private subscriptions: Subscription[] = [];
  private _hasUnsavedChanges = false;
  form: FormGroup;
  userProfile$ = this.store.select(selectProfile);
  isAdmin$ = this.store.select(selectIsAdmin);
  accessGroups$: Observable<string[]> = this.userProfile$.pipe(
    map((profile) => (profile ? profile.accessGroups : [])),
  );

  appConfig = this.appConfigService.getConfig();

  dataset: OutputDatasetObsoleteDto | undefined;
  datasetWithout$ = this.store.select(selectCurrentDatasetWithoutFileInfo);
  attachments$ = this.store.select(selectCurrentAttachments);
  loading$ = this.store.select(selectIsLoading);
  instrument: Instrument | undefined;
  proposal: ProposalClass | undefined;
  sample: SampleClass | undefined;
  user: ReturnedUserDto | undefined;
  editingAllowed = false;
  editEnabled = false;
  show = false;
  readonly separatorKeyCodes: number[] = [ENTER, COMMA, SPACE];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public appConfigService: AppConfigService,
    public dialog: MatDialog,
    private attachmentService: AttachmentService,
    private translateService: TranslateService,
    private store: Store,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.translateService.use(
      this.appConfig.datasetDetailView?.currentLabelSet,
    );
  }

  ngOnInit() {
    this.form = this.fb.group({
      datasetName: new FormControl("", [Validators.required]),
      description: new FormControl("", [Validators.required]),
      keywords: this.fb.array([]),
    });

    this.subscriptions.push(
      this.store.select(selectCurrentDataset).subscribe((dataset) => {
        this.dataset = dataset;
        if (this.dataset) {
          combineLatest([this.accessGroups$, this.isAdmin$]).subscribe(
            ([groups, isAdmin]) => {
              this.editingAllowed =
                groups.indexOf(this.dataset.ownerGroup) !== -1 || isAdmin;
            },
          );
        }
      }),
    );

    this.subscriptions.push(
      this.store.select(selectCurrentInstrument).subscribe((instrument) => {
        this.instrument = instrument;
      }),
    );

    this.subscriptions.push(
      this.store.select(selectCurrentProposal).subscribe((proposal) => {
        this.proposal = proposal;
      }),
    );

    this.subscriptions.push(
      this.store.select(selectCurrentSample).subscribe((sample) => {
        this.sample = sample;
      }),
    );

    // Prevent user from reloading page if there are unsave changes
    this.subscriptions.push(
      fromEvent(window, "beforeunload").subscribe((event) => {
        if (this.hasUnsavedChanges()) {
          event.preventDefault();
        }
      }),
    );

    this.subscriptions.push(
      this.store.select(selectCurrentUser).subscribe((user) => {
        if (user) {
          this.user = user;
        }
      }),
    );
  }

  onEditModeEnable() {
    this.form = this.fb.group({
      datasetName: this.dataset.datasetName || "",
      description: this.dataset.description || "",
      keywords: this.fb.array(this.dataset.keywords || []),
    });
    this.editEnabled = true;
  }

  hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }

  onClickKeyword(keyword: string) {
    this.store.dispatch(clearFacetsAction());
    this.store.dispatch(addKeywordFilterAction({ keyword }));
    this.router.navigateByUrl("/datasets");
  }

  get keywords(): FormArray {
    return this.form.controls.keywords as FormArray;
  }

  onAddKeyword(event: MatChipInputEvent): void {
    const input = event.chipInput.inputElement;
    const value = event.value;

    if ((value || "").trim() && this.dataset) {
      const keyword = value.trim().toLowerCase();
      if (this.keywords.value.indexOf(keyword) === -1) {
        this.keywords.push(this.fb.control(keyword));

        // Reset the input value
        if (input) {
          input.value = "";
        }
      }
    }
  }

  onRemoveKeyword(keyword: string): void {
    const index = this.keywords.value.indexOf(keyword);
    if (index >= 0) {
      this.keywords.removeAt(index);
    }
  }

  onSaveGeneralInformationChanges() {
    const pid = this.dataset.pid;

    if (pid) {
      const property = {
        datasetName: this.form.value.datasetName,
        description: this.form.value.description,
        keywords: this.keywords.value,
      };

      this.store.dispatch(updatePropertyAction({ pid, property }));
    }

    this.editEnabled = false;
  }

  onRemoveShare(share: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: "auto",
      data: {
        title: `Really remove ${share}?`,
        question: `If you click 'Ok', ${share} will no longer be able to access this Dataset.`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.dataset) {
        const index = this.dataset.sharedWith.indexOf(share);
        if (index >= 0) {
          const pid = this.dataset.pid;
          const sharedWith: string[] = [...this.dataset.sharedWith];
          sharedWith.splice(index, 1);
          const property = { sharedWith };
          this.store.dispatch(updatePropertyAction({ pid, property }));
        }
      }
    });
  }

  onClickInstrument(instrumentId: string): void {
    const pid = encodeURIComponent(instrumentId);
    this.router.navigateByUrl("/instruments/" + pid);
  }

  onClickProposal(proposalId: string): void {
    const id = encodeURIComponent(proposalId);
    this.router.navigateByUrl("/proposals/" + id);
  }

  onClickSample(sampleId: string): void {
    const id = encodeURIComponent(sampleId);
    this.router.navigateByUrl("/samples/" + id);
  }

  onSlidePublic(event: MatSlideToggleChange) {
    if (this.dataset) {
      const pid = this.dataset.pid;
      const property = { isPublished: event.checked };
      this.store.dispatch(updatePropertyAction({ pid, property }));
    }
  }

  onSaveMetadata(metadata: Record<string, any>) {
    if (this.dataset) {
      const pid = this.dataset.pid;
      const property = { scientificMetadata: metadata };
      this.store.dispatch(updatePropertyAction({ pid, property }));
    }
  }

  onHasUnsavedChanges($event: boolean) {
    this._hasUnsavedChanges = $event;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  onCopy(pid: string) {
    const selectionBox = this.document.createElement("textarea");
    selectionBox.style.position = "fixed";
    selectionBox.style.left = "0";
    selectionBox.style.top = "0";
    selectionBox.style.opacity = "0";
    selectionBox.value = pid;
    this.document.body.appendChild(selectionBox);
    selectionBox.focus();
    selectionBox.select();
    this.document.execCommand("copy");
    this.document.body.removeChild(selectionBox);

    const message = new Message(
      "Dataset PID has been copied to your clipboard",
      MessageType.Success,
      5000,
    );
    this.store.dispatch(showMessageAction({ message }));
  }
  base64MimeType(encoded: string): string {
    return this.attachmentService.base64MimeType(encoded);
  }

  getImageUrl(encoded: string) {
    return this.attachmentService.getImageUrl(encoded);
  }

  openAttachment(encoded: string) {
    this.attachmentService.openAttachment(encoded);
  }
}
