import { Component, Input } from "@angular/core";
import { ClearableInputComponent } from "./clearable-input.component";
import {
  DateRange as MatDateRange,
  MatDatepickerInputEvent,
} from "@angular/material/datepicker";
import { DateTime } from "luxon";
import { setDateRangeFilterAction } from "state-management/actions/datasets.actions";
import { selectCreationTimeFilter } from "state-management/selectors/datasets.selectors";
import { Store } from "@ngrx/store";
import { FilterComponentInterface } from "./interface/filter-component.interface";
import { AppConfigService } from "app-config.service";
import { getFilterLabel } from "./utils";

interface DateRange {
  begin: string;
  end: string;
}

@Component({
  selector: "app-date-range-filter",
  templateUrl: "date-range-filter.component.html",
  styleUrls: ["date-range-filter.component.scss"],
})
export class DateRangeFilterComponent
  extends ClearableInputComponent
  implements FilterComponentInterface
{
  readonly componentName: string = "DateRangeFilter";
  readonly label: string = "Start Date - End Date";

  appConfig = this.appConfigService.getConfig();
  creationTimeFilter$ = this.store.select(selectCreationTimeFilter);

  dateRange: DateRange = {
    begin: "",
    end: "",
  };

  constructor(
    private store: Store,
    private appConfigService: AppConfigService,
  ) {
    super();

    const filters = this.appConfig.labelMaps?.filters;
    this.label = getFilterLabel(filters, this.componentName, this.label);
  }

  dateChanged(event: MatDatepickerInputEvent<string, MatDateRange<string>>) {
    if (event.value) {
      const name = event.targetElement.getAttribute("name");
      if (name === "begin") {
        this.dateRange.begin = (event.value as unknown as DateTime)
          .toUTC()
          .toISO();
        this.dateRange.end = "";
      }
      if (name === "end") {
        this.dateRange.end = (event.value as unknown as DateTime)
          .toUTC()
          .plus({ days: 1 })
          .toISO();
      }
      if (this.dateRange.begin.length > 0 && this.dateRange.end.length > 0) {
        this.store.dispatch(setDateRangeFilterAction(this.dateRange));
      }
    } else {
      this.store.dispatch(setDateRangeFilterAction({ begin: "", end: "" }));
    }
  }

  @Input()
  set clear(value: boolean) {
    if (value)
      this.dateRange = {
        begin: "",
        end: "",
      };
  }
}
