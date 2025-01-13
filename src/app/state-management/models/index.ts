import {
  ConditionConfig,
  FilterConfig,
} from "shared/modules/filters/filters.module";

export interface Settings {
  tapeCopies: string;
  datasetCount: number;
  jobCount: number;
  darkTheme: false;
}

export interface TableColumn {
  name: string;
  order: number;
  type: "standard" | "custom";
  enabled: boolean;
}

export interface LabelMaps {
  [key: string]: Record<string, string>;
}

export interface DatasetDetailView {
  currentLabelSet: string;
  labelSets: {
    [key: string]: Record<string, string>;
  };
}

export interface DatasetsListSettings {
  columns: TableColumn[];
  filters: FilterConfig[];
  conditions: ConditionConfig[];
}

export enum MessageType {
  Success = "success",
  Error = "error",
}

export interface Message {
  content: string;
  type: MessageType;
  duration: number;
}

export class Message implements Message {
  constructor(content: string, type: MessageType, duration: number) {
    this.content = content;
    this.type = type;
    this.duration = duration;
  }
}

export enum ArchViewMode {
  all = "all",
  archivable = "archivable",
  retrievable = "retrievable",
  work_in_progress = "work in progress",
  system_error = "system error",
  user_error = "user error",
}
export enum JobViewMode {
  myJobs = "my jobs",
  allJobs = "all jobs",
}

type ScientificConditionRelation =
  | "EQUAL_TO_NUMERIC"
  | "EQUAL_TO_STRING"
  | "GREATER_THAN"
  | "LESS_THAN";

export interface ScientificCondition {
  lhs: string;
  relation: ScientificConditionRelation;
  rhs: string | number;
  unit: string;
}

export interface GenericFilters {
  sortField: string;
  skip: number;
  limit: number;
}

export interface DatasetFilters extends GenericFilters {
  modeToggle: ArchViewMode;
  text: string;
  ownerGroup: string[];
  type: string[];
  creationTime: { begin: string; end: string } | null;
  creationLocation: string[];
  keywords: string[];
  mode: Record<string, unknown>;
  scientific: ScientificCondition[];
  isPublished: boolean | "";
  pid: string | { $regex: string };
}

export interface SampleFilters extends GenericFilters {
  text: string;
  characteristics: ScientificCondition[];
}

export interface LogbookFilters extends GenericFilters {
  textSearch: string;
  showBotMessages: boolean;
  showUserMessages: boolean;
  showImages: boolean;
}

export interface JobFilters extends GenericFilters {
  mode: Record<string, string> | undefined;
}
