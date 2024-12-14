import { angularMaterialRenderers } from "@jsonforms/angular-material";
import { customRenderers } from "./customRenderer/custom-renderers";

export interface IIngestionRequestInformation {
  selectedPath: string;
  selectedMethod: IExtractionMethod;
  scicatHeader: Object;
  userMetaData: Object;
  extractorMetaData: Object;
  extractorMetaDataReady: boolean;
  mergedMetaDataString: string;
}

export interface IExtractionMethod {
  name: string;
  schema: string; // Base64 encoded JSON schema
};

export const configuredRenderer = [
  ...angularMaterialRenderers,
  ...customRenderers,
];


export class IngestorMetadaEditorHelper {
  // Resolve all $ref in a schema
  static resolveRefs(schema: any, rootSchema: any): any {
    if (schema === null || schema === undefined) {
      return schema;
    }

    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let ref = rootSchema;
      refPath.forEach((part) => {
        ref = ref[part];
      });
      return IngestorMetadaEditorHelper.resolveRefs(ref, rootSchema);
    } else if (typeof schema === 'object') {
      for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
          schema[key] = IngestorMetadaEditorHelper.resolveRefs(schema[key], rootSchema);
        }
      }
    }
    return schema;
  };

  static mergeUserAndExtractorMetadata(userMetadata: Object, extractorMetadata: Object, space: number): string {
    return JSON.stringify({ ...userMetadata, ...extractorMetadata }, null, space);
  }

  static createEmptyRequestInformation = (): IIngestionRequestInformation => {
    return {
      selectedPath: '',
      selectedMethod: { name: '', schema: '' },
      scicatHeader: {},
      userMetaData: {},
      extractorMetaData: {},
      extractorMetaDataReady: false,
      mergedMetaDataString: '',
    };
  };
};