import { TableColumn } from "state-management/models";

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  lbBaseURL: "https://dataportal-staging.als.lbl.gov",
  jupyterHubUrl: "https://jupyter.nersc.gov",
  externalAuthEndpoint: "/auth/msad",
  addDatasetEnabled: false,
  archiveWorkflowEnabled: false,
  columnSelectEnabled: true,
  datasetReduceEnabled: false,
  disabledDatasetColumns: [],
  editMetadataEnabled: false,
  editSampleEnabled: false,
  editPublishedData: false,
  facility: "ALS",
  fileColorEnabled: false,
  fileserverBaseURL: "",
  synapseBaseUrl: "",
  riotBaseUrl: "",
  editDatasetSampleEnabled: false,

  jsonMetadataEnabled: true,
  localColumns: [
    { name: "select", order: 0, type: "standard", enabled: true },
    { name: "datasetName", order: 1, type: "standard", enabled: true },
    { name: "runNumber", order: 2, type: "standard", enabled: false },
    { name: "sourceFolder", order: 3, type: "standard", enabled: true },
    { name: "size", order: 4, type: "standard", enabled: true },
    { name: "creationTime", order: 5, type: "standard", enabled: true },
    { name: "type", order: 6, type: "standard", enabled: true },
    { name: "image", order: 7, type: "standard", enabled: false },
    { name: "metadata", order: 8, type: "standard", enabled: false },
    { name: "proposalId", order: 9, type: "standard", enabled: true },
    { name: "ownerGroup", order: 10, type: "standard", enabled: true },
    { name: "dataStatus", order: 11, type: "standard", enabled: true },
    // { name: "derivedDatasetsNum", order: 12, type: "standard", enabled: false }
  ] as TableColumn[],
  landingPage: "",
  logbookEnabled: false,
  metadataPreviewEnabled: true,
  fileDownloadEnabled: true,
  multipleDownloadEnabled: true,
  maxDirectDownloadSize: 22000000000,
  multipleDownloadAction: "/zip_in_place",
  scienceSearchEnabled: false,
  searchProposals: false,
  searchPublicDataEnabled: false,
  searchSamples: false,
  metadataStructure: "",
  scienceSearchUnitsEnabled: false,
  sftpHost: "",
  shoppingCartEnabled: true,
  shoppingCartOnHeader: true,
  tableSciDataEnabled: false,
  userNamePromptEnabled: true,
  userProfileImageEnabled: false,
  ingestManual: "",
  gettingStarted: "",
  jobsEnabled: false,
  policiesEnabled: false,
  loginFormEnabled: true,
  oAuth2Endpoints: [
    {displayText: "Google", displayImage: "../../../assets/images/btn_google_light_normal_ios.svg", authURL: "auth/google"},
    {displayText: "ORCID", displayImage: "../../../assets/images/ORCIDiD_iconvector.svg", authURL: "auth/orcid"}]
};
