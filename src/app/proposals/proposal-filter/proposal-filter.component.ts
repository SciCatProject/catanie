import { Component, Input, Output, EventEmitter } from "@angular/core";
import {
  MatDatepickerInputEvent,
  DateRange as MatDateRange,
} from "@angular/material/datepicker";
import { DateTime } from "luxon";

export interface DateRange {
  begin: string;
  end: string;
}

@Component({
  selector: "proposal-filter",
  templateUrl: "./proposal-filter.component.html",
  styleUrls: ["./proposal-filter.component.scss"],
})
export class ProposalFilterComponent {
  @Input() hasAppliedFilters: boolean | null = false;
  @Input() searchBarValue: string | null = "";
  @Input() clearSearchBar = false;
  @Input() dateRangeValue: DateRange | null = {
    begin: "",
    end: "",
  };

  @Output() clear = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() dateChange = new EventEmitter<
    MatDatepickerInputEvent<string, MatDateRange<string>>
  >();

  doClear() {
    this.clear.emit();
  }

  doSearchChange(query: string) {
    this.searchChange.emit(query);
  }

  doDateChange(value: MatDatepickerInputEvent<string, MatDateRange<string>>) {
    this.dateChange.emit(value);
  }
}
