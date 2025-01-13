import * as fromActions from "./datasets.actions";
import { FacetCounts } from "state-management/state/datasets.store";
import {
  ArchViewMode,
  DatasetFilters,
  ScientificCondition,
} from "state-management/models";
import {
  mockDataset as dataset,
  createMock,
  mockAttachment as attachment,
} from "shared/MockStubs";
import { OutputDatasetObsoleteDto } from "@scicatproject/scicat-sdk-ts";

describe("Dataset Actions", () => {
  const datasets = [dataset];
  const derivedDataset = createMock<OutputDatasetObsoleteDto>({
    investigator: "",
    inputDatasets: [],
    usedSoftware: [],
    owner: "",
    contactEmail: "",
    sourceFolder: "",
    creationTime: "",
    ownerGroup: "",
    datasetName: "",
    type: "derived",
    numberOfFilesArchived: 0,
    createdAt: "",
    createdBy: "",
    creationLocation: "",
    principalInvestigator: "",
    updatedAt: "",
    updatedBy: "",
  });

  describe("fetchDatasetsAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchDatasetsAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Fetch Datasets" });
    });
  });

  describe("fetchDatasetsCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchDatasetsCompleteAction({ datasets });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Datasets Complete",
        datasets,
      });
    });
  });

  describe("fetchDatasetsFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchDatasetsFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Datasets Failed",
      });
    });
  });

  describe("fetchFacetCountsAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchFacetCountsAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Fetch Facet Counts" });
    });
  });

  describe("fetchFacetCountsCompleteAction", () => {
    it("should create an action", () => {
      const facetCounts: FacetCounts = {};
      const allCounts = 0;
      const action = fromActions.fetchFacetCountsCompleteAction({
        facetCounts,
        allCounts,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Facet Counts Complete",
        facetCounts,
        allCounts,
      });
    });
  });

  describe("fetchFacetCountsFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchFacetCountsFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Facet Counts Failed",
      });
    });
  });

  describe("fetchMetadataKeysAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchMetadataKeysAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Metadata Keys",
      });
    });
  });

  describe("fetchMetadataKeysCompleteAction", () => {
    it("should create an action", () => {
      const metadataKeys = ["test"];
      const action = fromActions.fetchMetadataKeysCompleteAction({
        metadataKeys,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Metadata Keys Complete",
        metadataKeys,
      });
    });
  });

  describe("fetchMetadataKeysAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchMetadataKeysFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Metadata Keys Failed",
      });
    });
  });

  describe("fetchDatasetAction", () => {
    it("should create an action", () => {
      const pid = "test";
      const action = fromActions.fetchDatasetAction({ pid });
      expect({ ...action }).toEqual({ type: "[Dataset] Fetch Dataset", pid });
    });
  });

  describe("fetchDatasetCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchDatasetCompleteAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Dataset Complete",
        dataset,
      });
    });
  });

  describe("fetchDatasetFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchDatasetFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Dataset Failed",
      });
    });
  });

  describe("fetchRelatedDatasetsAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchRelatedDatasetsAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Related Datasets",
      });
    });
  });

  describe("fetchRelatedDatasetsCompleteAction", () => {
    it("should create an action", () => {
      const relatedDatasets = [dataset];
      const action = fromActions.fetchRelatedDatasetsCompleteAction({
        relatedDatasets,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Related Datasets Complete",
        relatedDatasets,
      });
    });
  });

  describe("fetchRelatedDatasetsFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchRelatedDatasetsFailedAction();
      expect({ ...action }).toEqual({
        type: "[Datasets] Fetch Related Datasets Failed",
      });
    });
  });

  describe("fetchRelatedDatasetsCountCompleteAction", () => {
    it("should create an action", () => {
      const count = 0;
      const action = fromActions.fetchRelatedDatasetsCountCompleteAction({
        count,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Fetch Related Datasets Count Complete",
        count,
      });
    });
  });

  describe("fetchRelatedDatasetsCountFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.fetchRelatedDatasetsCountFailedAction();
      expect({ ...action }).toEqual({
        type: "[Datasets] Fetch Related Datasets Count Failed",
      });
    });
  });

  describe("changeRelatedDatasetsPageAction", () => {
    it("should create an action", () => {
      const page = 0;
      const limit = 25;
      const action = fromActions.changeRelatedDatasetsPageAction({
        page,
        limit,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Change Related Datasets Page",
        page,
        limit,
      });
    });
  });

  describe("prefillBatchAction", () => {
    it("should create an action", () => {
      const action = fromActions.prefillBatchAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Prefill Batch" });
    });
  });

  describe("prefillBatchCompleteAction", () => {
    it("should create an action", () => {
      const batch = [dataset];
      const action = fromActions.prefillBatchCompleteAction({ batch });
      expect({ ...action }).toEqual({
        type: "[Dataset] Prefill Batch Complete",
        batch,
      });
    });
  });

  describe("addToBatchAction", () => {
    it("should create an action", () => {
      const action = fromActions.addToBatchAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Add To Batch" });
    });
  });

  describe("removeFromBatchAction", () => {
    it("should create an action", () => {
      const action = fromActions.removeFromBatchAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove From Batch",
        dataset,
      });
    });
  });

  describe("clearBatchAction", () => {
    it("should create an action", () => {
      const action = fromActions.clearBatchAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Clear Batch" });
    });
  });

  describe("addDatasetAction", () => {
    it("should create an action", () => {
      const action = fromActions.addDatasetAction({ dataset });
      expect({ ...action }).toEqual({ type: "[Dataset] Add Dataset", dataset });
    });
  });

  describe("addDatasetCompleteAction", () => {
    it("should create an action", () => {
      const dataset = derivedDataset;
      const action = fromActions.addDatasetCompleteAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Dataset Complete",
        dataset,
      });
    });
  });

  describe("addDatasetFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.addDatasetFailedAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Add Dataset Failed" });
    });
  });

  describe("updatePropertyAction", () => {
    it("should create an action", () => {
      const pid = "testPid";
      const property = { isPublished: true };
      const action = fromActions.updatePropertyAction({ pid, property });
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Property",
        pid,
        property,
      });
    });
  });

  describe("updatePropertyCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.updatePropertyCompleteAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Property Complete",
      });
    });
  });

  describe("updatePropertyFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.updatePropertyFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Property Failed",
      });
    });
  });

  describe("addAttachmentAction", () => {
    it("should create an action", () => {
      const action = fromActions.addAttachmentAction({ attachment });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Attachment",
        attachment,
      });
    });
  });

  describe("addAttachmentCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.addAttachmentCompleteAction({ attachment });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Attachment Complete",
        attachment,
      });
    });
  });

  describe("addAttachmentFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.addAttachmentFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Attachment Failed",
      });
    });
  });

  describe("updateAttachmentCaptionAction", () => {
    it("should create an action", () => {
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
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Attachment Caption",
        datasetId,
        attachmentId,
        caption,
        ownerGroup,
      });
    });
  });

  describe("updateAttachmentCaptionCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.updateAttachmentCaptionCompleteAction({
        attachment,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Attachment Caption Complete",
        attachment,
      });
    });
  });

  describe("updateAttachmentCaptionFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.updateAttachmentCaptionFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Update Attachment Action Failed",
      });
    });
  });

  describe("removeAttachmentAction", () => {
    it("should create an action", () => {
      const datasetId = "testId";
      const attachmentId = "testId";
      const action = fromActions.removeAttachmentAction({
        datasetId,
        attachmentId,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Attachment",
        datasetId,
        attachmentId,
      });
    });
  });

  describe("removeAttachmentCompleteAction", () => {
    it("should create an action", () => {
      const attachmentId = "testId";
      const action = fromActions.removeAttachmentCompleteAction({
        attachmentId,
      });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Attachment Complete",
        attachmentId,
      });
    });
  });

  describe("removeAttachmentFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.removeAttachmentFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Attachment Failed",
      });
    });
  });

  describe("reduceDatasetAction", () => {
    it("should create an action", () => {
      const action = fromActions.reduceDatasetAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Reduce Dataset",
        dataset,
      });
    });
  });

  describe("reduceDatasetCompleteAction", () => {
    it("should create an action", () => {
      const result = {};
      const action = fromActions.reduceDatasetCompleteAction({ result });
      expect({ ...action }).toEqual({
        type: "[Dataset] Reduce Dataset Complete",
        result,
      });
    });
  });

  describe("reduceDatasetFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.reduceDatasetFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Reduce Dataset Failed",
      });
    });
  });

  describe("updateDatasetAccessGrappendToDatasetArrayFieldCompleteActionoupsCompleteAction", () => {
    it("should create an action", () => {
      const action = fromActions.appendToDatasetArrayFieldCompleteAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Append To Array Field Complete",
      });
    });
  });
  describe("appendToDatasetArrayFieldFailedAction", () => {
    it("should create an action", () => {
      const action = fromActions.appendToDatasetArrayFieldFailedAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Append To Array Field Failed",
      });
    });
  });

  describe("selectDatasetAction", () => {
    it("should create an action", () => {
      const action = fromActions.selectDatasetAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Select Dataset",
        dataset,
      });
    });
  });

  describe("deselectDatasetAction", () => {
    it("should create an action", () => {
      const action = fromActions.deselectDatasetAction({ dataset });
      expect({ ...action }).toEqual({
        type: "[Dataset] Deselect Dataset",
        dataset,
      });
    });
  });

  describe("selectAllDatasetsAction", () => {
    it("should create an action", () => {
      const action = fromActions.selectAllDatasetsAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Select All Datasets",
      });
    });
  });

  describe("clearSelectionAction", () => {
    it("should create an action", () => {
      const action = fromActions.clearSelectionAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Clear Selection",
      });
    });
  });

  describe("setDatasetsLimitFilterAction", () => {
    it("should create an action", () => {
      const limit = 25;
      const action = fromActions.setDatasetsLimitFilterAction({ limit });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Limit Filter",
        limit,
      });
    });
  });

  describe("changePageAction", () => {
    it("should create an action", () => {
      const page = 0;
      const limit = 25;
      const action = fromActions.changePageAction({ page, limit });
      expect({ ...action }).toEqual({
        type: "[Dataset] Change Page",
        page,
        limit,
      });
    });
  });

  describe("sortByColumnAction", () => {
    it("should create an action", () => {
      const column = "test";
      const direction = "asc";
      const action = fromActions.sortByColumnAction({ column, direction });
      expect({ ...action }).toEqual({
        type: "[Dataset] Sort By Column",
        column,
        direction,
      });
    });
  });

  describe("setSearchTermsAction", () => {
    it("should create an action", () => {
      const terms = "test";
      const action = fromActions.setSearchTermsAction({ terms });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Search Terms",
        terms,
      });
    });
  });

  describe("setArchViewModeAction", () => {
    it("should create an action", () => {
      const modeToggle = ArchViewMode.all;
      const action = fromActions.setArchiveViewModeAction({ modeToggle });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Archive View Mode",
        modeToggle,
      });
    });
  });

  describe("setPublicViewModeAction", () => {
    it("should create an action", () => {
      const isPublished = false;
      const action = fromActions.setPublicViewModeAction({ isPublished });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Public View Mode",
        isPublished,
      });
    });
  });

  describe("prefillFiltersAction", () => {
    it("should create an action", () => {
      const values: Partial<DatasetFilters> = {};
      const action = fromActions.prefillFiltersAction({ values });
      expect({ ...action }).toEqual({
        type: "[Dataset] Prefill Filters",
        values,
      });
    });
  });

  describe("clearFacetsAction", () => {
    it("should create an action", () => {
      const action = fromActions.clearFacetsAction();
      expect({ ...action }).toEqual({
        type: "[Dataset] Clear Facets",
      });
    });
  });

  describe("setTextFilterAction", () => {
    it("should create an action", () => {
      const text = "test";
      const action = fromActions.setTextFilterAction({ text });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Text Filter",
        text,
      });
    });
  });

  describe("addLocationFilterAction", () => {
    it("should create an action", () => {
      const location = "test";
      const action = fromActions.addLocationFilterAction({ location });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Location Filter",
        location,
      });
    });
  });

  describe("removeLocationFilterAction", () => {
    it("should create an action", () => {
      const location = "test";
      const action = fromActions.removeLocationFilterAction({ location });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Location Filter",
        location,
      });
    });
  });

  describe("addGroupFilterAction", () => {
    it("should create an action", () => {
      const group = "test";
      const action = fromActions.addGroupFilterAction({ group });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Group Filter",
        group,
      });
    });
  });

  describe("removeGroupFilterAction", () => {
    it("should create an action", () => {
      const group = "test";
      const action = fromActions.removeGroupFilterAction({ group });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Group Filter",
        group,
      });
    });
  });

  describe("addTypeFilterAction", () => {
    it("should create an action", () => {
      const datasetType = "test";
      const action = fromActions.addTypeFilterAction({ datasetType });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Type Filter",
        datasetType,
      });
    });
  });

  describe("removeTypeFilterAction", () => {
    it("should create an action", () => {
      const datasetType = "test";
      const action = fromActions.removeTypeFilterAction({ datasetType });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Type Filter",
        datasetType,
      });
    });
  });

  describe("addKeywordFilterAction", () => {
    it("should create an action", () => {
      const keyword = "test";
      const action = fromActions.addKeywordFilterAction({ keyword });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Keyword Filter",
        keyword,
      });
    });
  });

  describe("removeKeywordFilterAction", () => {
    it("should create an action", () => {
      const keyword = "test";
      const action = fromActions.removeKeywordFilterAction({ keyword });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Keyword Filter",
        keyword,
      });
    });
  });

  describe("setDateRangeFilterAction", () => {
    it("should create an action", () => {
      const begin = "testBegin";
      const end = "testEnd";
      const action = fromActions.setDateRangeFilterAction({ begin, end });
      expect({ ...action }).toEqual({
        type: "[Dataset] Set Date Range Filter",
        begin,
        end,
      });
    });
  });

  describe("addScientificConditionAction", () => {
    it("should create an action", () => {
      const condition: ScientificCondition = {
        lhs: "lhsTest",
        relation: "LESS_THAN",
        rhs: 5,
        unit: "s",
      };
      const action = fromActions.addScientificConditionAction({ condition });
      expect({ ...action }).toEqual({
        type: "[Dataset] Add Scientific Condition",
        condition,
      });
    });
  });

  describe("removeScientificConditionAction", () => {
    it("should create an action", () => {
      const condition: ScientificCondition = {
        lhs: "lhsTest",
        relation: "LESS_THAN",
        rhs: 5,
        unit: "s",
      };
      const action = fromActions.removeScientificConditionAction({ condition });
      expect({ ...action }).toEqual({
        type: "[Dataset] Remove Scientific Condition",
        condition,
      });
    });
  });

  describe("clearDatasetsStateAction", () => {
    it("should create an action", () => {
      const action = fromActions.clearDatasetsStateAction();
      expect({ ...action }).toEqual({ type: "[Dataset] Clear State" });
    });
  });

  describe("setPidTermsAction", () => {
    it("should create an action", () => {
      const pid = "1";
      const action = fromActions.setPidTermsAction({ pid });
      expect({ ...action }).toEqual({ type: "[Dataset] Set Pid Terms", pid });
    });
  });

  describe("setPidTermsFilterAction", () => {
    it("should create an action", () => {
      const pid = { $regex: "1" };
      const action = fromActions.setPidTermsFilterAction({ pid });
      expect({ ...action }).toEqual({ type: "[Dataset] Set Text Filter", pid });
    });
  });
});
