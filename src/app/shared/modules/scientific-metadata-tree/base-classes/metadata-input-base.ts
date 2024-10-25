import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Observable } from "rxjs";
import { UnitsService } from "shared/services/units.service";
import { startWith, map } from "rxjs/operators";
import { DateTimeService } from "shared/services/date-time.service";

export enum Type {
  quantity = "quantity",
  date = "date",
  number = "number",
  string = "string",
  boolean = "boolean",
}
export class MetadataInputBase {
  unitsService: UnitsService;
  metadataForm: FormGroup;
  filteredUnits$: Observable<string[]>;
  units: string[];
  typeValues: string[] = Object.values(Type);
  dateTimeService: DateTimeService;
  constructor() {
    this.unitsService = new UnitsService();
    this.unitsService.getUnits();
    this.dateTimeService = new DateTimeService();
  }
  unitValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const allowed = this.unitsService.getUnits().includes(control.value);
      return allowed ? null : { forbiddenUnit: "Invalid unit" };
    };
  }
  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isValid = this.dateTimeService.isValidDateTime(control.value);
      return isValid ? null : { invalidDate: "Invalid date or format" };
    };
  }
  booleanValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value).toLowerCase();
      const valid = value === "true" || value === "false";
      return valid
        ? null
        : { invalidBoolean: 'Boolean must be "true" or "false"' };
    };
  }
  numberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const invalid = control.value === "" || isNaN(Number(control.value));
      return invalid ? { invalidNumber: "Invalid number" } : null;
    };
  }
  detectType() {
    const type = this.metadataForm.get("type").value;
    this.metadataForm.get("value").clearValidators();
    this.metadataForm.get("date").disable();
    switch (type) {
      case Type.quantity:
        this.metadataForm.get("unit").enable();
        this.metadataForm
          .get("value")
          .setValidators([Validators.required, this.numberValidator()]);
        break;
      case Type.date:
        this.metadataForm.get("unit").disable();
        this.metadataForm.get("date").enable();
        this.metadataForm
          .get("date")
          .setValidators([Validators.required, this.dateValidator()]);
        break;
      case Type.boolean:
        this.metadataForm.get("unit").disable();
        this.metadataForm
          .get("value")
          .setValidators([Validators.required, this.booleanValidator()]);
        break;
      case Type.number:
        this.metadataForm.get("unit").disable();
        this.metadataForm
          .get("value")
          .setValidators([Validators.required, this.numberValidator()]);
        break;
      default:
        this.metadataForm.get("unit").disable();
        this.metadataForm
          .get("value")
          .setValidators([Validators.required, Validators.minLength(1)]);
    }
    this.metadataForm.get("unit").updateValueAndValidity();
    this.metadataForm.get("value").updateValueAndValidity();
  }
  getType() {
    return this.metadataForm.get("type").value;
  }
  getUnits(fieldName: string): void {
    const name = this.metadataForm.get(fieldName).value;
    this.units = this.unitsService.getUnits(name);
    this.filteredUnits$ = this.metadataForm.get("unit").valueChanges.pipe(
      startWith(""),
      map((value: string) => {
        const filterValue = value.toLowerCase();
        return this.units.filter((unit) =>
          unit.toLowerCase().includes(filterValue),
        );
      }),
    );
  }
  fieldHasError(field: string): boolean {
    return this.metadataForm.get(field).errors ? true : false;
  }
  getErrorMessage(field: string) {
    switch (field) {
      case "value":
        if (this.metadataForm.get(field).hasError("required")) {
          return "Value is required";
        }
        if (this.metadataForm.get(field).hasError("invalidNumber")) {
          return this.metadataForm.get(field).getError("invalidNumber");
        }
        if (this.metadataForm.get(field).hasError("invalidBoolean")) {
          return this.metadataForm.get(field).getError("invalidBoolean");
        }
        return null;
      case "date":
        if (this.metadataForm.get(field).hasError("invalidDate")) {
          return this.metadataForm.get(field).getError("invalidDate");
        }
        return null;
      case "unit":
        if (this.metadataForm.get(field).hasError("required")) {
          return "A unit is required for quantities";
        }
        if (this.metadataForm.get(field).hasError("forbiddenUnit")) {
          return this.metadataForm.get(field).getError("forbiddenUnit");
        }
        return null;
      default:
        return null;
    }
  }
}
