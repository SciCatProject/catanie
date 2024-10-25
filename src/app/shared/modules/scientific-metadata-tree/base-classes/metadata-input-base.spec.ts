import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { Type } from "../base-classes/metadata-input-base";
import { FlatNodeEdit } from "../tree-edit/tree-edit.component";
import { MetadataInputComponent } from "../metadata-input/metadata-input.component";
import { FormatNumberPipe } from "shared/pipes/format-number.pipe";
import { ScientificMetadataTreeModule } from "../scientific-metadata-tree.modules";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("MetadataInputBase", () => {
  let component: MetadataInputComponent;
  let fixture: ComponentFixture<MetadataInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MetadataInputComponent],
      imports: [ScientificMetadataTreeModule, BrowserAnimationsModule],
      providers: [FormBuilder, FormatNumberPipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataInputComponent);
    component = fixture.componentInstance;
    const data = new FlatNodeEdit();
    data.key = "key";
    data.value = "value";
    data.unit = null;
    data.level = 0;
    data.visible = true;
    data.expandable = false;
    component.data = data;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  describe("#getErrorMessage() && #Validator functions", () => {
    it("#getErrorMessage() value is required", () => {
      component.metadataForm.get("type").setValue(Type.string);
      component.detectType();
      component.metadataForm.get("value").setValue("");
      const result = component.getErrorMessage("value");
      expect(result).toEqual("Value is required");
    });
    it("should not return any error", () => {
      component.metadataForm.get("type").setValue(Type.string);
      component.detectType();
      const result = component.getErrorMessage("value");
      expect(result).toBeNull();
    });
    it("#getErrorMessage() && # dateValidator() invalid date", () => {
      component.metadataForm.get("type").setValue(Type.date);
      component.detectType();
      const result = component.getErrorMessage("date");
      expect(result).toEqual("Invalid date or format");
    });
    it("#getErrorMessage() && # dateValidator() should not return any error", () => {
      component.metadataForm.get("type").setValue(Type.date);
      component.detectType();
      component.metadataForm.get("value").setValue("2020-04-01");
      const result = component.getErrorMessage("value");
      expect(result).toBeNull();
    });
    it("#getErrorMessage() && #booleanValidator() should not return any error", () => {
      component.metadataForm.get("type").setValue(Type.boolean);
      component.detectType();
      component.metadataForm.get("value").setValue("true");
      const result = component.getErrorMessage("value");
      expect(result).toBeNull();
    });
    it("#getErrorMessage() && #booleanValidator() invalid boolean", () => {
      component.metadataForm.get("type").setValue(Type.boolean);
      component.detectType();
      const result = component.getErrorMessage("value");
      expect(result).toEqual('Boolean must be "true" or "false"');
    });
    it("#getErrorMessage() && #numberValidator() should not return any error", () => {
      component.metadataForm.get("type").setValue(Type.number);
      component.detectType();
      component.metadataForm.get("value").setValue(1);
      const result = component.getErrorMessage("value");
      expect(result).toBeNull();
    });
    it("#getErrorMessage() && numberValidator() invalid number", () => {
      component.metadataForm.get("type").setValue(Type.number);
      component.detectType();
      const result = component.getErrorMessage("value");
      expect(result).toEqual("Invalid number");
    });
    it("#getErrorMessage() && unit is required", () => {
      component.metadataForm.get("type").setValue(Type.quantity);
      component.detectType();
      const result = component.getErrorMessage("unit");
      expect(result).toEqual("A unit is required for quantities");
    });
    it("#getErrorMessage() && #unitValidator() should not return any error", () => {
      component.metadataForm.get("type").setValue(Type.quantity);
      component.detectType();
      component.metadataForm.get("unit").setValue("angstrom");
      const result = component.getErrorMessage("unit");
      expect(result).toBeNull();
    });
    it("#getErrorMessage() && #unitValidator() invalid unit", () => {
      component.metadataForm.get("type").setValue(Type.quantity);
      component.detectType();
      component.metadataForm.get("unit").setValue("invalid unit");
      const result = component.getErrorMessage("unit");
      expect(result).toEqual("Invalid unit");
    });
  });
  describe("#detectType()", () => {
    it("#detectType() quantity", () => {
      component.metadataForm.get("type").setValue(Type.quantity);
      component.detectType();
      expect(component.metadataForm.get("unit").enabled).toBeTrue();
    });
    it("#detectType() date", () => {
      component.metadataForm.get("type").setValue(Type.date);
      component.detectType();
      expect(component.metadataForm.get("unit").disabled).toBeTrue();
    });
    it("#detectType() boolean", () => {
      component.metadataForm.get("type").setValue(Type.boolean);
      component.detectType();
      expect(component.metadataForm.get("unit").disabled).toBeTrue();
    });
    it("#detectType() number", () => {
      component.metadataForm.get("type").setValue(Type.number);
      component.detectType();
      expect(component.metadataForm.get("unit").disabled).toBeTrue();
    });
    it("#detectType() others", () => {
      component.metadataForm.get("type").setValue(Type.string);
      component.detectType();
      expect(component.metadataForm.get("unit").disabled).toBeTrue();
    });
  });
});
