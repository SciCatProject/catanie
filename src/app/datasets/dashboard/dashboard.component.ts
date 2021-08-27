import { Component, OnDestroy, OnInit, Inject, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { APP_CONFIG, AppConfig } from "app-config.module";
import { select, Store, ActionsSubject } from "@ngrx/store";

import deepEqual from "deep-equal";

import { DatasetFilters, User } from "state-management/models";

import {
  fetchDatasetsAction,
  fetchFacetCountsAction,
  prefillBatchAction,
  prefillFiltersAction,
  addDatasetAction,
  fetchDatasetCompleteAction,
  fetchMetadataKeysAction,
} from "state-management/actions/datasets.actions";

import {
  getFilters,
  getHasPrefilledFilters,
  getDatasetsInBatch,
  getCurrentDataset,
  getSelectedDatasets,
} from "state-management/selectors/datasets.selectors";
import { distinctUntilChanged, filter, map, take } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
import { AddDatasetDialogComponent } from "datasets/add-dataset-dialog/add-dataset-dialog.component";
import { combineLatest, Subscription } from "rxjs";
import {
  getProfile,
  getCurrentUser,
  getColumns,
  getIsLoggedIn,
} from "state-management/selectors/user.selectors";
import { Dataset, DerivedDataset } from "shared/sdk";
import {
  selectColumnAction,
  deselectColumnAction,
} from "state-management/actions/user.actions";
import { SelectColumnEvent } from "datasets/dataset-table-settings/dataset-table-settings.component";

@Component({
  selector: "dashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private filters$ = this.store.pipe(select(getFilters));
  private readyToFetch$ = this.store.pipe(
    select(getHasPrefilledFilters),
    filter((has) => has)
  );
  loggedIn$ = this.store.pipe(select(getIsLoggedIn));
  selectedSets$ = this.store.pipe(select(getSelectedDatasets));
  tableColumns$ = this.store.pipe(select(getColumns)).pipe(
        map((columns) => columns.filter((column) => column.name !== "select"))
      );
  selectableColumns$ = this.store.pipe(select(getColumns))
    .pipe(map((columns) => columns.filter((column) => column.name !== "select")));
  public nonEmpty$ = this.store.pipe(
    select(getDatasetsInBatch),
    map((batch) => batch.length > 0)
  );

  subscriptions: Subscription[] = [];

  currentUser: User = new User();
  userGroups: string[] = [];
  clearColumnSearch = false;

  @ViewChild(MatSidenav, { static: false }) sideNav!: MatSidenav;

  constructor(
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private actionsSubj: ActionsSubject,
    public dialog: MatDialog,
    private store: Store<any>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSettingsClick(): void {
    this.sideNav.toggle();
    if (this.sideNav.opened) {
      this.clearColumnSearch = false;
    } else {
      this.clearColumnSearch = true;
    }
  }

  onCloseClick(): void {
    this.clearColumnSearch = true;
    this.sideNav.close();
  }

  onSelectColumn(event: SelectColumnEvent): void {
    const { checkBoxChange, column } = event;
    if (checkBoxChange.checked) {
      this.store.dispatch(
        selectColumnAction({ name: column.name, columnType: column.type })
      );
    } else if (!checkBoxChange.checked) {
      this.store.dispatch(
        deselectColumnAction({ name: column.name, columnType: column.type })
      );
    }
  }

  onRowClick(dataset: Dataset): void {
    const pid = encodeURIComponent(dataset.pid);
    this.router.navigateByUrl("/datasets/" + pid);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddDatasetDialogComponent, {
      width: "500px",
      data: { userGroups: this.userGroups },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const { username, email } = this.currentUser;
        const dataset = new DerivedDataset({
          accessGroups: [],
          contactEmail: email, // Required
          createdBy: username,
          creationTime: new Date(), // Required
          datasetName: res.datasetName,
          description: res.description,
          isPublished: false,
          keywords: [],
          owner: username.replace("ldap.", ""), // Required
          ownerEmail: email,
          ownerGroup: res.ownerGroup, // Required
          packedSize: 0,
          size: 0,
          sourceFolder: res.sourceFolder, // Required
          type: "derived", // Required
          inputDatasets: [], // Required
          investigator: email, // Required
          scientificMetadata: {},
          usedSoftware: res.usedSoftware
            .split(",")
            .map((entry: string) => entry.trim())
            .filter((entry: string) => entry !== ""), // Required
        });
        this.store.dispatch(addDatasetAction({ dataset }));
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(prefillBatchAction());
    this.store.dispatch(fetchMetadataKeysAction());

    this.subscriptions.push(
      this.loggedIn$.subscribe(status => {
        if (!status) {
          this.tableColumns$ = this.store.pipe(select(getColumns)).pipe(
            map((columns) => columns.filter((column) => column.name !== "select"))
          );
        } else {
          this.tableColumns$ = this.store.pipe(select(getColumns));
        }
      }
    ));

    this.subscriptions.push(
      combineLatest([this.filters$, this.readyToFetch$, this.loggedIn$])
        .pipe(
          map(([filters, _, loggedIn]) => [filters, loggedIn]),
          distinctUntilChanged(deepEqual)
        )
        .subscribe((obj) => {
          this.store.dispatch(fetchDatasetsAction());
          this.store.dispatch(fetchFacetCountsAction());
          this.router.navigate(["/datasets"], {
            queryParams: { args: JSON.stringify(obj[0]) },
          });
        })
    );

    this.subscriptions.push(
      this.route.queryParams
        .pipe(
          map((params) => params.args as string),
          take(1),
          map((args) => (args ? (JSON.parse(args) as DatasetFilters) : {}))
        )
        .subscribe((filters) =>
          this.store.dispatch(prefillFiltersAction({ values: filters }))
        )
    );

    this.subscriptions.push(
      this.store.pipe(select(getCurrentUser)).subscribe((user) => {
        if (user) {
          this.currentUser = user;
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(select(getProfile)).subscribe((profile) => {
        if (profile) {
          this.userGroups = profile.accessGroups;
        }
      })
    );

    this.subscriptions.push(
      this.actionsSubj.subscribe((data) => {
        if (data.type === fetchDatasetCompleteAction.type) {
          this.store
            .pipe(select(getCurrentDataset))
            .subscribe((dataset) => {
              if (dataset) {
                const pid = encodeURIComponent(dataset.pid);
                this.router.navigateByUrl("/datasets/" + pid);
              }
            })
            .unsubscribe();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
