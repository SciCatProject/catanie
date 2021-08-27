import { createAction, props } from "@ngrx/store";
import { Dataset, Attachment, DerivedDataset } from "shared/sdk";
import { FacetCounts } from "state-management/state/datasets.store";
import {
  ArchViewMode,
  DatasetFilters,
  ScientificCondition,
} from "state-management/models";

// === Effects ===

export const fetchDatasetsAction = createAction("[Dataset] Fetch Datasets");
export const fetchDatasetsCompleteAction = createAction(
  "[Dataset] Fetch Datasets Complete",
  props<{ datasets: Dataset[] }>()
);
export const fetchDatasetsFailedAction = createAction(
  "[Dataset] Fetch Datasets Failed"
);

export const fetchFacetCountsAction = createAction(
  "[Dataset] Fetch Facet Counts"
);
export const fetchFacetCountsCompleteAction = createAction(
  "[Dataset] Fetch Facet Counts Complete",
  props<{ facetCounts: FacetCounts; allCounts: number }>()
);
export const fetchFacetCountsFailedAction = createAction(
  "[Dataset] Fetch Facet Counts Failed"
);

export const fetchMetadataKeysAction = createAction(
  "[Dataset] Fetch Metadata Keys"
);
export const fetchMetadataKeysCompleteAction = createAction(
  "[Dataset] Fetch Metadata Keys Complete",
  props<{ metadataKeys: string[] }>()
);
export const fetchMetadataKeysFailedAction = createAction(
  "[Dataset] Fetch Metadata Keys Failed"
);

export const fetchDatasetAction = createAction(
  "[Dataset] Fetch Dataset",
  props<{ pid: string; filters?: any }>()
);
export const fetchDatasetCompleteAction = createAction(
  "[Dataset] Fetch Dataset Complete",
  props<{ dataset: Dataset }>()
);
export const fetchDatasetFailedAction = createAction(
  "[Dataset] Fetch Dataset Failed"
);

export const prefillBatchAction = createAction("[Dataset] Prefill Batch");
export const prefillBatchCompleteAction = createAction(
  "[Dataset] Prefill Batch Complete",
  props<{ batch: Dataset[] }>()
);
export const addToBatchAction = createAction("[Dataset] Add To Batch");
export const removeFromBatchAction = createAction(
  "[Dataset] Remove From Batch",
  props<{ dataset: Dataset }>()
);
export const clearBatchAction = createAction("[Dataset] Clear Batch");

export const addDatasetAction = createAction(
  "[Dataset] Add Dataset",
  props<{ dataset: DerivedDataset }>()
);
export const addDatasetCompleteAction = createAction(
  "[Dataset] Add Dataset Complete",
  props<{ dataset: DerivedDataset }>()
);
export const addDatasetFailedAction = createAction(
  "[Dataset] Add Dataset Failed"
);

export const updatePropertyAction = createAction(
  "[Dataset] Update Property",
  props<{ pid: string; property: Record<string, unknown> }>()
);
export const updatePropertyCompleteAction = createAction(
  "[Dataset] Update Property Complete"
);
export const updatePropertyFailedAction = createAction(
  "[Dataset] Update Property Failed"
);

export const addAttachmentAction = createAction(
  "[Dataset] Add Attachment",
  props<{ attachment: Partial<Attachment> }>()
);
export const addAttachmentCompleteAction = createAction(
  "[Dataset] Add Attachment Complete",
  props<{ attachment: Attachment }>()
);
export const addAttachmentFailedAction = createAction(
  "[Dataset] Add Attachment Failed"
);

export const updateAttachmentCaptionAction = createAction(
  "[Dataset] Update Attachment Caption",
  props<{ datasetId: string; attachmentId: string; caption: string }>()
);
export const updateAttachmentCaptionCompleteAction = createAction(
  "[Dataset] Update Attachment Caption Complete",
  props<{ attachment: Attachment }>()
);
export const updateAttachmentCaptionFailedAction = createAction(
  "[Dataset] Update Attachment Action Failed"
);

export const removeAttachmentAction = createAction(
  "[Dataset] Remove Attachment",
  props<{ datasetId: string; attachmentId: string }>()
);
export const removeAttachmentCompleteAction = createAction(
  "[Dataset] Remove Attachment Complete",
  props<{ attachmentId: string }>()
);
export const removeAttachmentFailedAction = createAction(
  "[Dataset] Remove Attachment Failed"
);

export const reduceDatasetAction = createAction(
  "[Dataset] Reduce Dataset",
  props<{ dataset: Dataset }>()
);
export const reduceDatasetCompleteAction = createAction(
  "[Dataset] Reduce Dataset Complete",
  props<{ result: Record<string, unknown> }>()
);
export const reduceDatasetFailedAction = createAction(
  "[Dataset] Reduce Dataset Failed"
);

// === Dataset Table Selection ===

export const selectDatasetAction = createAction(
  "[Dataset] Select Dataset",
  props<{ dataset: Dataset }>()
);
export const deselectDatasetAction = createAction(
  "[Dataset] Deselect Dataset",
  props<{ dataset: Dataset }>()
);

export const selectAllDatasetsAction = createAction(
  "[Dataset] Select All Datasets"
);
export const clearSelectionAction = createAction("[Dataset] Clear Selection");

// === Dataset Table Filtering ===

export const setDatasetsLimitFilterAction = createAction(
  "[Dataset] Set Limit Filter",
  props<{ limit: number }>()
);

export const changePageAction = createAction(
  "[Dataset] Change Page",
  props<{ page: number; limit: number }>()
);
export const sortByColumnAction = createAction(
  "[Dataset] Sort By Column",
  props<{ column: string; direction: string }>()
);
export const setSearchTermsAction = createAction(
  "[Dataset] Set Search Terms",
  props<{ terms: string }>()
);

export const setArchiveViewModeAction = createAction(
  "[Dataset] Set Archive View Mode",
  props<{ modeToggle: ArchViewMode }>()
);
export const setPublicViewModeAction = createAction(
  "[Dataset] Set Public View Mode",
  props<{ isPublished: boolean | ""}>()
);

export const prefillFiltersAction = createAction(
  "[Dataset] Prefill Filters",
  props<{ values: Partial<DatasetFilters> }>()
);
export const clearFacetsAction = createAction("[Dataset] Clear Facets");

export const setTextFilterAction = createAction(
  "[Dataset] Set Text Filter",
  props<{ text: string }>()
);

export const addLocationFilterAction = createAction(
  "[Dataset] Add Location Filter",
  props<{ location: string }>()
);
export const removeLocationFilterAction = createAction(
  "[Dataset] Remove Location Filter",
  props<{ location: string }>()
);

export const addGroupFilterAction = createAction(
  "[Dataset] Add Group Filter",
  props<{ group: string }>()
);
export const removeGroupFilterAction = createAction(
  "[Dataset] Remove Group Filter",
  props<{ group: string }>()
);

export const addTypeFilterAction = createAction(
  "[Dataset] Add Type Filter",
  props<{ datasetType: string }>()
);
export const removeTypeFilterAction = createAction(
  "[Dataset] Remove Type Filter",
  props<{ datasetType: string }>()
);

export const addKeywordFilterAction = createAction(
  "[Dataset] Add Keyword Filter",
  props<{ keyword: string }>()
);
export const removeKeywordFilterAction = createAction(
  "[Dataset] Remove Keyword Filter",
  props<{ keyword: string }>()
);

export const setDateRangeFilterAction = createAction(
  "[Dataset] Set Date Range Filter",
  props<{ begin: string; end: string }>()
);

export const addScientificConditionAction = createAction(
  "[Dataset] Add Scientific Condition",
  props<{ condition: ScientificCondition }>()
);
export const removeScientificConditionAction = createAction(
  "[Dataset] Remove Scientific Condition",
  props<{ index: number }>()
);

export const clearDatasetsStateAction = createAction("[Dataset] Clear State");
