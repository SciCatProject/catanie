import { APP_CONFIG, AppConfig } from "app-config.module";
import {
  Component,
  Inject,
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
import { select, Store } from "@ngrx/store";
import {
  clearSelectionAction,
  selectDatasetAction,
  deselectDatasetAction,
  selectAllDatasetsAction,
  changePageAction,
  sortByColumnAction,
} from "state-management/actions/datasets.actions";

import {
  getDatasets,
  getDatasetsPerPage,
  getPage,
  getTotalSets,
  getDatasetsInBatch,
} from "state-management/selectors/datasets.selectors";
import { PageChangeEvent } from "shared/modules/table/table.component";
import {
  selectColumnAction,
  deselectColumnAction,
} from "state-management/actions/user.actions";
import {get} from "lodash";
export interface SortChangeEvent {
  active: string;
  direction: "asc" | "desc" | "";
}

// interface DatasetDerivationsMap {
//   datasetPid: string;
//   derivedDatasetsNum: number;
// }

@Component({
  selector: "dataset-table",
  templateUrl: "dataset-table.component.html",
  styleUrls: ["dataset-table.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DatasetTableComponent implements OnInit, OnDestroy, OnChanges {
  private inBatchPids: string[] = [];
  private subscriptions: Subscription[] = [];

  lodashGet = get;
  currentPage$ = this.store.pipe(select(getPage));
  datasetsPerPage$ = this.store.pipe(select(getDatasetsPerPage));
  datasetCount$ = this.store.select(getTotalSets);

  @Input() tableColumns: TableColumn[] | null = null;
  displayedColumns: string[] = [];
  @Input() selectedSets: Dataset[] | null = null;

  datasets: Dataset[] = [];
  // datasetDerivationsMaps: DatasetDerivationsMap[] = [];
  // derivationMapPids: string[] = [];

  @Output() settingsClick = new EventEmitter<MouseEvent>();
  @Output() rowClick = new EventEmitter<Dataset>();

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private store: Store<any>
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
      changePageAction({ page: event.pageIndex, limit: event.pageSize })
    );
    if (event.pageSize < 50) {
      this.store.dispatch(
        selectColumnAction({ name: "image", columnType: "standard" })
      );
    } else {
      this.store.dispatch(
        deselectColumnAction({ name: "image", columnType: "standard" })
      );
    }
  }

  onSortChange(event: SortChangeEvent): void {
    const { active, direction } = event;
    const column = active.split("_")[1];
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
      this.store.pipe(select(getDatasetsInBatch)).subscribe((datasets) => {
        this.inBatchPids = datasets.map((dataset) => dataset.pid);
      })
    );

    if (this.tableColumns) {
      this.displayedColumns = this.tableColumns
        .filter((column) => column.enabled)
        .map((column) => column.type + "_" + column.name);
    }

    this.subscriptions.push(
      this.store.pipe(select(getDatasets)).subscribe((datasets) => {
        this.datasets = datasets;

        // this.derivationMapPids = this.datasetDerivationsMaps.map(
        //   datasetderivationMap => datasetderivationMap.datasetPid
        // );
        // this.datasetDerivationsMaps = datasets
        //   .filter(({ pid }) => !this.derivationMapPids.includes(pid))
        //   .map(dataset => ({
        //     datasetPid: dataset.pid,
        //     derivedDatasetsNum: this.countDerivedDatasets(dataset)
        //   }));
      })
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
}
