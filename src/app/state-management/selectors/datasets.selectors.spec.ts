import * as fromDatasetSelectors from "./datasets.selectors";
import { ArchViewMode, Dataset } from "../models";
import { DatasetState } from "../state/datasets.store";

const dataset = new Dataset();

const initialDatasetState: DatasetState = {
  datasets: [],
  selectedSets: [],
  currentSet: dataset,
  totalCount: 0,

  facetCounts: {},
  metadataKeys: ["test"],
  hasPrefilledFilters: false,
  searchTerms: "run",
  keywordsTerms: "",
  batch: [],

  openwhiskResult: {},

  filters: {
    mode: {},
    modeToggle: ArchViewMode.all,
    text: "",
    creationTime: {
      begin: "2019-10-03",
      end: "2019-10-04",
    },
    type: [],
    creationLocation: [],
    ownerGroup: [],
    skip: 0,
    limit: 30,
    sortField: "creationTime:desc",
    keywords: [],
    scientific: [],
    isPublished: false,
  },
};

describe("test dataset selectors", () => {
  describe("getDatasets", () => {
    it("should get all datasets", () => {
      expect(
        fromDatasetSelectors.getDatasets.projector(initialDatasetState)
      ).toEqual([]);
    });
  });

  describe("getSelectedDatasets", () => {
    it("should get all selected datasets", () => {
      expect(
        fromDatasetSelectors.getSelectedDatasets.projector(initialDatasetState)
      ).toEqual([]);
    });
  });

  describe("getMetadataKeys", () => {
    it("should get the array of metadata keys", () => {
      expect(
        fromDatasetSelectors.getMetadataKeys.projector(initialDatasetState)
      ).toEqual(["test"]);
    });
  });

  describe("getCurrentDataset", () => {
    it("should get the current dataset", () => {
      expect(
        fromDatasetSelectors.getCurrentDataset.projector(initialDatasetState)
      ).toEqual(dataset);
    });
  });

  describe("getCurrentDatasetWithoutFileInfo", () => {
    it("should get the current dataset without origDatablocks", () => {
      const { origdatablocks, ...datasetWithout } = dataset;

      expect(
        fromDatasetSelectors.getCurrentDatasetWithoutFileInfo.projector(dataset)
      ).toEqual(datasetWithout);
    });
  });

  describe("getCurrentOrigDatablocks", () => {
    it("should get the origDatablocks from the current dataset", () => {
      expect(
        fromDatasetSelectors.getCurrentOrigDatablocks.projector(dataset)
      ).toEqual(dataset.origdatablocks);
    });
  });

  describe("getCurrentDatablocks", () => {
    it("should get the datablocks from the current dataset", () => {
      expect(
        fromDatasetSelectors.getCurrentDatablocks.projector(dataset)
      ).toEqual(dataset.datablocks);
    });
  });

  describe("getCurrentAttachments", () => {
    it("should get the attachments from the current dataset", () => {
      expect(
        fromDatasetSelectors.getCurrentAttachments.projector(dataset)
      ).toEqual(dataset.attachments);
    });
  });

  describe("getFilters", () => {
    it("should get the dataset filters", () => {
      const filters = initialDatasetState.filters;

      expect(
        fromDatasetSelectors.getFilters.projector(initialDatasetState)
      ).toEqual(filters);
    });
  });

  describe("getTextFilter", () => {
    it("should get the text filter", () => {
      expect(
        fromDatasetSelectors.getTextFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual("");
    });
  });

  describe("getLocationFilter", () => {
    it("should get the creationLocation filter", () => {
      expect(
        fromDatasetSelectors.getLocationFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual([]);
    });
  });

  describe("getGroupFilter", () => {
    it("should get the ownerGroup filter", () => {
      expect(
        fromDatasetSelectors.getGroupFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual([]);
    });
  });

  describe("getTypeFilter", () => {
    it("should get the type filter", () => {
      expect(
        fromDatasetSelectors.getTypeFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual([]);
    });
  });

  describe("getKeywordsFilter", () => {
    it("should get the keywords filter", () => {
      expect(
        fromDatasetSelectors.getKeywordsFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual([]);
    });
  });

  describe("getCreationTimeFilter", () => {
    it("should get the creationTime filter", () => {
      expect(
        fromDatasetSelectors.getCreationTimeFilter.projector(
          initialDatasetState.filters
        )
      ).toEqual({ begin: "2019-10-03", end: "2019-10-04" });
    });
  });

  describe("getArchiveViewMode", () => {
    it("should get the modeToggle filter", () => {
      expect(
        fromDatasetSelectors.getArchiveViewMode.projector(
          initialDatasetState.filters
        )
      ).toEqual(ArchViewMode.all);
    });
  });

  describe("getPublicViewMode", () => {
    it("should get the isPublic filter", () => {
      expect(
        fromDatasetSelectors.getPublicViewMode.projector(
          initialDatasetState.filters
        )
      ).toEqual(false);
    });
  });

  describe("getHasAppliedFilters", () => {
    it("should return true if filters are applied", () => {
      expect(
        fromDatasetSelectors.getHasAppliedFilters.projector(
          initialDatasetState.filters
        )
      ).toEqual(true);
    });
  });

  describe("getScientificConditions", () => {
    it("should return the scientific filter", () => {
      expect(
        fromDatasetSelectors.getScientificConditions.projector(
          initialDatasetState.filters
        )
      ).toEqual([]);
    });
  });

  describe("getLocationFacetCounts", () => {
    it("should return the location facetCounts", () => {
      expect(
        fromDatasetSelectors.getLocationFacetCounts.projector(
          initialDatasetState.facetCounts
        )
      ).toEqual([]);
    });
  });

  describe("getGroupFacetCounts", () => {
    it("should return the ownerGroup facetCounts", () => {
      expect(
        fromDatasetSelectors.getGroupFacetCounts.projector(
          initialDatasetState.facetCounts
        )
      ).toEqual([]);
    });
  });

  describe("getTypeFacetCounts", () => {
    it("should return the type facetCounts", () => {
      expect(
        fromDatasetSelectors.getTypeFacetCounts.projector(
          initialDatasetState.facetCounts
        )
      ).toEqual([]);
    });
  });

  describe("getKeywordFacetCounts", () => {
    it("should return the keywords facetCounts", () => {
      expect(
        fromDatasetSelectors.getKeywordFacetCounts.projector(
          initialDatasetState.facetCounts
        )
      ).toEqual([]);
    });
  });

  describe("getFullqueryParams", () => {
    it("should return the fullquery params", () => {
      const fullqueryKeys = Object.keys(
        fromDatasetSelectors.getFullqueryParams.projector(
          initialDatasetState.filters
        )
      );
      expect(fullqueryKeys).toContain("query");
    });
  });

  describe("getFullfacetParams", () => {
    it("should return the fullfacet params", () => {
      const fullfacetKeys = Object.keys(
        fromDatasetSelectors.getFullfacetParams.projector(
          initialDatasetState.filters
        )
      );
      expect(fullfacetKeys).toContain("facets");
    });
  });

  describe("getTotalSets", () => {
    it("should get total set number", () => {
      expect(
        fromDatasetSelectors.getTotalSets.projector(initialDatasetState)
      ).toEqual(0);
    });
  });

  describe("getPage", () => {
    it("should get the current page", () => {
      expect(
        fromDatasetSelectors.getPage.projector(initialDatasetState.filters)
      ).toEqual(0);
    });
  });

  describe("getDatasetsPerPage", () => {
    it("should get the limit filter", () => {
      expect(
        fromDatasetSelectors.getDatasetsPerPage.projector(
          initialDatasetState.filters
        )
      ).toEqual(30);
    });
  });

  describe("getSearchTerms", () => {
    it("should get the current search terms", () => {
      expect(
        fromDatasetSelectors.getSearchTerms.projector(initialDatasetState)
      ).toEqual("run");
    });
  });

  describe("getKeywordsTerms", () => {
    it("should get the current keywords terms", () => {
      expect(
        fromDatasetSelectors.getKeywordsTerms.projector(initialDatasetState)
      ).toEqual("");
    });
  });

  describe("getHasPrefilledFilters", () => {
    it("should return the current state of hasPrefilledFilters", () => {
      expect(
        fromDatasetSelectors.getHasPrefilledFilters.projector(
          initialDatasetState
        )
      ).toEqual(false);
    });
  });

  describe("getDatasetsInBatch", () => {
    it("should return the current batch", () => {
      expect(
        fromDatasetSelectors.getDatasetsInBatch.projector(initialDatasetState)
      ).toEqual([]);
    });
  });

  describe("getOpenwhiskResults", () => {
    it("should return the current openwhisk result", () => {
      expect(
        fromDatasetSelectors.getOpenwhiskResult.projector(initialDatasetState)
      ).toEqual({});
    });
  });
});
