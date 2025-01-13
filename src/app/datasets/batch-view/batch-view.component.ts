import { Component, OnInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { first, switchMap } from "rxjs/operators";

import { selectDatasetsInBatch } from "state-management/selectors/datasets.selectors";
import {
  clearBatchAction,
  prefillBatchAction,
  removeFromBatchAction,
  storeBatchAction,
} from "state-management/actions/datasets.actions";
import { Message, MessageType } from "state-management/models";
import { showMessageAction } from "state-management/actions/user.actions";
import { DialogComponent } from "shared/modules/dialog/dialog.component";

import { Router } from "@angular/router";
import { ArchivingService } from "../archiving.service";
import { Observable, Subscription, combineLatest, firstValueFrom } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ShareDialogComponent } from "datasets/share-dialog/share-dialog.component";
import { AppConfigService } from "app-config.service";
import {
  selectIsAdmin,
  selectProfile,
} from "state-management/selectors/user.selectors";
import {
  DatasetsService,
  OutputDatasetObsoleteDto,
} from "@scicatproject/scicat-sdk-ts";

@Component({
  selector: "batch-view",
  templateUrl: "./batch-view.component.html",
  styleUrls: ["./batch-view.component.scss"],
})
export class BatchViewComponent implements OnInit, OnDestroy {
  batch$: Observable<OutputDatasetObsoleteDto[]> = this.store.select(
    selectDatasetsInBatch,
  );
  userProfile$ = this.store.select(selectProfile);
  isAdmin$ = this.store.select(selectIsAdmin);
  isAdmin = false;
  userProfile: any = {};
  subscriptions: Subscription[] = [];

  appConfig = this.appConfigService.getConfig();
  shareEnabled = this.appConfig.shareEnabled;

  datasetList: OutputDatasetObsoleteDto[] = [];
  public hasBatch = false;
  visibleColumns: string[] = ["remove", "pid", "sourceFolder", "creationTime"];

  constructor(
    public appConfigService: AppConfigService,
    private dialog: MatDialog,
    private store: Store,
    private archivingSrv: ArchivingService,
    private router: Router,
    private datasetService: DatasetsService,
  ) {}

  private clearBatch() {
    this.store.dispatch(clearBatchAction());
  }

  private storeBatch(datasetUpdatedBatch: OutputDatasetObsoleteDto[]) {
    this.store.dispatch(storeBatchAction({ batch: datasetUpdatedBatch }));
  }

  onEmpty() {
    const msg =
      "Are you sure that you want to remove all datasets from the batch?";
    if (confirm(msg)) {
      this.clearBatch();
    }
  }

  onRemove(dataset: OutputDatasetObsoleteDto) {
    this.store.dispatch(removeFromBatchAction({ dataset }));
  }

  onPublish() {
    this.router.navigate(["datasets", "batch", "publish"]);
  }

  onShare() {
    const shouldHaveInfoMessage =
      !this.isAdmin &&
      this.datasetList.some(
        (item) =>
          item.ownerEmail !== this.userProfile.email &&
          !this.userProfile.accessGroups.includes(item.ownerGroup),
      );

    const disableShareButton =
      !this.isAdmin &&
      this.datasetList.every(
        (item) =>
          item.ownerEmail !== this.userProfile.email &&
          !this.userProfile.accessGroups.includes(item.ownerGroup),
      );

    const sharedUsersList = this.datasetList
      .map((item) => item.sharedWith)
      .flat()
      .filter((x, i, a) => a.indexOf(x) === i);

    const infoMessage = shouldHaveInfoMessage
      ? disableShareButton
        ? "You haven't selected any dataset that you own to share."
        : "Only datasets that you own can be shared with other people."
      : "";

    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: "500px",
      data: {
        infoMessage,
        disableShareButton,
        sharedUsersList,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe(async (result: Record<string, string[]>) => {
        if (result && result.users) {
          let message: Message;
          try {
            const sharedDatasets = await Promise.all(
              this.datasetList.map((dataset) => {
                if (
                  (!this.isAdmin &&
                    dataset.ownerEmail !== this.userProfile.email) ||
                  (!this.isAdmin &&
                    !this.userProfile.accessGroups.includes(dataset.ownerGroup))
                ) {
                  return null;
                }

                return firstValueFrom(
                  this.datasetService.datasetsControllerFindByIdAndUpdate(
                    dataset.pid,
                    {
                      sharedWith: result.users,
                    },
                  ),
                );
              }),
            );

            if (sharedDatasets.length === this.datasetList.length) {
              this.clearBatch();
              this.storeBatch(sharedDatasets);

              message = new Message(
                result.users.length
                  ? "Datasets successfully shared!"
                  : "Shared users successfully removed!",
                MessageType.Success,
                5000,
              );
            }
          } catch (error) {
            message = new Message(error, MessageType.Error, 5000);
          }
          this.store.dispatch(showMessageAction({ message }));
        }
      });
  }

  onArchive() {
    this.batch$
      .pipe(
        first(),
        switchMap((datasets) => this.archivingSrv.archive(datasets)),
      )
      .subscribe(
        () => this.clearBatch(),
        (err) =>
          this.store.dispatch(
            showMessageAction({
              message: {
                type: MessageType.Error,
                content: err.message,
                duration: 5000,
              },
            }),
          ),
      );
  }

  onRetrieve() {
    const dialogOptions = this.archivingSrv.retriveDialogOptions(
      this.appConfig.retrieveDestinations,
    );
    const dialogRef = this.dialog.open(DialogComponent, dialogOptions);
    const destPath = { destinationPath: "/archive/retrieve" };
    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.datasetList) {
        const locationOption = this.archivingSrv.generateOptionLocation(
          result,
          this.appConfig.retrieveDestinations,
        );
        const extra = { ...destPath, ...locationOption };
        this.archivingSrv.retrieve(this.datasetList, extra).subscribe(
          () => this.clearBatch(),
          (err) =>
            this.store.dispatch(
              showMessageAction({
                message: {
                  type: MessageType.Error,
                  content: err.message,
                  duration: 5000,
                },
              }),
            ),
        );
      }
    });
  }

  ngOnInit() {
    combineLatest([this.isAdmin$, this.userProfile$])
      .subscribe(([isAdmin, userProfile]) => {
        this.isAdmin = isAdmin;
        this.userProfile = userProfile;
      })
      .unsubscribe();
    this.store.dispatch(prefillBatchAction());
    this.subscriptions.push(
      this.batch$.subscribe((result) => {
        if (result) {
          this.datasetList = result;
          this.hasBatch = result.length > 0;
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
