import {
  Component,
  Input,
  ChangeDetectionStrategy,
  AfterContentInit,
  EventEmitter,
  Output,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
} from "@angular/core";
import { ViewportRuler } from "@angular/cdk/scrolling";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { merge, Subscription } from "rxjs";

import { SciCatDataSource } from "../../services/scicat.datasource";
import { debounceTime, tap } from "rxjs/operators";
import { ExportExcelService } from "../../services/export-excel.service";
import { DateTime } from "luxon";
import { ActivatedRoute, Router } from "@angular/router";
import { Column } from "./shared-table.module";

@Component({
  selector: "shared-table",
  templateUrl: "./shared-table.component.html",
  styleUrls: ["./shared-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", visibility: "hidden" })
      ),
      state("expanded", style({ height: "*", visibility: "visible" })),
      transition(
        "expanded <=> collapsed",
        animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class SharedTableComponent
  implements
    AfterViewChecked,
    AfterViewInit,
    AfterContentInit,
    OnDestroy, OnInit {
  private subscriptions : Subscription[] = [];
  public MIN_COLUMN_WIDTH = 200;

  filterFormControl = new FormGroup({});
  filterExpressions : {[key: string]: string} = {};
  hideFilterFlag = false;
  // Visible Hidden Columns
  visibleColumns: Column[];
  hiddenColumns: Column[];
  // unitialized values are effectively treated as false
  expandedElement = {filters: false};
  // MatPaginator Inputs
  length = 100;

  // Shared Variables
  @Input() dataSource: SciCatDataSource;
  @Input() columnsdef: Column[];
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() title = "";
  @Output() rowClick = new EventEmitter<any>();

  // MatTable
  @ViewChild(MatTable, { static: true }) dataTable: MatTable<Element>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public ete: ExportExcelService,
    private ruler: ViewportRuler,
    private _changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    private formBuilder: FormBuilder
  ) {
    // react to viewport width changes with column restructuring
    this.subscriptions.push(
      this.ruler.change(100).subscribe((data) => {
        this.toggleColumns(
          this.dataTable["_elementRef"].nativeElement.clientWidth
        );
    }));

  }
  ngOnInit(){
    this.filterFormControl = this.initilizeFormControl();
    this.subscriptions.push(this.activeColumnFilters());
  }

  initilizeFormControl() {
    const formControls = this.columnsdef.reduce((acc: {[key: string]: string[]}, column: Column) => {
      if(column.matchMode === "between"){
        acc[column.id + ".start"] = [""];
        acc[column.id + ".end"] = [""];
      } else {
        acc[column.id] = [""];
      }
      return acc;
    }, {});
    formControls["globalSearch"] = [""];
    return this.formBuilder.group(formControls);
  }

  activeColumnFilters(){
    return this.filterFormControl.valueChanges
    .pipe(debounceTime(650))
    .subscribe( (values : {[key: string]: any }) => {
      const queryParams: {[key: string]: string | null} = {};
      for (let [columnId, value] of Object.entries(values)){
        // handle date filters
        if ((columnId.endsWith(".start") || columnId.endsWith(".end")) && value){
          const date = DateTime.fromISO(value).toISODate();
          this.filterExpressions[columnId] = date;
          queryParams[columnId] = date;
        } else if (value) {
          this.filterExpressions[columnId] = value;
          queryParams[columnId] = value;
        } else {
          delete this.filterExpressions[columnId];
          queryParams[columnId] = null;
        }
      }
      this.router.navigate([], {
        queryParams,
        queryParamsHandling: "merge",
      });
      this.loadDataPage();
    });
  }

  ngAfterViewChecked() {
    this._changeDetectorRef.detectChanges();
  }

  // link paginator and sort arrows to tables data source

  ngAfterViewInit() {
    // reset the paginator after sorting
    this.subscriptions.push(
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0))
    );

    this.setDefaultFilters();
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.router.navigate([], {
            queryParams: {
              sortActive: this.sort.active,
              sortDirection: this.sort.direction,
              pageIndex: this.paginator.pageIndex,
              pageSize: this.paginator.pageSize,
            },
            queryParamsHandling: "merge",
          });
          this.loadDataPage();
        })
      )
      .subscribe();

    // copy changes in URL parameters to corresponding GUI fields
    // Important: Do only once
    const queryParams = this.route.snapshot.queryParams;
    this.sort.active = queryParams.sortActive || null;
    this.sort.direction = queryParams.sortDirection || "asc";
    this.paginator.pageIndex = Number(queryParams.pageIndex) || 0;
    this.paginator.pageSize =  Number(queryParams.pageSize) || this.pageSize;
    for (let [filter, control] of Object.entries(this.filterFormControl.controls)){
      if (filter in queryParams){
        const value = queryParams[filter];
        control.setValue(value);
        this.filterExpressions[filter] = value;
      } else {
        control.setValue("");
        delete this.filterExpressions[filter];
      }
    }
    this.loadDataPage();
  }

  loadAllExportData() {
    this.dataSource.loadExportData(
      this.filterExpressions,
      this.sort.active,
      this.sort.direction
    );
  }

  loadDataPage() {
    this.dataSource.loadAllData(
      this.filterExpressions,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  ngAfterContentInit() {
    this.toggleColumns(this.dataTable["_elementRef"].nativeElement.clientWidth);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe);
  }

  onRowClick(event: any) {
    this.rowClick.emit(event);
  }

  get visibleColumnsIds() {
    const visibleColumnsIds = this.visibleColumns.map((column) => column.id);

    return this.hiddenColumns.length
      ? ["trigger", ...visibleColumnsIds]
      : visibleColumnsIds;
  }

  get hiddenColumnsIds() {
    return this.hiddenColumns.map((column) => column.id);
  }

  getExpandFlag(i) {
    const ex =
      Object.keys(this.expandedElement).length > 0 && this.expandedElement[i]
        ? "expanded"
        : "collapsed";
    return ex;
  }

  toggleExpandFlag(event: MouseEvent, i: string | number) {
    this.expandedElement[i] = !this.expandedElement[i];
    this._changeDetectorRef.detectChanges();
    event.stopPropagation(); // prevent propagation in case there is a onRowClick function
  }
  toggleHideFilterFlag(){
    this.expandedElement["filters"] = false;
    this.hideFilterFlag = !this.hideFilterFlag;
  }

  // fill default filters from table definition
  setDefaultFilters() {
    // copy default filters from column definitions to URL (which should trigger the filling of the GUI)
    this.columnsdef.forEach((col) => {
      if ("sortDefault" in col) {
        this.sort.active = col.id;
        this.sort.direction = col.sortDefault;
        this.router.navigate([], {
          queryParams: {
            sortActive: this.sort.active,
            sortDirection: this.sort.direction,
          },
          queryParamsHandling: "merge",
        });
      }
      // set default filter only if no other filters defined in query parameters
      // TODO replace by newer queryParamMap
      // ignore non-filtering parameters
      const {sortActive, sortDirection, pageIndex, pageSize, ...qp} = this.route.snapshot.queryParams;
      if ("filterDefault" in col && Object.keys(qp).length === 0) {
        if (typeof col.filterDefault === "object") {
          this.router.navigate([], {
            queryParams: {
              [col.id + ".start"]: col.filterDefault.start,
              [col.id + ".end"]: col.filterDefault.end,
            },
            queryParamsHandling: "merge",
          });
        } else {
          this.router.navigate([], {
            queryParams: { [col.id]: col.filterDefault },
            queryParamsHandling: "merge",
          });
        }
      }
    });
  }

  resetFilters(){
    Object.values(this.filterFormControl.controls).forEach((control => {
      control.setValue("");
    }));
    this.filterExpressions = {};
  }

  toggleColumns(tableWidth: number) {
    this.zone.runOutsideAngular(() => {
      const sortedColumns = this.columnsdef
        .slice()
        .map((column, index) => ({ ...column, order: index }))
        .sort((a, b) => a.hideOrder - b.hideOrder);

      for (const column of sortedColumns) {
        const columnWidth = column.width || this.MIN_COLUMN_WIDTH;

        if (column.hideOrder && tableWidth < columnWidth) {
          column.visible = false;
          continue;
        }
        tableWidth -= columnWidth;
        column.visible = true;
      }

      this.columnsdef = sortedColumns.sort((a, b) => a.order - b.order);
      this.visibleColumns = this.columnsdef.filter((column) => column.visible);
      this.hiddenColumns = this.columnsdef.filter((column) => !column.visible);
      this.expandedElement = {filters: false}; // reset expandElement to get ride of empty row when browser increases size
      this.zone.run(() => {
        this._changeDetectorRef.detectChanges();
      });
    });
  }

  exportToExcel() {
    // subscribes to the latest fetched data
    this.loadAllExportData();
  }

  getPropertyByPath(obj: Record<string, unknown>, pathString: string) {
    return pathString.split(".").reduce((o, i) => o[i], obj);
  }

  getFilterColumns(){
    const filterColumns = this.visibleColumns.map((column) => (`${column.id}-filter`));
    return this.hiddenColumns.length? [`hidden-filter-trigger`, ...filterColumns] : filterColumns;
  }
}
