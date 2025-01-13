import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { cold, hot } from "jasmine-marbles";
import * as fromActions from "../actions/datasets.actions";
import { DatasetEffects } from "./datasets.effects";
import { FacetCounts } from "state-management/state/datasets.store";
import {
  selectFullqueryParams,
  selectFullfacetParams,
  selectCurrentDataset,
  selectRelatedDatasetsFilters,
} from "state-management/selectors/datasets.selectors";
import {
  loadingAction,
  loadingCompleteAction,
  updateUserSettingsAction,
} from "state-management/actions/user.actions";
import { ScientificCondition } from "state-management/models";
import { Type } from "@angular/core";
import {
  DatasetsService,
  OutputDatasetObsoleteDto,
} from "@scicatproject/scicat-sdk-ts";
import { TestObservable } from "jasmine-marbles/src/test-observables";
import {
  createMock,
  mockAttachment as attachment,
  mockDataset,
} from "shared/MockStubs";

const derivedData = createMock<OutputDatasetObsoleteDto>({
  investigator: "",
  inputDatasets: [],
  usedSoftware: [],
  owner: "",
  contactEmail: "",
  sourceFolder: "",
  creationTime: new Date().toString(),
  type: "derived",
  ownerGroup: "",
  createdAt: "",
  createdBy: "",
  creationLocation: "",
  numberOfFilesArchived: 0,
  principalInvestigator: "",
  updatedAt: "",
  updatedBy: "",
});
const derivedDataset = { pid: "testPid", ...derivedData };

const dataset = { pid: "testPid", ...mockDataset };

describe("DatasetEffects", () => {
  let actions: TestObservable;
  let effects: DatasetEffects;
  let datasetApi: jasmine.SpyObj<DatasetsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatasetEffects,
        provideMockActions(() => actions),
        provideMockStore({
          selectors: [
            { selector: selectCurrentDataset, value: dataset },
            {
              selector: selectRelatedDatasetsFilters,
              value: { skip: 0, limit: 25, sortField: "creationTime:desc" },
            },
            {
              selector: selectFullqueryParams,
              value: {
                query: JSON.stringify({ isPublished: false }),
                limits: { skip: 0, limit: 25, order: "test asc" },
              },
            },
            { selector: selectFullfacetParams, value: {} },
          ],
        }),
        {
          provide: DatasetsService,
          useValue: jasmine.createSpyObj("datasetApi", [
            "datasetsControllerCreate",
            "datasetsControllerFullquery",
            "datasetsControllerFullfacet",
            "datasetsControllerMetadataKeys",
            "datasetsControllerFindAll",
            "datasetsControllerFindById",
            "datasetsControllerFindByIdAndUpdate",
            "datasetsControllerCreateAttachment",
            "datasetsControllerFindOneAttachmentAndUpdate",
            "datasetsControllerFindOneAttachmentAndRemove",
            "datasetsControllerCount",
          ]),
        },
      ],
    });

    effects = TestBed.inject(DatasetEffects);
    datasetApi = injectedStub(DatasetsService);
  });

  const injectedStub = <S>(service: Type<S>): jasmine.SpyObj<S> =>
    TestBed.inject(service) as jasmine.SpyObj<S>;

  describe("fetchDatasets$", () => {
    it("should result in a fetchDatasetsCompleteAction", () => {
      const datasets = [dataset];
      const action = fromActions.fetchDatasetsAction();
      const outcome = fromActions.fetchDatasetsCompleteAction({ datasets });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: datasets });
      datasetApi.datasetsControllerFullquery.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchDatasets$).toBeObservable(expected);
    });

    it("should result in a fetchDatasetsFailedAction", () => {
      const action = fromActions.fetchDatasetsAction();
      const outcome = fromActions.fetchDatasetsFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFullquery.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchDatasets$).toBeObservable(expected);
    });
  });

  describe("fetchFacetCounts$", () => {
    it("should result in a fetchFacetCountsCompleteAction", () => {
      const facetCounts: FacetCounts = {
        creationLocation: [{ count: 0 }],
        creationTime: [{ count: 0 }],
        keywords: [{ count: 0 }],
        ownerGroup: [{ count: 0 }],
        type: [{ count: 0 }],
      };
      const allCounts = 0;
      const action = fromActions.fetchFacetCountsAction();
      const outcome = fromActions.fetchFacetCountsCompleteAction({
        facetCounts,
        allCounts,
      });

      const responseArray = [
        {
          all: [{ totalSets: 0 }],
          creationLocation: [{ count: 0 }],
          creationTime: [{ count: 0 }],
          keywords: [{ count: 0 }],
          ownerGroup: [{ count: 0 }],
          type: [{ count: 0 }],
        },
      ];
      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: responseArray });
      datasetApi.datasetsControllerFullfacet.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchFacetCounts$).toBeObservable(expected);
    });

    it("should result in a fetchFacetCountsFailedAction", () => {
      const action = fromActions.fetchFacetCountsAction();
      const outcome = fromActions.fetchFacetCountsFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFullfacet.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchFacetCounts$).toBeObservable(expected);
    });
  });

  describe("fetchMetadataKeys$", () => {
    it("should result in a fetchMetadataKeysCompleteAction", () => {
      const metadataKeys = ["test"];
      const action = fromActions.fetchMetadataKeysAction();
      const outcome = fromActions.fetchMetadataKeysCompleteAction({
        metadataKeys,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: metadataKeys });
      datasetApi.datasetsControllerMetadataKeys.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchMetadataKeys$).toBeObservable(expected);
    });

    it("should result in a fetchMetadataKeysFailedAction", () => {
      const action = fromActions.fetchMetadataKeysAction();
      const outcome = fromActions.fetchMetadataKeysFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerMetadataKeys.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchMetadataKeys$).toBeObservable(expected);
    });
  });

  describe("updateUserDatasetsLimit$", () => {
    it("should result in an updateUserSettingsAction", () => {
      const page = 0;
      const limit = 25;
      const property = { datasetCount: limit };
      const action = fromActions.changePageAction({ page, limit });
      const outcome = updateUserSettingsAction({ property });

      actions = hot("-a", { a: action });

      const expected = cold("-b", { b: outcome });
      expect(effects.updateUserDatasetsLimit$).toBeObservable(expected);
    });
  });

  describe("updateMetadataKeys$", () => {
    describe("ofType addScientificConditionAction", () => {
      it("should result in a fetchMetadataKeysAction", () => {
        const condition: ScientificCondition = {
          lhs: "test",
          relation: "EQUAL_TO_NUMERIC",
          rhs: 1000,
          unit: "s",
        };
        const action = fromActions.addScientificConditionAction({ condition });
        const outcome = fromActions.fetchMetadataKeysAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.updateMetadataKeys$).toBeObservable(expected);
      });
    });

    describe("ofType removeScientificConditionAction", () => {
      it("should result in a fetchMetadataKeysAction", () => {
        const condition: ScientificCondition = {
          lhs: "test",
          relation: "EQUAL_TO_NUMERIC",
          rhs: 1000,
          unit: "s",
        };
        const action = fromActions.removeScientificConditionAction({
          condition,
        });
        const outcome = fromActions.fetchMetadataKeysAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.updateMetadataKeys$).toBeObservable(expected);
      });
    });

    describe("ofType clearFacetsAction", () => {
      it("should result in a fetchMetadataKeysAction", () => {
        const action = fromActions.clearFacetsAction();
        const outcome = fromActions.fetchMetadataKeysAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.updateMetadataKeys$).toBeObservable(expected);
      });
    });
  });

  describe("fetchDataset$", () => {
    const pid = "testPid";

    it("should result in a fetchDatasetCompleteAction", () => {
      const action = fromActions.fetchDatasetAction({ pid });
      const outcome = fromActions.fetchDatasetCompleteAction({ dataset });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: dataset });
      datasetApi.datasetsControllerFindById.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchDataset$).toBeObservable(expected);
    });

    it("should result in a fetchDatasetFailedAction", () => {
      const action = fromActions.fetchDatasetAction({ pid });
      const outcome = fromActions.fetchDatasetFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFindById.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchDataset$).toBeObservable(expected);
    });
  });

  describe("fetchRelatedDatasets$", () => {
    it("should result in a fetchRelatedDatasetsCompleteAction", () => {
      const relatedDatasets = [dataset];
      const action = fromActions.fetchRelatedDatasetsAction();
      const outcome = fromActions.fetchRelatedDatasetsCompleteAction({
        relatedDatasets,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: relatedDatasets });
      datasetApi.datasetsControllerFindAll.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchRelatedDatasets$).toBeObservable(expected);
    });
    it("should result in a fetchRelatedDatasetsFailedAction", () => {
      const action = fromActions.fetchRelatedDatasetsAction();
      const outcome = fromActions.fetchRelatedDatasetsFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFindAll.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchRelatedDatasets$).toBeObservable(expected);
    });
  });

  describe("fetchRelatedDatasetsCount$", () => {
    it("should result in a fetchRelatedDatasetsCountCompleteAction", () => {
      const count = 3;
      const action = fromActions.fetchRelatedDatasetsAction();
      const outcome = fromActions.fetchRelatedDatasetsCountCompleteAction({
        count,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: { count } });
      datasetApi.datasetsControllerCount.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchRelatedDatasetsCount$).toBeObservable(expected);
    });
    it("should result in a fetchRelatedDatasetsCountFailedAction", () => {
      const action = fromActions.fetchRelatedDatasetsAction();
      const outcome = fromActions.fetchRelatedDatasetsCountFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerCount.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.fetchRelatedDatasetsCount$).toBeObservable(expected);
    });
  });

  describe("addDataset$", () => {
    it("should result in an addDatasetCompleteAction, a fetchDatasetsAction and a fetchDatasetAction", () => {
      const action = fromActions.addDatasetAction({ dataset: derivedDataset });
      const outcome1 = fromActions.addDatasetCompleteAction({
        dataset: derivedDataset,
      });
      const outcome2 = fromActions.fetchDatasetsAction();
      const outcome3 = fromActions.fetchDatasetAction({
        pid: derivedDataset.pid,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: derivedDataset });
      datasetApi.datasetsControllerCreate.and.returnValue(response);

      const expected = cold("--(bcd)", {
        b: outcome1,
        c: outcome2,
        d: outcome3,
      });
      expect(effects.addDataset$).toBeObservable(expected);
    });

    it("should result in an addDatasetFailedAction", () => {
      const action = fromActions.addDatasetAction({ dataset: derivedDataset });
      const outcome = fromActions.addDatasetFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerCreate.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.addDataset$).toBeObservable(expected);
    });
  });

  describe("updateProperty$", () => {
    const pid = "testPid";
    const property = { isPublished: true };
    it("should result in an updatePropertyCompleteAction and a fetchDatasetAction", () => {
      const action = fromActions.updatePropertyAction({
        pid,
        property,
      });
      const outcome1 = fromActions.updatePropertyCompleteAction();
      const outcome2 = fromActions.fetchDatasetAction({ pid });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: dataset });
      datasetApi.datasetsControllerFindByIdAndUpdate.and.returnValue(response);

      const expected = cold("--(bc)", { b: outcome1, c: outcome2 });
      expect(effects.updateProperty$).toBeObservable(expected);
    });

    it("should result in a updatePropertyFailedAction", () => {
      const action = fromActions.updatePropertyAction({
        pid,
        property,
      });
      const outcome = fromActions.updatePropertyFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFindByIdAndUpdate.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.updateProperty$).toBeObservable(expected);
    });
  });

  describe("addAttachment$", () => {
    it("should result in a addAttachmentCompleteAction", () => {
      const action = fromActions.addAttachmentAction({ attachment });
      const outcome = fromActions.addAttachmentCompleteAction({ attachment });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: attachment });
      datasetApi.datasetsControllerCreateAttachment.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.addAttachment$).toBeObservable(expected);
    });

    it("should result in a addAttachmentFailedAction", () => {
      const action = fromActions.addAttachmentAction({ attachment });
      const outcome = fromActions.addAttachmentFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerCreateAttachment.and.returnValue(response);

      const expected = cold("--b", { b: outcome });
      expect(effects.addAttachment$).toBeObservable(expected);
    });
  });

  describe("updateAttachmentCaption$", () => {
    const datasetId = "testPid";
    const attachmentId = "testId";
    const caption = "test";
    const ownerGroup = "test";

    it("should result in an addAttachmentCaptionCompleteAction", () => {
      const action = fromActions.updateAttachmentCaptionAction({
        datasetId,
        attachmentId,
        caption,
        ownerGroup,
      });
      const outcome = fromActions.updateAttachmentCaptionCompleteAction({
        attachment,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: attachment });
      datasetApi.datasetsControllerFindOneAttachmentAndUpdate.and.returnValue(
        response,
      );

      const expected = cold("--b", { b: outcome });
      expect(effects.updateAttachmentCaption$).toBeObservable(expected);
    });

    it("should result in an addAttachmentCaptionFailedAction", () => {
      const action = fromActions.updateAttachmentCaptionAction({
        datasetId,
        attachmentId,
        caption,
        ownerGroup,
      });
      const outcome = fromActions.updateAttachmentCaptionFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFindOneAttachmentAndUpdate.and.returnValue(
        response,
      );

      const expected = cold("--b", { b: outcome });
      expect(effects.updateAttachmentCaption$).toBeObservable(expected);
    });
  });

  describe("removeAttachment$", () => {
    const datasetId = "testPid";
    const attachmentId = "testId";

    it("should result in a removeAttachmentCompleteAction", () => {
      const action = fromActions.removeAttachmentAction({
        datasetId,
        attachmentId,
      });
      const outcome = fromActions.removeAttachmentCompleteAction({
        attachmentId,
      });

      actions = hot("-a", { a: action });
      const response = cold("-a|", { a: attachmentId });
      datasetApi.datasetsControllerFindOneAttachmentAndRemove.and.returnValue(
        response,
      );

      const expected = cold("--b", { b: outcome });
      expect(effects.removeAttachment$).toBeObservable(expected);
    });

    it("should result in a removeAttachmentFailedAction", () => {
      const action = fromActions.removeAttachmentAction({
        datasetId,
        attachmentId,
      });
      const outcome = fromActions.removeAttachmentFailedAction();

      actions = hot("-a", { a: action });
      const response = cold("-#", {});
      datasetApi.datasetsControllerFindOneAttachmentAndRemove.and.returnValue(
        response,
      );

      const expected = cold("--b", { b: outcome });
      expect(effects.removeAttachment$).toBeObservable(expected);
    });
  });

  describe("loading$", () => {
    describe("ofType fetchDatasetsAction", () => {
      it("should dispatch a loadingAction", () => {
        const action = fromActions.fetchDatasetsAction();
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType fetchFacetCountsAction", () => {
      it("should dispatch a loadingAction", () => {
        const action = fromActions.fetchFacetCountsAction();
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType fetchMetadataKeysAction", () => {
      it("should dispatch a loadingAction", () => {
        const action = fromActions.fetchMetadataKeysAction();
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType fetchDatasetAction", () => {
      it("should dispatch a loadingAction", () => {
        const pid = "testPid";
        const action = fromActions.fetchDatasetAction({ pid });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType addDatasetAction", () => {
      it("should dispatch a loadingAction", () => {
        const action = fromActions.addDatasetAction({
          dataset: derivedDataset,
        });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType updatePropertyAction", () => {
      it("should dispatch a loadingAction", () => {
        const pid = "testPid";
        const property = { isPublished: true };
        const action = fromActions.updatePropertyAction({
          pid,
          property,
        });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType addAttachmentAction", () => {
      it("should dispatch a loadingAction", () => {
        const action = fromActions.addAttachmentAction({ attachment });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType updateAttachmentCaptionAction", () => {
      it("should dispatch a loadingAction", () => {
        const datasetId = "testId";
        const attachmentId = "testId";
        const caption = "test";
        const ownerGroup = "test";

        const action = fromActions.updateAttachmentCaptionAction({
          datasetId,
          attachmentId,
          caption,
          ownerGroup,
        });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });

    describe("ofType removeAttachmentAction", () => {
      it("should dispatch a loadingAction", () => {
        const datasetId = "testId";
        const attachmentId = "testId";
        const action = fromActions.removeAttachmentAction({
          datasetId,
          attachmentId,
        });
        const outcome = loadingAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loading$).toBeObservable(expected);
      });
    });
  });

  describe("loadingComplete$", () => {
    describe("ofType fetchDatasetsCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const datasets = [dataset];
        const action = fromActions.fetchDatasetsCompleteAction({ datasets });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchDatasetsFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.fetchDatasetsFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchFacetCountsCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const facetCounts: FacetCounts = {
          creationLocation: [{ count: 0 }],
          creationTime: [{ count: 0 }],
          keywords: [{ count: 0 }],
          ownerGroup: [{ count: 0 }],
          type: [{ count: 0 }],
        };
        const allCounts = 0;
        const action = fromActions.fetchFacetCountsCompleteAction({
          facetCounts,
          allCounts,
        });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchFacetCountsFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.fetchFacetCountsFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchMetadataKeysCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const metadataKeys = ["test"];
        const action = fromActions.fetchMetadataKeysCompleteAction({
          metadataKeys,
        });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchMetadataKeysFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.fetchMetadataKeysFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchDatasetCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.fetchDatasetCompleteAction({ dataset });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType fetchDatasetFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.fetchDatasetFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType addDatasetCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.addDatasetCompleteAction({
          dataset: derivedDataset,
        });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType addDatasetFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.addDatasetFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType updatePropertyCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.updatePropertyCompleteAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType updatePropertyFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.updatePropertyFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType addAttachmentCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.addAttachmentCompleteAction({ attachment });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType addAttachmentFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.addAttachmentFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType updateAttachmentCaptionCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.updateAttachmentCaptionCompleteAction({
          attachment,
        });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType updateAttachmentCaptionFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.updateAttachmentCaptionFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType removeAttachmentCompleteAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const attachmentId = "testId";
        const action = fromActions.removeAttachmentCompleteAction({
          attachmentId,
        });
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });

    describe("ofType removeAttachmentFailedAction", () => {
      it("should dispatch a loadingCompleteAction", () => {
        const action = fromActions.removeAttachmentFailedAction();
        const outcome = loadingCompleteAction();

        actions = hot("-a", { a: action });

        const expected = cold("-b", { b: outcome });
        expect(effects.loadingComplete$).toBeObservable(expected);
      });
    });
  });
});
