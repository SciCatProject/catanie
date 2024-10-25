import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { DatafilesActionComponent } from "./datafiles-action.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { PipesModule } from "shared/pipes/pipes.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { UserApi } from "shared/sdk";
import {
  MockHtmlElement,
  MockMatDialogRef,
  MockUserApi,
} from "shared/MockStubs";
import { ActionDataset } from "./datafiles-action.interfaces";

describe("1000: DatafilesActionComponent", () => {
  let component: DatafilesActionComponent;
  let fixture: ComponentFixture<DatafilesActionComponent>;
  let htmlForm: HTMLFormElement;
  let htmlInput: HTMLInputElement;

  const actionsConfig = [
    {
      id: "eed8efec-4354-11ef-a3b5-d75573a5d37f",
      order: 4,
      label: "Download All",
      files: "all",
      mat_icon: "download",
      url: "https://download.scicat.org",
      target: "_blank",
      enabled: "#SizeLimit",
      authorization: ["#datasetAccess", "#datasetPublic"],
    },
    {
      id: "3072fafc-4363-11ef-b9f9-ebf568222d26",
      order: 3,
      label: "Download Selected",
      files: "selected",
      mat_icon: "download",
      url: "https://download.scicat.org",
      target: "_blank",
      enabled: "#Selected && #SizeLimit",
      authorization: ["#datasetAccess", "#datasetPublic"],
    },
    {
      id: "4f974f0e-4364-11ef-9c63-03d19f813f4e",
      order: 2,
      label: "Notebook All",
      files: "all",
      icon: "/assets/icons/jupyter_logo.png",
      url: "https://notebook.scicat.org",
      target: "_blank",
      authorization: ["#datasetAccess", "#datasetPublic"],
    },
    {
      id: "fa3ce6ee-482d-11ef-95e9-ff2c80dd50bd",
      order: 1,
      label: "Notebook Selected",
      files: "selected",
      icon: "/assets/icons/jupyter_logo.png",
      url: "https://notebook.scicat.org",
      target: "_blank",
      enabled: "#Selected",
      authorization: ["#datasetAccess", "#datasetPublic"],
    },
  ];

  const actionDataset: ActionDataset = {
    pid: "1c7298da-4a7c-11ef-a2ce-2fdb7a34e7eb",
    sourceFolder: "/folder_1/folder_2/folder_3",
  };

  const actionFiles = [
    {
      path: "file1",
      size: 5000,
      time: "2019-09-06T13:11:37.102Z",
      chk: "string",
      uid: "string",
      gid: "string",
      perm: "string",
      selected: false,
      hash: "",
    },
    {
      path: "file2",
      size: 10000,
      time: "2019-09-06T13:11:37.102Z",
      chk: "string",
      uid: "string",
      gid: "string",
      perm: "string",
      selected: false,
      hash: "",
    },
  ];

  const lowerMaxFileSizeLimit = 9999;
  const higherMaxFileSizeLimit = 20000;
  enum maxSizeType {
    lower = "lower",
    higher = "higher",
  }

  enum selectedFilesType {
    none = "none",
    file1 = "file1",
    file2 = "file2",
    all = "all",
  }

  enum actionSelectorType {
    download_all = 0,
    download_selected = 1,
    notebook_all = 2,
    notebook_selected = 3,
  }

  const jwt = () => ({
    subscribe: (f: any) => ({
      jwt: "9a2322a8-4a7d-11ef-a0f5-d7c40fcf1693",
    }),
  });

  const getCurrentToken = () => ({
    id: "4ac45f3e-4d79-11ef-856c-6339dab93bee",
  });

  // const browserWindowMock = {
  //   document: {
  //     write() {},
  //     body: {
  //       setAttribute() {},
  //     },
  //   },
  // } as unknown as Window;

  beforeAll(() => {
    htmlForm = document.createElement("form");
    (htmlForm as HTMLFormElement).submit = () => {};
    htmlInput = document.createElement("input");
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        PipesModule,
        ReactiveFormsModule,
        MatDialogModule,
        RouterModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({}),
      ],
      declarations: [DatafilesActionComponent],
    });
    TestBed.overrideComponent(DatafilesActionComponent, {
      set: {
        providers: [
          { provide: UserApi, useClass: MockUserApi },
          { provide: MatDialogRef, useClass: MockMatDialogRef },
          { provide: UserApi, useValue: { jwt, getCurrentToken } },
        ],
      },
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatafilesActionComponent);
    component = fixture.componentInstance;
    component.files = structuredClone(actionFiles);
    component.actionConfig = actionsConfig[0];
    component.actionDataset = actionDataset;
    component.maxFileSize = lowerMaxFileSizeLimit;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  /*
   * Unit tests for enabled/disabled cases performed
   * ------------------------
   * Test # , Action            , Max Size           , Selected           , Status
   * -------------------------------------------------------------------------------
   * 0010   , Download All      , low max file size  , no selected files  , disabled
   * 0020   , Download All      , low max file size  , file 1 selected    , disabled
   * 0030   , Download All      , low max file size  , file 2 selected    , disabled
   * 0040   , Download All      , low max file size  , all files selected , disabled
   * 0050   , Download All      , high max file size , no selected files  , enabled
   * 0060   , Download All      , high max file size , file 1 selected    , enabled
   * 0070   , Download All      , high max file size , file 2 selected    , enabled
   * 0080   , Download All      , high max file size , all files selected , enabled
   *
   * 0090   , Download Selected , low max file size  , no selected files  , disabled
   * 0100   , Download Selected , low max file size  , file 1 selected    , enabled
   * 0110   , Download Selected , low max file size  , file 2 selected    , disabled
   * 0120   , Download Selected , low max file size  , all files selected , disabled
   * 0130   , Download Selected , high max file size , no selected files  , disabled
   * 0140   , Download Selected , high max file size , file 1 selected    , enabled
   * 0150   , Download Selected , high max file size , file 2 selected    , enabled
   * 0160   , Download Selected , high max file size , all files selected , enabled
   *
   * 0170   , Notebook All      , low max file size  , no selected files  , enabled
   * 0180   , Notebook All      , low max file size  , file 1 selected    , enabled
   * 0190   , Notebook All      , low max file size  , file 2 selected    , enabled
   * 0200   , Notebook All      , low max file size  , all files selected , enabled
   * 0210   , Notebook All      , high max file size , no selected files  , enabled
   * 0220   , Notebook All      , high max file size , file 1 selected    , enabled
   * 0230   , Notebook All      , high max file size , file 2 selected    , enabled
   * 0240   , Notebook All      , high max file size , all files selected , enabled
   *
   * 0250   , Notebook Selected , low max file size  , no selected files  , disbaled
   * 0260   , Notebook Selected , low max file size  , file 1 selected    , enabled
   * 0270   , Notebook Selected , low max file size  , file 2 selected    , enabled
   * 0280   , Notebook Selected , low max file size  , all files selected , enabled
   * 0290   , Notebook Selected , high max file size , no selected files  , disabled
   * 0300   , Notebook Selected , high max file size , file 1 selected    , enabled
   * 0310   , Notebook Selected , high max file size , file 2 selected    , enabled
   * 0320   , Notebook Selected , high max file size , all files selected , enabled
   */

  const testEnabledDisabledCases = [
    {
      test: "0010: Download All should be disabled with lowest max size limit and no files selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.none,
      result: true,
    },
    {
      test: "0020: Download All should be disabled with lowest max size limit and file 1 selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file1,
      result: true,
    },
    {
      test: "0030: Download All should be disabled with lowest max size limit and file 2 selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file2,
      result: true,
    },
    {
      test: "0040: Download All should be disabled with lowest max size limit and all files selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.all,
      result: true,
    },
    {
      test: "0050: Download All should be enabled with highest max size limit and no files selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.none,
      result: false,
    },
    {
      test: "0060: Download All should be enabled with highest max size limit and file 1 selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0070: Download All should be enabled with highest max size limit and file 2 selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0080: Download All should be enabled with highest max size limit and all files selected",
      action: actionSelectorType.download_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.all,
      result: false,
    },
    {
      test: "0090: Download Selected should be disabled with lowest max size limit and no files selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.none,
      result: true,
    },
    {
      test: "0100: Download Selected should be enabled with lowest max size limit and file 1 selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0110: Download Selected should be disabled with lowest max size limit and file 2 selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file2,
      result: true,
    },
    {
      test: "0120: Download Selected should be disabled with lowest max size limit and all files selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.all,
      result: true,
    },
    {
      test: "0130: Download Selected should be disabled with highest max size limit and no files selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.none,
      result: true,
    },
    {
      test: "0140: Download Selected should be enabled with highest max size limit and file 1 selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0150: Download Selected should be enabled with highest max size limit and file 2 selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0160: Download Selected should be enabled with highest max size limit and all files selected",
      action: actionSelectorType.download_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.all,
      result: false,
    },
    {
      test: "0170: Notebook All should be enabled with lowest max size limit and no files selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.none,
      result: false,
    },
    {
      test: "0180: Notebook All should be enabled with lowest max size limit and file 1 selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0190: Notebook All should be enabled with lowest max size limit and file 2 selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0200: Notebook All should be enabled with lowest max size limit and all files selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.lower,
      selection: selectedFilesType.all,
      result: false,
    },
    {
      test: "0210: Notebook All should be enabled with highest max size limit and no files selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.none,
      result: false,
    },
    {
      test: "0220: Notebook All should be enabled with highest max size limit and file 1 selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0230: Notebook All should be enabled with highest max size limit and file 2 selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0240: Notebook All should be enabled with highest max size limit and all files selected",
      action: actionSelectorType.notebook_all,
      limit: maxSizeType.higher,
      selection: selectedFilesType.all,
      result: false,
    },
    {
      test: "0250: Notebook Selected should be disabled with lowest max size limit and no files selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.none,
      result: true,
    },
    {
      test: "0260: Notebook Selected should be enabled with lowest max size limit and file 1 selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0270: Notebook Selected should be enabled with lowest max size limit and file 2 selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0280: Notebook Selected should be enabled with lowest max size limit and all files selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.lower,
      selection: selectedFilesType.all,
      result: false,
    },
    {
      test: "0290: Notebook Selected should be disabled with highest max size limit and no files selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.none,
      result: true,
    },
    {
      test: "0300: Notebook Selected should be enabled with highest max size limit and file 1 selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file1,
      result: false,
    },
    {
      test: "0310: Notebook Selected should be enabled with highest max size limit and file 2 selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.file2,
      result: false,
    },
    {
      test: "0320: Notebook Selected should be enabled with highest max size limit and all files selected",
      action: actionSelectorType.notebook_selected,
      limit: maxSizeType.higher,
      selection: selectedFilesType.all,
      result: false,
    },
  ];

  function selectTestCase(
    action: actionSelectorType,
    maxSize: maxSizeType,
    selectedFiles: selectedFilesType,
  ) {
    component.actionConfig = actionsConfig[action];
    switch (maxSize) {
      case maxSizeType.higher:
        component.maxFileSize = higherMaxFileSizeLimit;
        break;
      case maxSizeType.lower:
      default:
        component.maxFileSize = lowerMaxFileSizeLimit;
        break;
    }
    component.files = structuredClone(actionFiles);
    switch (selectedFiles) {
      case selectedFilesType.file1:
        component.files[0].selected = true;
        //component.files[1].selected = false;
        break;
      case selectedFilesType.file2:
        //component.files[0].selected = false;
        component.files[1].selected = true;
        break;
      case selectedFilesType.all:
        component.files[0].selected = true;
        component.files[1].selected = true;
        break;
    }
    fixture.detectChanges();
  }

  testEnabledDisabledCases.forEach((testCase) => {
    it(testCase.test, () => {
      selectTestCase(testCase.action, testCase.limit, testCase.selection);

      expect(component.disabled).toEqual(testCase.result);
    });
  });

  function createFakeElement(elementType: string): HTMLElement {
    //const element = new MockHtmlElement(elementType);
    //return element as unknown as HTMLElement;
    let element: HTMLElement = null;

    switch (elementType) {
      case "form":
        element = htmlForm.cloneNode(true) as HTMLElement;
        break;
      case "input":
        element = htmlInput.cloneNode(true) as HTMLElement;
        break;
      default:
        element = null;
    }
    return element;
  }

  it("0400: Form submission should have all files when Download All is clicked", async () => {
    selectTestCase(
      actionSelectorType.download_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );

    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    const formChildren = Array.from(component.form.children).map(
      (item) => item as unknown as MockHtmlElement,
    );
    const formFiles = formChildren.filter((item) =>
      item.name.includes("files"),
    );
    expect(formFiles.length).toEqual(2);
  });

  it("0410: Form submission should have correct url when Download All is clicked", async () => {
    selectTestCase(
      actionSelectorType.download_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    expect(component.form.action.replace(/\/$/, "")).toEqual(
      actionsConfig[actionSelectorType.download_all].url.replace(/\/$/, ""),
    );
  });

  it("0420: Form submission should have correct dataset when Download All is clicked", async () => {
    selectTestCase(
      actionSelectorType.download_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    const formChildren = Array.from(component.form.children).map(
      (item) => item as unknown as MockHtmlElement,
    );
    const formDataset = formChildren.filter((item) =>
      item.name.includes("dataset"),
    );
    expect(formDataset.length).toEqual(1);
    const datasetPid = formDataset[0].value;
    expect(datasetPid).toEqual(actionDataset.pid);
  });

  it("0430: Form submission should have correct file when Download Selected is clicked", async () => {
    const selectedFile = selectedFilesType.file1;
    selectTestCase(
      actionSelectorType.download_selected,
      maxSizeType.higher,
      selectedFile,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    const formChildren = Array.from(component.form.children).map(
      (item) => item as unknown as MockHtmlElement,
    );
    const formFiles = formChildren.filter((item) =>
      item.name.includes("files"),
    );
    expect(formFiles.length).toEqual(1);
    const formFilePath = formFiles[0].value;
    const selectedFilePath = actionFiles.filter(
      (item) => item.path == selectedFile,
    )[0].path;
    expect(formFilePath).toEqual(selectedFilePath);
  });

  it("0440: Form submission should have all files when Notebook All is clicked", async () => {
    selectTestCase(
      actionSelectorType.notebook_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    const formChildren = Array.from(component.form.children).map(
      (item) => item as unknown as MockHtmlElement,
    );
    const formFiles = formChildren.filter((item) =>
      item.name.includes("files"),
    );
    expect(formFiles.length).toEqual(2);
  });

  it("0450: Form submission should have correct url when Notebook All is clicked", async () => {
    selectTestCase(
      actionSelectorType.notebook_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    expect(component.form.action.replace(/\/$/, "")).toEqual(
      actionsConfig[actionSelectorType.notebook_all].url.replace(/\/$/, ""),
    );
  });

  it("0460: Form submission should have correct file when Notebook Selected is clicked", async () => {
    const selectedFile = selectedFilesType.file2;
    selectTestCase(
      actionSelectorType.notebook_selected,
      maxSizeType.higher,
      selectedFile,
    );
    spyOn(document, "createElement").and.callFake(createFakeElement);
    //spyOn(window, "open").and.returnValue(browserWindowMock);

    component.perform_action();

    const formChildren = Array.from(component.form.children).map(
      (item) => item as unknown as MockHtmlElement,
    );
    const formFiles = formChildren.filter((item) =>
      item.name.includes("files"),
    );
    expect(formFiles.length).toEqual(1);
    const formFilePath = formFiles[0].value;
    const selectedFilePath = actionFiles.filter(
      (item) => item.path == selectedFile,
    )[0].path;
    expect(formFilePath).toEqual(selectedFilePath);
  });

  it("0500: Download All action button should contain the correct label", () => {
    selectTestCase(
      actionSelectorType.download_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );

    const componentElement: HTMLElement = fixture.nativeElement;
    const actionButton = componentElement.querySelector(".action-button");
    expect(actionButton.innerHTML).toContain(
      actionsConfig[actionSelectorType.download_all].label,
    );
  });

  it("0510: Download Selected action button should contain the correct label", () => {
    selectTestCase(
      actionSelectorType.download_selected,
      maxSizeType.higher,
      selectedFilesType.none,
    );

    const componentElement: HTMLElement = fixture.nativeElement;
    const actionButton = componentElement.querySelector(".action-button");
    expect(actionButton.innerHTML).toContain(
      actionsConfig[actionSelectorType.download_selected].label,
    );
  });

  it("0520: Notebook All action button should contain the correct label", () => {
    selectTestCase(
      actionSelectorType.notebook_all,
      maxSizeType.higher,
      selectedFilesType.none,
    );

    const componentElement: HTMLElement = fixture.nativeElement;
    const actionButton = componentElement.querySelector(".action-button");
    expect(actionButton.innerHTML).toContain(
      actionsConfig[actionSelectorType.notebook_all].label,
    );
  });

  it("0530: Notebook Selected action button should contain the correct label", () => {
    selectTestCase(
      actionSelectorType.notebook_selected,
      maxSizeType.higher,
      selectedFilesType.none,
    );

    const componentElement: HTMLElement = fixture.nativeElement;
    const actionButton = componentElement.querySelector(".action-button");
    expect(actionButton.innerHTML).toContain(
      actionsConfig[actionSelectorType.notebook_selected].label,
    );
  });
});
