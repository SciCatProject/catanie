import { DatasetState } from "state-management/state/datasets.store";
import { createFeatureSelector, createSelector } from "@ngrx/store";

const getDatasetState = createFeatureSelector<DatasetState>("datasets");

export const getDatasets = createSelector(
  getDatasetState,
  (state: DatasetState) => state.datasets
);

export const getSelectedDatasets = createSelector(
  getDatasetState,
  (state) => state.selectedSets
);

export const getMetadataKeys = createSelector(
  getDatasetState,
  (state) => state.metadataKeys
);

export const getCurrentDataset = createSelector(
  getDatasetState,
  (state) => state.currentSet
);

export const getCurrentDatasetWithoutFileInfo = createSelector(
  getCurrentDataset,
  (currentSet) => {
    if (currentSet) {
      const { origdatablocks, datablocks, ...theRest } = currentSet;
      return theRest;
    }
    return undefined;
  }
);

export const getCurrentOrigDatablocks = createSelector(
  getCurrentDataset,
  (dataset) => (dataset ? dataset.origdatablocks : [])
);

export const getCurrentDatablocks = createSelector(
  getCurrentDataset,
  (dataset) => (dataset ? dataset.datablocks : [])
);

export const getCurrentAttachments = createSelector(
  getCurrentDataset,
  (dataset) => (dataset ? dataset.attachments : [])
);

// === Filters ===

export const getFilters = createSelector(
  getDatasetState,
  (state: DatasetState) => state.filters
);

export const getTextFilter = createSelector(
  getFilters,
  (filters) => filters.text || ""
);

export const getLocationFilter = createSelector(
  getFilters,
  (filters) => filters.creationLocation
);

export const getGroupFilter = createSelector(
  getFilters,
  (filters) => filters.ownerGroup
);

export const getTypeFilter = createSelector(
  getFilters,
  (filters) => filters.type
);

export const getKeywordsFilter = createSelector(
  getFilters,
  (filters) => filters.keywords
);

export const getCreationTimeFilter = createSelector(
  getFilters,
  (filters) => filters.creationTime
);

export const getArchiveViewMode = createSelector(
  getFilters,
  (filters) => filters.modeToggle
);

export const getPublicViewMode = createSelector(
  getFilters,
  (filters) => filters.isPublished
);

export const getHasAppliedFilters = createSelector(
  getFilters,
  (filters) =>
    filters.text !== "" ||
    filters.creationLocation.length > 0 ||
    filters.ownerGroup.length > 0 ||
    filters.type.length > 0 ||
    filters.keywords.length > 0 ||
    filters.scientific.length > 0 ||
    (filters.creationTime &&
      (filters.creationTime.begin !== null ||
        filters.creationTime.end !== null))
);

export const getScientificConditions = createSelector(
  getFilters,
  (filters) => filters.scientific
);

// === Facet Counts ===

const getFacetCounts = createSelector(
  getDatasetState,
  (state) => state.facetCounts || {}
);

export const getLocationFacetCounts = createSelector(
  getFacetCounts,
  (counts) => counts.creationLocation || []
);

export const getGroupFacetCounts = createSelector(
  getFacetCounts,
  (counts) => counts.ownerGroup || []
);

export const getTypeFacetCounts = createSelector(
  getFacetCounts,
  (counts) => counts.type || []
);

export const getKeywordFacetCounts = createSelector(
  getFacetCounts,
  (counts) => counts.keywords || []
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

export const getFullqueryParams = createSelector(getFilters, (filter) => {
  // don't query with modeToggle, it's only in filters for persistent routing
  const {
    skip,
    limit,
    sortField,
    modeToggle,
    ...theRest
  } = filter;
  const limits = { skip, limit, order: sortField };
  const query = restrictFilter(theRest);
  return { query: JSON.stringify(query), limits };
});

export const getFullfacetParams = createSelector(getFilters, (filter) => {
  const {
    skip,
    limit,
    sortField,
    modeToggle,
    ...theRest
  } = filter;
  const fields = restrictFilter(theRest);
  const facets = [
    "type",
    "creationTime",
    "creationLocation",
    "ownerGroup",
    "keywords",
  ];
  return { fields, facets };
});

// === Misc. ===

export const getTotalSets = createSelector(
  getDatasetState,
  (state) => state.totalCount
);

export const getPage = createSelector(getFilters, (filters) => {
  const { skip, limit } = filters;
  return skip / limit;
});

export const getDatasetsPerPage = createSelector(
  getFilters,
  (filters) => filters.limit
);

export const getSearchTerms = createSelector(
  getDatasetState,
  (state) => state.searchTerms
);

export const getKeywordsTerms = createSelector(
  getDatasetState,
  (state) => state.keywordsTerms
);

export const getHasPrefilledFilters = createSelector(
  getDatasetState,
  (state) => state.hasPrefilledFilters
);

export const getDatasetsInBatch = createSelector(
  getDatasetState,
  (state) => state.batch
);

export const getOpenwhiskResult = createSelector(
  getDatasetState,
  (state) => state.openwhiskResult
);
