import { DatasetState } from "state-management/state/datasets.store";
import { createFeatureSelector, createSelector } from "@ngrx/store";

const selectDatasetState = createFeatureSelector<DatasetState>("datasets");

export const selectDatasets = createSelector(
  selectDatasetState,
  (state) => state.datasets,
);

export const selectSelectedDatasets = createSelector(
  selectDatasetState,
  (state) => state.selectedSets,
);

export const selectMetadataKeys = createSelector(
  selectDatasetState,
  (state) => state.metadataKeys,
);

export const selectMetadataTypes = createSelector(
  selectDatasetState,
  (state) => state.metadataTypes,
);

export const selectCurrentDataset = createSelector(
  selectDatasetState,
  (state) => state.currentSet,
);

export const selectCurrentDatasetWithoutFileInfo = createSelector(
  selectCurrentDataset,
  (currentSet) => {
    if (currentSet) {
      const { origdatablocks, datablocks, ...theRest } = currentSet;
      return theRest;
    }
    return undefined;
  },
);

export const selectCurrentDatasetWithOnlyScientificMetadataKey = createSelector(
  selectCurrentDataset,
  (currentSet) => {
    if (currentSet) {
      return currentSet?.scientificMetadata;
    }
    return undefined;
  },
);

export const selectCurrentOrigDatablocks = createSelector(
  selectCurrentDataset,
  (dataset) => (dataset ? dataset.origdatablocks : []),
);

export const selectCurrentDatablocks = createSelector(
  selectCurrentDataset,
  (dataset) => (dataset ? dataset.datablocks : []),
);

export const selectCurrentAttachments = createSelector(
  selectCurrentDataset,
  (dataset) => (dataset ? dataset.attachments : []),
);

export const selectPagination = createSelector(
  selectDatasetState,
  (state) => state.pagination,
);

// === Filters ===

export const selectFilters = createSelector(
  selectDatasetState,
  (state) => state.filters,
);

export const selectTextFilter = createSelector(
  selectFilters,
  (filters) => filters.text || "",
);

export const selectLocationFilter = createSelector(
  selectFilters,
  (filters) => filters.creationLocation,
);

export const selectGroupFilter = createSelector(
  selectFilters,
  (filters) => filters.ownerGroup,
);

export const selectTypeFilter = createSelector(
  selectFilters,
  (filters) => filters.type,
);

export const selectKeywordsFilter = createSelector(
  selectFilters,
  (filters) => filters.keywords,
);

export const selectCreationTimeFilter = createSelector(
  selectFilters,
  (filters) => filters.creationTime,
);

export const selectArchiveViewMode = createSelector(
  selectFilters,
  (filters) => filters.modeToggle,
);

export const selectPublicViewMode = createSelector(
  selectFilters,
  (filters) => filters.isPublished,
);

export const selectHasAppliedFilters = createSelector(
  selectFilters,
  (filters) =>
    filters.text !== "" ||
    filters.creationLocation.length > 0 ||
    filters.ownerGroup.length > 0 ||
    filters.type.length > 0 ||
    filters.keywords.length > 0 ||
    filters.scientific.length > 0 ||
    (filters.creationTime &&
      (filters.creationTime.begin !== null ||
        filters.creationTime.end !== null)),
);

export const selectScientificConditions = createSelector(
  selectFilters,
  (filters) => filters.scientific,
);

// === Facet Counts ===

const selectFacetCounts = createSelector(
  selectDatasetState,
  (state) => state.facetCounts || {},
);

export const selectLocationFacetCounts = createSelector(
  selectFacetCounts,
  (counts) => counts.creationLocation || [],
);

export const selectGroupFacetCounts = createSelector(
  selectFacetCounts,
  (counts) => counts.ownerGroup || [],
);

export const selectTypeFacetCounts = createSelector(
  selectFacetCounts,
  (counts) => counts.type || [],
);

export const selectKeywordFacetCounts = createSelector(
  selectFacetCounts,
  (counts) => counts.keywords || [],
);

// === Querying ===

// Returns copy with null/undefined values and empty arrays removed
const restrictFilter = (filter: any, allowedKeys?: string[]) => {
  const isNully = (value: any) => {
    const hasLength = typeof value === "string" || Array.isArray(value);
    return value == null || (hasLength && value.length === 0);
  };

  const keys = allowedKeys || Object.keys(filter);
  return keys.reduce((obj, key) => {
    const val = filter[key];
    return isNully(val) ? obj : { ...obj, [key]: val };
  }, {});
};

export const selectFullqueryParams = createSelector(
  selectDatasetState,
  (state) => {
    const filter = state.filters;
    const pagination = state.pagination;
    // don't query with modeToggle, it's only in filters for persistent routing
    const { skip, limit, sortField, modeToggle, ...theRest } = filter;
    const limits = { ...pagination, order: sortField };
    const query = restrictFilter(theRest);
    return { query: JSON.stringify(query), limits };
  },
);

export const selectFullfacetParams = createSelector(
  selectDatasetState,
  (state) => {
    const filter = state.filters;
    const pagination = state.pagination;
    const { skip, limit, sortField, modeToggle, ...theRest } = {
      ...filter,
      ...pagination,
    };
    const fields = restrictFilter(theRest);
    const facets = ["type", "creationLocation", "ownerGroup", "keywords"];
    return { fields, facets };
  },
);

// === Misc. ===

export const selectTotalSets = createSelector(
  selectDatasetState,
  (state) => state.totalCount,
);

export const selectPage = createSelector(selectPagination, (pagination) => {
  const { skip, limit } = pagination;
  return skip / limit;
});

export const selectDatasetsPerPage = createSelector(
  selectPagination,
  (pagination) => pagination.limit,
);

export const selectSearchTerms = createSelector(
  selectDatasetState,
  (state) => state.searchTerms,
);

export const selectPidTerms = createSelector(
  selectDatasetState,
  (state) => state.pidTerms,
);

export const selectKeywordsTerms = createSelector(
  selectDatasetState,
  (state) => state.keywordsTerms,
);

export const selectHasPrefilledFilters = createSelector(
  selectDatasetState,
  (state) => state.hasPrefilledFilters,
);

export const selectDatasetsInBatch = createSelector(
  selectDatasetState,
  (state) => state.batch,
);

export const selectDatasetsInBatchIndicator = createSelector(
  selectDatasetsInBatch,
  (datasets) => {
    const inBatchCount = datasets.length;

    if (inBatchCount === 0) {
      return null;
    }

    if (inBatchCount > 99) {
      return "99+";
    }

    return String(inBatchCount);
  },
);

export const selectOpenwhiskResult = createSelector(
  selectDatasetState,
  (state) => state.openwhiskResult,
);

export const selectRelatedDatasetsPageViewModel = createSelector(
  selectDatasetState,
  ({ relatedDatasets, relatedDatasetsCount }) => ({
    relatedDatasets,
    relatedDatasetsCount,
  }),
);

export const selectRelatedDatasetsFilters = createSelector(
  selectDatasetState,
  (state) => state.relatedDatasetsFilters,
);

export const selectRelatedDatasetsCurrentPage = createSelector(
  selectRelatedDatasetsFilters,
  (filters) => filters.skip / filters.limit,
);

export const selectRelatedDatasetsPerPage = createSelector(
  selectRelatedDatasetsFilters,
  (filters) => filters.limit,
);

export const selectLoadData = createSelector(
  selectDatasetState,
  (state) => state.dataLoaded,
);
