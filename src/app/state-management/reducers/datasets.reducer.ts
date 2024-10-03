import { Action, createReducer, on } from "@ngrx/store";
import {
  initialDatasetState,
  DatasetState,
} from "state-management/state/datasets.store";
import * as fromActions from "state-management/actions/datasets.actions";
import {
  ArchViewMode,
  Dataset,
  ScientificCondition,
} from "state-management/models";

const reducer = createReducer(
  initialDatasetState,
  on(
    fromActions.fetchDatasetsCompleteAction,
    (state, { datasets }): DatasetState => ({
      ...state,
      datasets,
    }),
  ),

  on(
    fromActions.fetchFacetCountsCompleteAction,
    (state, { facetCounts, allCounts }): DatasetState => ({
      ...state,
      facetCounts,
      totalCount: allCounts,
    }),
  ),

  on(
    fromActions.fetchMetadataKeysCompleteAction,
    (state, { metadataKeys }): DatasetState => ({ ...state, metadataKeys }),
  ),

  on(
    fromActions.fetchMetadataTypesCompleteAction,
    (state, { metadataTypes }): DatasetState => ({
      ...state,
      metadataTypes,
    }),
  ),

  on(
    fromActions.fetchDatasetCompleteAction,
    (state, { dataset }): DatasetState => ({
      ...state,
      currentSet: dataset,
    }),
  ),

  on(fromActions.fetchDatablocksCompleteAction, (state, { datablocks }) => {
    return {
      ...state,
      currentSet: {
        ...state.currentSet,
        datablocks,
      },
    };
  }),

  on(
    fromActions.fetchOrigDatablocksCompleteAction,
    (state, { origdatablocks }) => {
      return {
        ...state,
        currentSet: {
          ...state.currentSet,
          origdatablocks,
        },
      };
    },
  ),

  on(fromActions.fetchAttachmentsCompleteAction, (state, { attachments }) => {
    return {
      ...state,
      currentSet: {
        ...state.currentSet,
        attachments,
      },
    };
  }),

  on(
    fromActions.fetchRelatedDatasetsCompleteAction,
    (state, { relatedDatasets }): DatasetState => ({
      ...state,
      relatedDatasets,
    }),
  ),
  on(
    fromActions.fetchRelatedDatasetsCountCompleteAction,
    (state, { count }): DatasetState => ({
      ...state,
      relatedDatasetsCount: count,
    }),
  ),

  on(
    fromActions.changeRelatedDatasetsPageAction,
    (state, { page, limit }): DatasetState => {
      const skip = page * limit;
      const relatedDatasetsFilters = {
        ...state.relatedDatasetsFilters,
        skip,
        limit,
      };
      return { ...state, relatedDatasetsFilters };
    },
  ),

  on(fromActions.prefillBatchCompleteAction, (state, { batch }) => ({
    ...state,
    batch,
  })),
  on(fromActions.addToBatchAction, (state) => {
    const batchedPids = state.batch.map((dataset) => dataset.pid);
    const addition = state.selectedSets.filter(
      (dataset) => batchedPids.indexOf(dataset.pid) === -1,
    );
    const batch = [...state.batch, ...addition];
    return { ...state, batch };
  }),
  on(fromActions.storeBatchAction, (state, { batch }) => ({ ...state, batch })),
  on(fromActions.removeFromBatchAction, (state, { dataset }): DatasetState => {
    const batch = state.batch.filter(
      (datasetInBatch) => datasetInBatch.pid !== dataset.pid,
    );
    return { ...state, batch };
  }),
  on(
    fromActions.clearBatchAction,
    (state): DatasetState => ({ ...state, batch: [] }),
  ),

  on(
    fromActions.addDatasetCompleteAction,
    (state, { dataset }): DatasetState => ({
      ...state,
      currentSet: dataset as unknown as Dataset,
    }),
  ),

  on(
    fromActions.addAttachmentCompleteAction,
    (state, { attachment }): DatasetState => {
      if (state.currentSet) {
        const attachments = state.currentSet.attachments.filter(
          (existingAttachment) => existingAttachment.id !== attachment.id,
        );
        attachments.push(attachment);
        const currentSet = { ...state.currentSet, attachments };
        return { ...state, currentSet };
      }
      return { ...state };
    },
  ),

  on(
    fromActions.updateAttachmentCaptionCompleteAction,
    (state, { attachment }): DatasetState => {
      if (state.currentSet) {
        const attachments = state.currentSet.attachments.filter(
          (existingAttachment) => existingAttachment.id !== attachment.id,
        );
        attachments.push(attachment);
        const currentSet = { ...state.currentSet, attachments };
        return { ...state, currentSet };
      }
      return { ...state };
    },
  ),

  on(
    fromActions.removeAttachmentCompleteAction,
    (state, { attachmentId }): DatasetState => {
      if (state.currentSet) {
        const attachments = state.currentSet.attachments.filter(
          (attachment) => attachment.id !== attachmentId,
        );
        const currentSet = { ...state.currentSet, attachments };
        return { ...state, currentSet };
      }
      return { ...state };
    },
  ),

  on(
    fromActions.clearDatasetsStateAction,
    (): DatasetState => ({
      ...initialDatasetState,
    }),
  ),

  on(
    fromActions.clearCurrentDatasetStateAction,
    (state): DatasetState => ({
      ...state,
      currentSet: undefined,
      relatedDatasets: [],
    }),
  ),

  on(fromActions.selectDatasetAction, (state, { dataset }) => {
    const alreadySelected = state.selectedSets.find(
      (existing) => dataset.pid === existing.pid,
    );
    if (alreadySelected) {
      return state;
    } else {
      const selectedSets = state.selectedSets.concat(dataset);
      return { ...state, selectedSets };
    }
  }),
  on(fromActions.deselectDatasetAction, (state, { dataset }): DatasetState => {
    const selectedSets = state.selectedSets.filter(
      (selectedSet) => selectedSet.pid !== dataset.pid,
    );
    return { ...state, selectedSets };
  }),

  on(
    fromActions.selectAllDatasetsAction,
    (state): DatasetState => ({
      ...state,
      selectedSets: [...state.datasets],
    }),
  ),
  on(
    fromActions.clearSelectionAction,
    (state): DatasetState => ({
      ...state,
      selectedSets: [],
    }),
  ),

  on(
    fromActions.setDatasetsLimitFilterAction,
    (state, { limit }): DatasetState => {
      const pagination = { limit, skip: 0 };
      return { ...state, pagination };
    },
  ),

  on(fromActions.changePageAction, (state, { page, limit }): DatasetState => {
    const skip = page * limit;
    const pagination = { skip, limit };
    return { ...state, pagination };
  }),
  on(
    fromActions.sortByColumnAction,
    (state, { column, direction }): DatasetState => {
      const sortField = column + (direction ? ":" + direction : "");
      const filters = { ...state.filters, sortField, skip: 0 };
      return { ...state, filters };
    },
  ),
  on(
    fromActions.setSearchTermsAction,
    (state, { terms }): DatasetState => ({
      ...state,
      searchTerms: terms,
    }),
  ),
  on(
    fromActions.setPidTermsAction,
    (state, { pid }): DatasetState => ({
      ...state,
      pidTerms: pid,
    }),
  ),

  on(
    fromActions.setArchiveViewModeAction,
    (state, { modeToggle }): DatasetState => {
      let mode = {};

      switch (modeToggle) {
        case ArchViewMode.all:
          mode = {};
          break;
        case ArchViewMode.archivable:
          mode = {
            "datasetlifecycle.archivable": true,
            "datasetlifecycle.retrievable": false,
          };
          break;
        case ArchViewMode.retrievable:
          mode = {
            "datasetlifecycle.retrievable": true,
            "datasetlifecycle.archivable": false,
          };
          break;
        case ArchViewMode.work_in_progress:
          mode = {
            $or: [
              {
                "datasetlifecycle.retrievable": false,
                "datasetlifecycle.archivable": false,
                "datasetlifecycle.archiveStatusMessage": {
                  $ne: "scheduleArchiveJobFailed",
                },
                "datasetlifecycle.retrieveStatusMessage": {
                  $ne: "scheduleRetrieveJobFailed",
                },
              },
            ],
          };
          break;
        case ArchViewMode.system_error:
          mode = {
            $or: [
              {
                "datasetlifecycle.retrievable": true,
                "datasetlifecycle.archivable": true,
              },
              {
                "datasetlifecycle.archiveStatusMessage":
                  "scheduleArchiveJobFailed",
              },
              {
                "datasetlifecycle.retrieveStatusMessage":
                  "scheduleRetrieveJobFailed",
              },
            ],
          };
          break;
        case ArchViewMode.user_error:
          mode = {
            $or: [
              {
                "datasetlifecycle.archiveStatusMessage": "missingFilesError",
              },
            ],
          };
          break;
        default: {
          break;
        }
      }
      const filters = { ...state.filters, skip: 0, mode, modeToggle };
      return { ...state, filters };
    },
  ),
  on(
    fromActions.setPublicViewModeAction,
    (state, { isPublished }): DatasetState => ({
      ...state,
      filters: { ...state.filters, isPublished },
    }),
  ),

  on(fromActions.prefillFiltersAction, (state, { values }): DatasetState => {
    const filters = { ...state.filters, ...values };
    const searchTerms = filters.text || "";
    return { ...state, searchTerms, filters, hasPrefilledFilters: true };
  }),

  on(fromActions.clearFacetsAction, (state): DatasetState => {
    const limit = state.pagination.limit; // Save limit
    const filters = { ...initialDatasetState.filters, skip: 0, limit };
    const pagination = { skip: 0, limit };
    return { ...state, filters, pagination, searchTerms: "" };
  }),

  on(fromActions.setTextFilterAction, (state, { text }): DatasetState => {
    const filters = { ...state.filters, text, skip: 0 };
    return { ...state, filters };
  }),

  on(fromActions.setPidTermsFilterAction, (state, { pid }): DatasetState => {
    const filters = { ...state.filters, pid, skip: 0 };
    return { ...state, filters };
  }),

  on(
    fromActions.addLocationFilterAction,
    (state, { location }): DatasetState => {
      const creationLocation = state.filters.creationLocation
        .concat(location)
        .filter((val, i, self) => self.indexOf(val) === i); // Unique
      const filters = { ...state.filters, creationLocation, skip: 0 };
      return { ...state, filters };
    },
  ),
  on(
    fromActions.removeLocationFilterAction,
    (state, { location }): DatasetState => {
      const creationLocation = state.filters.creationLocation.filter(
        (existingLocation) => existingLocation !== location,
      );
      const filters = { ...state.filters, creationLocation, skip: 0 };
      return { ...state, filters };
    },
  ),

  on(fromActions.addGroupFilterAction, (state, { group }): DatasetState => {
    const ownerGroup = state.filters.ownerGroup
      .concat(group)
      .filter((val, i, self) => self.indexOf(val) === i); // Unique
    const filters = { ...state.filters, ownerGroup, skip: 0 };
    return { ...state, filters };
  }),
  on(fromActions.removeGroupFilterAction, (state, { group }): DatasetState => {
    const ownerGroup = state.filters.ownerGroup.filter(
      (existingGroup) => existingGroup !== group,
    );
    const filters = { ...state.filters, ownerGroup, skip: 0 };
    return { ...state, filters };
  }),

  on(
    fromActions.addTypeFilterAction,
    (state, { datasetType }): DatasetState => {
      const type = state.filters.type
        .concat(datasetType)
        .filter((val, i, self) => self.indexOf(val) === i); // Unique
      const filters = { ...state.filters, type, skip: 0 };
      return { ...state, filters };
    },
  ),
  on(
    fromActions.removeTypeFilterAction,
    (state, { datasetType }): DatasetState => {
      const type = state.filters.type.filter(
        (existingType) => existingType !== datasetType,
      );
      const filters = { ...state.filters, type, skip: 0 };
      return { ...state, filters };
    },
  ),

  on(fromActions.addKeywordFilterAction, (state, { keyword }): DatasetState => {
    const keywords = state.filters.keywords
      .concat(keyword)
      .filter((val, i, self) => self.indexOf(val) === i); // Unique
    const filters = { ...state.filters, keywords, skip: 0 };
    return { ...state, filters };
  }),
  on(
    fromActions.removeKeywordFilterAction,
    (state, { keyword }): DatasetState => {
      const keywords = state.filters.keywords.filter(
        (existingKeyword) => existingKeyword !== keyword,
      );
      const filters = { ...state.filters, keywords, skip: 0 };
      return { ...state, filters };
    },
  ),

  on(
    fromActions.setDateRangeFilterAction,
    (state, { begin, end }): DatasetState => {
      const oldTime = state.filters.creationTime;
      const creationTime = begin && end ? { ...oldTime, begin, end } : null;
      const filters = { ...state.filters, creationTime };
      return { ...state, filters };
    },
  ),

  on(
    fromActions.addScientificConditionAction,
    (state, { condition }): DatasetState => {
      const currentFilters = state.filters;
      const currentScientific = currentFilters.scientific;

      // Custom comparison function to check if two conditions are equal
      const areConditionsEqual = (
        cond1: ScientificCondition,
        cond2: ScientificCondition,
      ) => {
        return (
          cond1.lhs === cond2.lhs &&
          cond1.relation === cond2.relation &&
          cond1.rhs === cond2.rhs &&
          cond1.unit === cond2.unit
        );
      };

      // Check if the condition already exists in the scientific array
      const conditionExists = currentScientific.some((existingCondition) =>
        areConditionsEqual(existingCondition, condition),
      );

      const filters = {
        ...currentFilters,
        scientific: conditionExists
          ? currentScientific
          : [...currentScientific, condition],
      };
      return { ...state, filters };
    },
  ),
  on(
    fromActions.removeScientificConditionAction,
    (state, { condition }): DatasetState => {
      const currentFilters = state.filters;
      const scientific = [...currentFilters.scientific];
      const index = scientific.indexOf(condition);
      scientific.splice(index, 1);
      const filters = { ...currentFilters, scientific };
      return { ...state, filters };
    },
  ),
  on(fromActions.fetchDatasetsCompleteAction, (state): DatasetState => {
    state.dataLoaded = true;
    return state;
  }),
  on(fromActions.fetchDatasetsFailedAction, (state): DatasetState => {
    state.dataLoaded = false;
    return state;
  }),
);

export const datasetsReducer = (
  state: DatasetState | undefined,
  action: Action,
) => {
  if (action.type.indexOf("[Dataset]") !== -1) {
    console.log("Action came in! " + action.type);
  }
  return reducer(state, action);
};
