import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AppConfigService } from "app-config.service";
import { map, startWith } from "rxjs/operators";
import { UnitsService } from "shared/services/units.service";

@Component({
  selector: "search-parameters-dialog",
  templateUrl: "./search-parameters-dialog.component.html",
})
export class SearchParametersDialogComponent {
  appConfig = this.appConfigService.getConfig();
  unitsEnabled = this.appConfig.scienceSearchUnitsEnabled;

  parameterKeys = this.data.parameterKeys;
  units: string[] = [];

  parametersForm = new FormGroup({
    lhs: new FormControl("", [Validators.required, Validators.minLength(2)]),
    relation: new FormControl("GREATER_THAN", [
      Validators.required,
      Validators.minLength(9),
    ]),
    rhs: new FormControl<string | number>("", [
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
    @Inject(MAT_DIALOG_DATA) public data: { parameterKeys: string[] },
    public dialogRef: MatDialogRef<SearchParametersDialogComponent>,
    private unitsService: UnitsService,
  ) {}

  add = (): void => {
    const { lhs, relation, unit } = this.parametersForm.value;
    const rawRhs = this.parametersForm.get("rhs")?.value;
    const rhs = ["CONTAINS_STRING", "EQUAL_TO_STRING"].includes(relation)
      ? String(rawRhs)
      : Number(rawRhs);
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
    const isStringRelation = ["CONTAINS_STRING", "EQUAL_TO_STRING"].includes(
      relation,
    )
      ? true
      : false;
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
    if (
      !["CONTAINS_STRING", "EQUAL_TO_STRING"].includes(relation) &&
      isNaN(Number(rhs))
    ) {
      return true;
    }
    return lhs.length * (rhs as string).length === 0;
  };

  get lhs(): string {
    return this.parametersForm.get("lhs")?.value;
  }
}
