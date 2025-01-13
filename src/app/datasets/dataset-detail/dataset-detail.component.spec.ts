import { DatafilesComponent } from "../../datasets/datafiles/datafiles.component";
import { DatasetDetailComponent } from "./dataset-detail.component";
import { LinkyPipe } from "ngx-linky";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { SharedScicatFrontendModule } from "shared/shared.module";
import { MatTableModule } from "@angular/material/table";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { Observable, of } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { NgxJsonViewerModule } from "ngx-json-viewer";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MockStore } from "@ngrx/store/testing";
import { Store, StoreModule } from "@ngrx/store";
import {
  addKeywordFilterAction,
  clearFacetsAction,
  updatePropertyAction,
} from "state-management/actions/datasets.actions";
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from "@angular/material/slide-toggle";
import { ActivatedRoute, Router } from "@angular/router";
import { MockActivatedRoute, mockDataset } from "shared/MockStubs";
import { DialogComponent } from "shared/modules/dialog/dialog.component";
import { AppConfigService } from "app-config.service";
import { AttachmentService } from "shared/services/attachment.service";
import { OutputDatasetObsoleteDto } from "@scicatproject/scicat-sdk-ts";
import {
  TranslateLoader,
  TranslateModule,
  TranslationObject,
} from "@ngx-translate/core";
class MockTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({});
  }
}

describe("DatasetDetailComponent", () => {
  let component: DatasetDetailComponent;
  let fixture: ComponentFixture<DatasetDetailComponent>;

  const router = {
    navigateByUrl: jasmine.createSpy("navigateByUrl"),
  };

  const getConfig = () => ({
    datasetDetailView: {
      currentLabel: "test",
    },
  });

  let store: MockStore;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatTabsModule,
        NgxJsonViewerModule,
        SharedScicatFrontendModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader,
          },
        }),
        StoreModule.forRoot({}),
      ],
      providers: [AttachmentService],
      declarations: [DatasetDetailComponent, DatafilesComponent, LinkyPipe],
    });
    TestBed.overrideComponent(DatasetDetailComponent, {
      set: {
        providers: [
          { provide: Router, useValue: router },
          {
            provide: AppConfigService,
            useValue: {
              getConfig,
            },
          },
          { provide: ActivatedRoute, useClass: MockActivatedRoute },
        ],
      },
    });
    TestBed.compileComponents();
  }));

  beforeEach(inject([Store], (mockStore: MockStore) => {
    store = mockStore;
    fixture = TestBed.createComponent(DatasetDetailComponent);
    component = fixture.componentInstance;
    component.dataset = {
      pid: "testPid",
      isPublished: false,
    } as unknown as OutputDatasetObsoleteDto;
    fixture.detectChanges();
  }));
  afterEach(() => {
    fixture.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#onClickKeyword()", () => {
    it("should update datasets keyword filter and navigate to datasets table", () => {
      const dispatchSpy = spyOn(store, "dispatch");
      const keyword = "test";
      component.dataset = mockDataset;
      component.onClickKeyword(keyword);

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy).toHaveBeenCalledWith(clearFacetsAction());
      expect(dispatchSpy).toHaveBeenCalledWith(
        addKeywordFilterAction({ keyword }),
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith("/datasets");
    });
  });

  describe("#onAddKeyword()", () => {
    it("should add property keywords if it does not exist already", () => {
      const event = {
        chipInput: {
          inputElement: {
            value: "test",
          },
        },
        value: "test",
      };
      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      component.onEditModeEnable();
      component.onAddKeyword(event as MatChipInputEvent);

      expect(component.keywords).toBeTruthy();
      expect(component.keywords.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
    });

    it("should do nothing if keyword already exists", () => {
      const event = {
        chipInput: {
          inputElement: {
            value: "test",
          },
        },
        value: "test",
      };
      component.dataset = mockDataset;
      component.dataset.keywords = ["test"];
      component.onEditModeEnable();
      expect(component.keywords.value.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
      component.onAddKeyword(event as MatChipInputEvent);

      expect(component.keywords.value.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
    });

    it("should add a keyword if the keyword does not exist", () => {
      const event = {
        chipInput: {
          inputElement: {
            value: "test",
          },
        },
        value: "test",
      };
      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      component.dataset.keywords = [];
      component.onEditModeEnable();
      expect(component.keywords.value.length).toBe(0);
      expect(component.form.value.keywords.length).toBe(0);
      component.onAddKeyword(event as MatChipInputEvent);

      expect(component.keywords.value.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
    });
  });

  describe("#onRemoveKeyword()", () => {
    it("should do nothing if the keyword does not exist", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      const keyword = "test";
      component.dataset = mockDataset;
      component.dataset.keywords = [];
      component.onRemoveKeyword(keyword);

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    it("should dispatch an updatePropertyAction if the keyword does exist", () => {
      const keyword = "test";
      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      component.dataset.keywords = [keyword];
      component.onEditModeEnable();
      expect(component.keywords.value.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
      component.onRemoveKeyword(keyword);

      expect(component.keywords.value.length).toBe(0);
      expect(component.form.value.keywords.length).toBe(0);
    });
  });

  describe("#onSaveGeneralInformationChanges()", () => {
    it("should dispatch an updatePropertyAction", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      const keyword = "test";
      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      component.dataset.keywords = [keyword];
      component.dataset.datasetName = "Test dataset name";
      component.dataset.description = "Test dataset description";
      component.onEditModeEnable();
      expect(component.keywords.value.length).toBe(1);
      expect(component.form.value.keywords.length).toBe(1);
      component.onSaveGeneralInformationChanges();

      const property = {
        keywords: component.dataset.keywords,
        datasetName: component.dataset.datasetName,
        description: component.dataset.description,
      };

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        updatePropertyAction({ pid, property }),
      );
    });
  });

  describe("#onSlidePublic()", () => {
    it("should dispatch a updatePropertyAction", () => {
      const dispatchSpy = spyOn(store, "dispatch");
      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      const event = new MatSlideToggleChange({} as MatSlideToggle, true);
      const property = { isPublished: true };
      component.onSlidePublic(event);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        updatePropertyAction({ pid, property }),
      );
    });
  });

  describe("#onRemoveShare()", () => {
    it("should do nothing if dataset is undefined", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      component.dataset = undefined;
      const share = "test";
      component.onRemoveShare(share);

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    it("should do nothing if dataset is defined and group does not exist", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      component.dataset = mockDataset;
      component.dataset.sharedWith = [];
      const share = "test";
      component.onRemoveShare(share);

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    it("should dispatch an updatePropertyAction if dataset is defined and group exists", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      const pid = "testPid";
      const share = "test";
      component.dataset = {
        pid,
        isPublished: false,
        sharedWith: [share],
      } as unknown as OutputDatasetObsoleteDto;
      const dialogOpenSpy = spyOn(component.dialog, "open").and.returnValue({
        afterClosed: () => of("ok"),
      } as MatDialogRef<DialogComponent>);
      component.onRemoveShare(share);

      const property = { sharedWith: [] };
      expect(dialogOpenSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        updatePropertyAction({ pid, property }),
      );
    });
  });

  describe("#onClickInstrument()", () => {
    it("should navigate to an instrument", () => {
      const instrumentId = "testId";

      component.onClickInstrument(instrumentId);

      expect(router.navigateByUrl).toHaveBeenCalledWith(
        "/instruments/" + instrumentId,
      );
    });
  });

  describe("#onClickProposal()", () => {
    it("should navigate to a proposal", () => {
      const proposalId = "ABC123";
      component.onClickProposal(proposalId);

      expect(router.navigateByUrl).toHaveBeenCalledWith(
        "/proposals/" + proposalId,
      );
    });
  });

  describe("#onClickSample()", () => {
    it("should navigate to a sample", () => {
      const sampleId = "testId";
      component.onClickSample(sampleId);

      expect(router.navigateByUrl).toHaveBeenCalledWith("/samples/" + sampleId);
    });
  });

  describe("#onSaveMetadata()", () => {
    it("should dispatch an updatePropertyAction", () => {
      const dispatchSpy = spyOn(store, "dispatch");

      const pid = "testPid";
      component.dataset = mockDataset;
      component.dataset.pid = pid;
      const metadata = {};
      const property = { scientificMetadata: metadata };
      component.onSaveMetadata(metadata);

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        updatePropertyAction({ pid, property }),
      );
    });
  });
});
