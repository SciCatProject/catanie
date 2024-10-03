import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChange,
  ViewEncapsulation,
} from "@angular/core";
import { Dataset, TableColumn } from "state-management/models";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { Subscription } from "rxjs";
import { ActionsSubject, Store } from "@ngrx/store";
import {
  clearSelectionAction,
  selectDatasetAction,
  deselectDatasetAction,
  selectAllDatasetsAction,
  changePageAction,
  sortByColumnAction,
  fetchDatasetsAction,
  fetchDatasetCompleteAction,
  fetchFacetCountsAction,
} from "state-management/actions/datasets.actions";

import {
  selectDatasets,
  selectDatasetsPerPage,
  selectPage,
  selectTotalSets,
  selectDatasetsInBatch,
  selectLoadData,
  selectCurrentDataset,
} from "state-management/selectors/datasets.selectors";
import { PageChangeEvent } from "shared/modules/table/table.component";
import {
  selectColumnAction,
  deselectColumnAction,
} from "state-management/actions/user.actions";
import { get } from "lodash";
import { AppConfigService } from "app-config.service";
import { selectCurrentUser } from "state-management/selectors/user.selectors";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
export interface SortChangeEvent {
  active: string;
  direction: "asc" | "desc" | "";
}

// interface DatasetDerivationsMap {
//   datasetPid: string;
//   derivedDatasetsNum: number;
// }

@Component({
  selector: "app-guard-dialog",
  template: `
    <h1 mat-dialog-title>
      <mat-icon color="warn" style="vertical-align: middle;">warning</mat-icon>
      Loading All Data
    </h1>
    <div mat-dialog-content>
      <p>
        You are about to load all available data. This action might take a long
        time and consume significant resources.
      </p>
      <p>
        It's recommended to specify search or filter criteria for better
        performance.
      </p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Refine Search</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        Load All Data
      </button>
    </div>
  `,
  styles: [
    `
      mat-dialog-content {
        font-size: 16px;
        line-height: 1.6;
      }

      mat-dialog-actions {
        padding-right: 8px;
      }

      h1 mat-icon {
        margin-right: 8px;
      }
    `,
  ],
  standalone: true,
  imports: [MatIconModule, MatDialogModule, MatButtonModule],
})
class GuardDialogComponent {
  constructor(public dialogRef: MatDialogRef<GuardDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); // User confirmed loading all data
  }

  onCancel(): void {
    this.dialogRef.close(false); // User canceled, to refine search
  }
}

@Component({
  selector: "dataset-table",
  templateUrl: "dataset-table.component.html",
  styleUrls: ["dataset-table.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DatasetTableComponent implements OnInit, OnDestroy, OnChanges {
  private inBatchPids: string[] = [];
  private subscriptions: Subscription[] = [];

  appConfig = this.appConfigService.getConfig();

  dataLoaded$ = this.store.select(selectLoadData);

  lodashGet = get;
  currentPage$ = this.store.select(selectPage);
  datasetsPerPage$ = this.store.select(selectDatasetsPerPage);
  datasetCount$ = this.store.select(selectTotalSets);

  @Input() tableColumns: TableColumn[] | null = null;
  displayedColumns: string[] = [];
  @Input() selectedSets: Dataset[] | null = null;

  datasets: Dataset[] = [];
  // datasetDerivationsMaps: DatasetDerivationsMap[] = [];
  // derivationMapPids: string[] = [];

  @Output() settingsClick = new EventEmitter<MouseEvent>();
  @Output() rowClick = new EventEmitter<Dataset>();

  constructor(
    public appConfigService: AppConfigService,
    public dialog: MatDialog,
    private store: Store,
  ) {}
  doSettingsClick(event: MouseEvent) {
    this.settingsClick.emit(event);
  }

  doRowClick(dataset: Dataset): void {
    this.rowClick.emit(dataset);
  }

  // conditional to asses dataset status and assign correct icon ArchViewMode.work_in_progress
  // TODO: when these concepts stabilise, we should move the definitions to site config
  wipCondition(dataset: Dataset): boolean {
    if (
      !dataset.datasetlifecycle.archivable &&
      !dataset.datasetlifecycle.retrievable &&
      dataset.datasetlifecycle.archiveStatusMessage !==
        "scheduleArchiveJobFailed" &&
      dataset.datasetlifecycle.retrieveStatusMessage !==
        "scheduleRetrieveJobFailed"
    ) {
      return true;
    }
    return false;
  }

  systemErrorCondition(dataset: Dataset): boolean {
    if (
      (dataset.datasetlifecycle.retrievable &&
        dataset.datasetlifecycle.archivable) ||
      dataset.datasetlifecycle.archiveStatusMessage ===
        "scheduleArchiveJobFailed" ||
      dataset.datasetlifecycle.retrieveStatusMessage ===
        "scheduleRetrieveJobFailed"
    ) {
      return true;
    }
    return false;
  }

  userErrorCondition(dataset: Dataset): boolean {
    if (dataset.datasetlifecycle.archiveStatusMessage === "missingFilesError") {
      return true;
    }
    return false;
  }

  archivableCondition(dataset: Dataset): boolean {
    if (
      dataset.datasetlifecycle.archivable &&
      !dataset.datasetlifecycle.retrievable &&
      dataset.datasetlifecycle.archiveStatusMessage !== "missingFilesError"
    ) {
      return true;
    }
    return false;
  }

  retrievableCondition(dataset: Dataset): boolean {
    if (
      !dataset.datasetlifecycle.archivable &&
      dataset.datasetlifecycle.retrievable
    ) {
      return true;
    }
    return false;
  }

  isSelected(dataset: Dataset): boolean {
    if (!this.selectedSets) {
      return false;
    }
    return this.selectedSets.map((set) => set.pid).indexOf(dataset.pid) !== -1;
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedSets ? this.selectedSets.length : 0;
    const numRows = this.datasets ? this.datasets.length : 0;
    return numSelected === numRows;
  }

  isInBatch(dataset: Dataset): boolean {
    return this.inBatchPids.indexOf(dataset.pid) !== -1;
  }

  onSelect(event: MatCheckboxChange, dataset: Dataset): void {
    if (event.checked) {
      this.store.dispatch(selectDatasetAction({ dataset }));
    } else {
      this.store.dispatch(deselectDatasetAction({ dataset }));
    }
  }

  onSelectAll(event: MatCheckboxChange): void {
    if (event.checked) {
      this.store.dispatch(selectAllDatasetsAction());
    } else {
      this.store.dispatch(clearSelectionAction());
    }
  }

  onPageChange(event: PageChangeEvent): void {
    this.store.dispatch(
      changePageAction({ page: event.pageIndex, limit: event.pageSize }),
    );
    if (event.pageSize < 50) {
      this.store.dispatch(
        selectColumnAction({ name: "image", columnType: "standard" }),
      );
    } else {
      this.store.dispatch(
        deselectColumnAction({ name: "image", columnType: "standard" }),
      );
    }
  }

  onSortChange(event: SortChangeEvent): void {
    const { active, direction } = event;
    let column = active.split("_")[1];
    if (column === "runNumber") column = "scientificMetadata.runNumber.value";
    this.store.dispatch(sortByColumnAction({ column, direction }));
  }

  // countDerivedDatasets(dataset: Dataset): number {
  //   let derivedDatasetsNum = 0;
  //   if (dataset.history) {
  //     dataset.history.forEach(item => {
  //       if (
  //         item.hasOwnProperty("derivedDataset") &&
  //         this.datasets.map(set => set.pid).includes(item.derivedDataset.pid)
  //       ) {
  //         derivedDatasetsNum++;
  //       }
  //     });
  //   }
  //   return derivedDatasetsNum;
  // }

  ngOnInit() {
    this.subscriptions.push(
      this.store.select(selectDatasetsInBatch).subscribe((datasets) => {
        this.inBatchPids = datasets.map((dataset) => {
          return dataset.pid;
        });
      }),
    );

    if (this.tableColumns) {
      this.displayedColumns = this.tableColumns
        .filter((column) => column.enabled)
        .map((column) => {
          return column.type + "_" + column.name;
        });
    }

    this.subscriptions.push(
      this.store.select(selectDatasets).subscribe((datasets) => {
        this.store.select(selectCurrentUser).subscribe((currentUser) => {
          const publishedDatasets = datasets.filter(
            (dataset) => dataset.isPublished,
          );
          this.datasets = currentUser ? datasets : publishedDatasets;
        });

        // this.derivationMapPids = this.datasetDerivationsMaps.map(
        //   datasetderivationMap => datasetderivationMap.datasetPid
        // );
        // this.datasetDerivationsMaps = datasets
        //   .filter(({ pid }) => !this.derivationMapPids.includes(pid))
        //   .map(dataset => ({
        //     datasetPid: dataset.pid,
        //     derivedDatasetsNum: this.countDerivedDatasets(dataset)
        //   }));
      }),
    );
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (propName === "tableColumns") {
        this.tableColumns = changes[propName].currentValue;
        this.displayedColumns = changes[propName].currentValue
          .filter((column: TableColumn) => column.enabled)
          .map((column: TableColumn) => column.type + "_" + column.name);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadData() {
    const dialogRef = this.dialog.open(GuardDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // User confirmed, load all data
        this.store.dispatch(fetchDatasetsAction());
        this.store.dispatch(fetchFacetCountsAction());
      } else {
        // User canceled, show a message or allow them to filter
        console.log("User chose to refine search or filter.");
      }
    });
  }
}
