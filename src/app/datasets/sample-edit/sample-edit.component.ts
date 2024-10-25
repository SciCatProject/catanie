import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import {
  PageChangeEvent,
  SortChangeEvent,
} from "shared/modules/table/table.component";
import { Sample } from "shared/sdk";
import {
  changePageAction,
  fetchSamplesAction,
  setTextFilterAction,
  sortByColumnAction,
} from "state-management/actions/samples.actions";
import {
  selectPage,
  selectSamples,
  selectSamplesCount,
  selectSamplesPerPage,
  selectTextFilter,
} from "state-management/selectors/samples.selectors";

@Component({
  selector: "app-sample-edit",
  templateUrl: "./sample-edit.component.html",
  styleUrls: ["./sample-edit.component.scss"],
})
export class SampleEditComponent implements OnInit, OnDestroy {
  @ViewChild("searchBar", { static: true }) searchBar!: ElementRef;

  textFilter$ = this.store.select(selectTextFilter);
  sampleCount$ = this.store.select(selectSamplesCount);
  samplesPerPage$ = this.store.select(selectSamplesPerPage);
  currentPage$ = this.store.select(selectPage);
  samples$ = this.store
    .select(selectSamples)
    .pipe(
      map((samples) =>
        samples.filter((sample) => sample.ownerGroup === this.data.ownerGroup),
      ),
    );

  samplesSubscription: Subscription = new Subscription();
  samples: Sample[] = [];

  selectedSampleId = "";
  displayedColumns = [
    "sampleId",
    "description",
    "owner",
    "createdAt",
    "ownerGroup",
  ];

  form = new FormGroup({
    sample: new FormControl<Sample>(null, [
      Validators.required,
      this.sampleValidator(),
    ]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { ownerGroup: string; sampleId: string },
    public dialogRef: MatDialogRef<SampleEditComponent>,
    private store: Store,
  ) {
    this.store.dispatch(setTextFilterAction({ text: "" }));
    this.store.dispatch(changePageAction({ page: 0, limit: 10 }));
    this.store.dispatch(fetchSamplesAction());
  }

  ngOnInit() {
    this.samplesSubscription = this.samples$.subscribe((samples) => {
      if (samples) {
        this.samples = samples;
      }
    });
  }

  ngOnDestroy() {
    this.samplesSubscription.unsubscribe();
  }

  sampleValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isCurrentSample = control.value?.sampleId === this.data.sampleId;
      return isCurrentSample
        ? { isCurrentSample: { value: control.value } }
        : null;
    };
  }

  onTextSearchChange = (): void => {
    this.store.dispatch(setTextFilterAction({ text: this.text }));
  };

  onClear = (): void => {
    if (this.text.length > 0) {
      this.text = "";
      this.onTextSearchChange();
    }
  };

  onPageChange = (event: PageChangeEvent): void =>
    this.store.dispatch(
      changePageAction({ page: event.pageIndex, limit: event.pageSize }),
    );

  onSortChange = (event: SortChangeEvent): void =>
    this.store.dispatch(
      sortByColumnAction({ column: event.active, direction: event.direction }),
    );

  onRowClick = (sample: Sample): void => {
    this.selectedSampleId = sample.sampleId;
    this.sample?.setValue(sample);
  };

  isInvalid = (): boolean => this.form.invalid;

  cancel = (): void => this.dialogRef.close();

  save = (): void => this.dialogRef.close({ sample: this.sample?.value });

  get sample() {
    return this.form.get("sample");
  }

  get text() {
    return this.searchBar.nativeElement.value;
  }

  set text(value: string) {
    this.searchBar.nativeElement.value = value;
  }
}
