import { DatasetFilters, Dataset, ArchViewMode } from "state-management/models";

export interface DateTriple {
  year: number;
  month: number;
  day: number;
}

export interface FacetCount {
  _id?: string | DateTriple;
  count: number;
}

export interface FacetCounts {
  [field: string]: FacetCount[];
}

export interface DatasetState {
  datasets: Dataset[];
  selectedSets: Dataset[];
  currentSet: Dataset | undefined;
  totalCount: number;

  facetCounts: FacetCounts;
  metadataKeys: string[];
  hasPrefilledFilters: boolean;
  searchTerms: string;
  keywordsTerms: string;
  filters: DatasetFilters;

  batch: Dataset[];

  openwhiskResult: Record<string, unknown> | undefined;
}

export const initialDatasetState: DatasetState = {
  datasets: [],
  selectedSets: [],
  currentSet: undefined,
  totalCount: 0,

  facetCounts: {},
  metadataKeys: [],
  hasPrefilledFilters: false,
  searchTerms: "",
  keywordsTerms: "",
  filters: {
    modeToggle: ArchViewMode.all,
    mode: {},
    text: "",
    creationTime: null,
    type: [],
    creationLocation: [],
    ownerGroup: [],
    skip: 0,
    limit: 25,
    sortField: "creationTime:desc",
    keywords: [],
    scientific: [],
    isPublished: ""
  },

  batch: [],

  openwhiskResult: undefined
};
