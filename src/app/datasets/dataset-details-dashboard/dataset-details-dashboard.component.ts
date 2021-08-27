import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectorRef,
  AfterViewChecked,
} from "@angular/core";
import { Store, select } from "@ngrx/store";
import {
  Dataset,
  UserApi,
  User,
  Job,
  Attachment,
  Sample,
  RawDataset,
  DerivedDataset,
} from "shared/sdk";
import {
  getCurrentDataset,
  getCurrentDatasetWithoutFileInfo,
  getCurrentOrigDatablocks,
  getCurrentDatablocks,
  getCurrentAttachments,
  getPublicViewMode,
} from "state-management/selectors/datasets.selectors";
import {
  getIsAdmin,
  getCurrentUser,
  getProfile,
  getIsLoading,
  getIsLoggedIn,
} from "state-management/selectors/user.selectors";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, Observable, fromEvent, combineLatest } from "rxjs";
import { pluck, take, map } from "rxjs/operators";
import { APP_CONFIG, AppConfig } from "app-config.module";
import {
  clearFacetsAction,
  addKeywordFilterAction,
  updatePropertyAction,
  updateAttachmentCaptionAction,
  removeAttachmentAction,
  fetchDatasetAction,
  addAttachmentAction,
} from "state-management/actions/datasets.actions";
import { submitJobAction } from "state-management/actions/jobs.actions";
import { ReadFile } from "ngx-file-helpers";
import { SubmitCaptionEvent } from "shared/modules/file-uploader/file-uploader.component";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import {
  clearLogbookAction,
  fetchLogbookAction,
} from "state-management/actions/logbooks.actions";
import { fetchProposalAction } from "state-management/actions/proposals.actions";
import { getCurrentProposal } from "state-management/selectors/proposals.selectors";
import { fetchSampleAction } from "state-management/actions/samples.actions";
import { getCurrentSample } from "state-management/selectors/samples.selectors";
import { EditableComponent } from "app-routing/pending-changes.guard";
import { MatDialog } from "@angular/material/dialog";

export interface JWT {
  jwt: string;
}

export interface FileObject {
  pid: string;
  files: string[];
}

@Component({
  selector: "dataset-details-dashboard",
  templateUrl: "./dataset-details-dashboard.component.html",
  styleUrls: ["./dataset-details-dashboard.component.scss"],
})
export class DatasetDetailsDashboardComponent
  implements OnInit, OnDestroy, AfterViewChecked, EditableComponent {
  private subscriptions: Subscription[] = [];
  private _hasUnsavedChanges = false;
  datasetWithout$ = this.store.pipe(select(getCurrentDatasetWithoutFileInfo));
  origDatablocks$ = this.store.pipe(select(getCurrentOrigDatablocks));
  datablocks$ = this.store.pipe(select(getCurrentDatablocks));
  attachments$ = this.store.pipe(select(getCurrentAttachments));
  proposal$ = this.store.pipe(select(getCurrentProposal));
  sample$ = this.store.pipe(select(getCurrentSample));
  isAdmin$ = this.store.pipe(select(getIsAdmin));
  currentUser = this.store.pipe(select(getCurrentUser));
  userProfile$ = this.store.pipe(select(getProfile));
  accessGroups$: Observable<string[]> = this.userProfile$.pipe(
    map((profile) => (profile ? profile.accessGroups : []))
  );
  loading$ = this.store.pipe(select(getIsLoading));
  loggedIn$ = this.store.pipe(select(getIsLoggedIn));
  jwt$: Observable<JWT> = new Observable<JWT>();
  dataset: Dataset | undefined;
  user: User | undefined;
  editingAllowed = false;
  pickedFile!: ReadFile;
  attachment: Partial<Attachment> = {};
  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<Dataset>,
    private userApi: UserApi,
    public dialog: MatDialog
  ) {}
  hasUnsavedChanges() {
    return this._hasUnsavedChanges;
  }
  onHasUnsavedChanges(data: boolean) {
    this._hasUnsavedChanges = data;
  }

  isPI(): boolean {
    if (this.user) {
      if (this.user.username === "admin") {
        return true;
      }
      if (this.dataset.type === "raw") {
        return (
          this.user.email.toLowerCase() ===
          ((this.dataset as unknown) as RawDataset)[
            "principalInvestigator"
            ].toLowerCase()
        );
      }
      if (this.dataset.type === "derived") {
        return (
          this.user.email.toLowerCase() ===
          ((this.dataset as unknown) as DerivedDataset)[
            "investigator"
            ].toLowerCase()
        );
      }
    }
    return false;
  }

  onSlidePublic(event: MatSlideToggleChange) {
    const pid = this.dataset.pid;
    const property = { isPublished: event.checked };
    this.store.dispatch(updatePropertyAction({ pid, property }));
  }

  onClickKeyword(keyword: string) {
    this.store.dispatch(clearFacetsAction());
    this.store.dispatch(addKeywordFilterAction({ keyword }));
    this.router.navigateByUrl("/datasets");
  }

  onAddKeyword(keyword: string) {
    if (!this.dataset.hasOwnProperty("keywords")) {
      const keywords: Array<string> = [];
      this.dataset.keywords = keywords;
    }
    if (this.dataset.keywords.indexOf(keyword) === -1) {
      const pid = this.dataset.pid;
      const keywords = [...this.dataset.keywords].concat(keyword);
      const property = { keywords };
      this.store.dispatch(updatePropertyAction({ pid, property }));
    }
  }

  onRemoveKeyword(keyword: string) {
    const index = this.dataset.keywords.indexOf(keyword);
    if (index >= 0) {
      const pid = this.dataset.pid;
      const keywords = [...this.dataset.keywords];
      keywords.splice(index, 1);
      const property = { keywords };
      this.store.dispatch(updatePropertyAction({ pid, property }));
    }
  }

  onClickProposal(proposalId: string) {
    const id = encodeURIComponent(proposalId);
    this.router.navigateByUrl("/proposals/" + id);
  }

  onClickSample(sampleId: string) {
    const id = encodeURIComponent(sampleId);
    this.router.navigateByUrl("/samples/" + id);
  }

  onSampleChange(sample: Sample) {
    const pid = this.dataset.pid;
    const property = { sampleId: sample.sampleId };
    this.store.dispatch(updatePropertyAction({ pid, property }));
  }

  onSaveMetadata(metadata: Record<string, unknown>) {
    const pid = this.dataset.pid;
    const property = { scientificMetadata: metadata };
    this.store.dispatch(updatePropertyAction({ pid, property }));
  }

  resetDataset(dataset: Dataset) {
    if (confirm("Reset datablocks?")) {
      this.store.pipe(select(getCurrentUser), take(1)).subscribe((user) => {
        if (user) {
          const job = new Job();
          job.emailJobInitiator = user.email;
          job.jobParams = {};
          job.jobParams["username"] = user.username;
          job.creationTime = new Date();
          job.type = "reset";
          const fileObj: FileObject = {
            pid: "",
            files: [],
          };
          const fileList: string[] = [];
          fileObj.pid = dataset["pid"];
          if (dataset["datablocks"]) {
            dataset["datablocks"].map((d) => {
              fileList.push(d["archiveId"]);
            });
          }
          fileObj.files = fileList;
          job.datasetList = [fileObj];
          console.log(job);
          this.store.dispatch(submitJobAction({ job }));
        }
      });
    }
  }

  onFileUploaderFilePicked(file: ReadFile) {
    this.pickedFile = file;
  }

  onFileUploaderReadEnd(fileCount: number) {
    if (fileCount > 0) {
      this.attachment = {
        thumbnail: this.pickedFile.content,
        caption: this.pickedFile.name,
        ownerGroup: this.dataset.ownerGroup,
        accessGroups: this.dataset.accessGroups,
        createdBy: this.user.username,
        updatedBy: this.user.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        dataset: this.dataset,
        datasetId: this.dataset.pid,
      };
      this.store.dispatch(addAttachmentAction({ attachment: this.attachment }));
    }
  }

  updateCaption(event: SubmitCaptionEvent) {
    this.store.dispatch(
      updateAttachmentCaptionAction({
        datasetId: this.dataset.pid,
        attachmentId: event.attachmentId,
        caption: event.caption,
      })
    );
  }

  deleteAttachment(attachmentId: string) {
    this.store.dispatch(
      removeAttachmentAction({ datasetId: this.dataset.pid, attachmentId })
    );
  }

  ngOnInit() {
    this.subscriptions.push(
      this.route.params.pipe(pluck("id")).subscribe((id: string) => {
        if (id) {
          this.store
            .pipe(select(getPublicViewMode))
            .subscribe((viewPublic) => {
              if (viewPublic) {
                this.store.dispatch(
                  fetchDatasetAction({
                    pid: id,
                    filters: { isPublished: viewPublic },
                  })
                );
              } else {
                this.store.dispatch(fetchDatasetAction({ pid: id }));
              }
            })
            .unsubscribe();
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(select(getCurrentDataset)).subscribe((dataset) => {
        if (dataset) {
          this.dataset = dataset;
          combineLatest([this.accessGroups$, this.isAdmin$]).subscribe(
            ([groups, isAdmin]) => {
              this.editingAllowed =
                groups.indexOf(this.dataset.ownerGroup) !== -1 || isAdmin;
            }
          );
          if ("proposalId" in dataset) {
            this.store.dispatch(
              fetchProposalAction({ proposalId: dataset["proposalId"] })
            );
            this.store.dispatch(
              fetchLogbookAction({ name: dataset["proposalId"] })
            );
          } else {
            this.store.dispatch(clearLogbookAction());
          }
          if ("sampleId" in dataset) {
            this.store.dispatch(
              fetchSampleAction({ sampleId: dataset["sampleId"] })
            );
          }
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(select(getCurrentUser)).subscribe((user) => {
        if (user) {
          this.user = user;
        }
      })
    );

    // Prevent user from reloading page if there are unsave changes
    this.subscriptions.push(
      fromEvent(window, "beforeunload").subscribe((event) => {
        if (this.hasUnsavedChanges()) {
          event.returnValue = false;
        }
      })
    );
    this.jwt$ = this.userApi.jwt();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
