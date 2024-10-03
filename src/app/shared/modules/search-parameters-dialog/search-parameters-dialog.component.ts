import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AppConfigService } from "app-config.service";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  startWith,
  switchMap,
  take,
} from "rxjs/operators";
import { UnitsService } from "shared/services/units.service";
import { ScientificCondition } from "../../../state-management/models";
import { Observable, of } from "rxjs";

@Component({
  selector: "search-parameters-dialog",
  templateUrl: "./search-parameters-dialog.component.html",
})
export class SearchParametersDialogComponent {
  appConfig = this.appConfigService.getConfig();
  unitsEnabled = this.appConfig.scienceSearchUnitsEnabled;

  parameterKeys = this.data.parameterKeys;
  parameterTypes = this.data.parameterTypes;
  filteredOperators$: Observable<{ value: string; label: string }[]> = of([]); // TODO default set of operators
  units: string[] = [];

  parametersForm = new FormGroup({
    lhs: new FormControl(this.data.condition?.lhs || "", [
      Validators.required,
      Validators.minLength(2),
    ]),
    relation: new FormControl(this.data.condition?.relation || "GREATER_THAN", [
      Validators.required,
      Validators.minLength(9),
    ]),
    rhs: new FormControl<string | number>(this.data.condition?.rhs || "", [
      Validators.required,
      Validators.minLength(1),
    ]),
    unit: new FormControl(""),
  });

  filteredUnits$ = this.parametersForm.get("unit")?.valueChanges.pipe(
    startWith(""),
    map((value: string) =>
      this.units.filter((unit) =>
        unit.toLowerCase().includes(value.toLowerCase()),
      ),
    ),
  );

  filteredKeys$ = this.parametersForm.get("lhs")?.valueChanges.pipe(
    startWith(""),
    map((value: string) =>
      this.parameterKeys.filter((key) =>
        key.toLowerCase().includes(value.toLowerCase()),
      ),
    ),
  );

  constructor(
    public appConfigService: AppConfigService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      parameterKeys: string[];
      parameterTypes: Record<string, string>[];
      condition?: ScientificCondition;
    },
    public dialogRef: MatDialogRef<SearchParametersDialogComponent>,
    private unitsService: UnitsService,
  ) {
    if (this.data.condition?.lhs) {
      this.getUnits(this.data.condition.lhs);
    }

    // Dynamically update operators based on the field selected by the user
    this.parametersForm
      .get("lhs")!
      .valueChanges.pipe(
        debounceTime(300),
        filter((selectedLhs: string) => selectedLhs && selectedLhs.length > 3),
        distinctUntilChanged(),
        mergeMap((selectedLhs: string) => {
          return this.parameterTypes.filter((type) =>
            type.metadataKey.includes(selectedLhs),
          );
        }),
        take(1),
        map((field) => {
          return this.extractFieldType(field.metadataType);
        }),
      )
      .subscribe((type) => {
        this.filteredOperators$ = of(this.getOperatorsByType(type));
      });
  }

  // Helper to extract the field type from the dataset
  private extractFieldType(type: string): string {
    // Assuming metadata structure contains field type info
    if (type === "string") {
      return "string";
    } else if (type === "int" || type === "double" /*|| type === "mixed"*/) {
      // TODO what to do with mixed type
      return "number";
    } else if (type === "Date") {
      return "date";
    }

    return "string"; // Default to string if type can't be inferred
  }

  // Dynamically fetch operators based on field type
  private getOperatorsByType(
    fieldType: string,
  ): { value: string; label: string }[] {
    switch (fieldType) {
      case "string":
        return [
          { value: "EQUAL_TO_STRING", label: "is equal to (string)" },
          { value: "CONTAINS", label: "contains" },
        ];
      case "number":
        return [
          { value: "GREATER_THAN", label: "is greater than" },
          { value: "LESS_THAN", label: "is less than" },
          { value: "EQUAL_TO_NUMERIC", label: "is equal to (numeric)" },
        ];
      case "date":
        return [
          { value: "BEFORE", label: "is before" },
          { value: "AFTER", label: "is after" },
        ];
      default:
        return [{ value: "EQUAL", label: "is equal to" }];
    }
  }

  add = (): void => {
    const { lhs, relation, unit } = this.parametersForm.value;
    const rawRhs = this.parametersForm.get("rhs")?.value;
    const rhs =
      relation === "EQUAL_TO_STRING" ? String(rawRhs) : Number(rawRhs);
    this.parametersForm.patchValue({ rhs });
    this.dialogRef.close({ data: { lhs, relation, rhs, unit } });
  };

  cancel = (): void => this.dialogRef.close();

  getUnits = (parameterKey: string): void => {
    this.units = this.unitsService.getUnits(parameterKey);
    this.toggleUnitField();
  };

  toggleUnitField = (): void => {
    const lhsInvalid = this.parametersForm.get("lhs")?.invalid;
    const { relation } = this.parametersForm.value;
    const isStringRelation = relation === "EQUAL_TO_STRING" ? true : false;
    const unitField = this.parametersForm.get("unit");
    unitField?.enable();
    if (lhsInvalid || isStringRelation) {
      unitField?.disable();
    }
  };

  isInvalid = (): boolean => {
    const { invalid } = this.parametersForm;
    const { lhs, relation, rhs } = this.parametersForm.value;

    if (invalid) {
      return invalid;
    }
    if (relation !== "EQUAL_TO_STRING" && isNaN(Number(rhs))) {
      return true;
    }
    return lhs.length * (rhs as string).length === 0;
  };

  get lhs(): string {
    return this.parametersForm.get("lhs")?.value;
  }
}
