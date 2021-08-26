import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { LoopBackAuth } from "shared/sdk";
import { DateTime } from "luxon";
import { Column } from "shared/modules/shared-table/shared-table.module";

export interface FilterLimits {
  limit: number;
  skip: number;
  order?: string;
}

@Injectable({
  providedIn: "root",
})
export class ScicatDataService {
  private accessToken: string;

  constructor(private http: HttpClient, private auth: LoopBackAuth) {
    this.accessToken = auth.getToken().id;
    // console.log("Got token:", this.accessToken);
  }

  findDataById(url: string, dataId: number): Observable<any> {
    return this.http.get<any>(`${url}/${dataId}`);
  }

  // TODO when do I need to use "mode" syntax (may be for nested keys ?)
  createColumnFilterMongoExpression = (columns: Column[], filterExpressions: any) => {
    const result: Record<string, any> = {};
    if (filterExpressions) {
      let blocal: DateTime;
      let elocal: DateTime;
      let columnkey: string;
      Object.keys(filterExpressions).forEach((key, index) => {
        if (filterExpressions[key] !== "") {
          columnkey = key;
          if (key.endsWith(".start")) {
            columnkey = key.replace(".start", "");
          }
          if (key.endsWith(".end")) {
            columnkey = key.replace(".end", "");
          }
          const column = columns.find((c) => c.id === columnkey);
          // All non-column conditions are ignored here
          if (column) {
            switch (column.matchMode) {
              case "contains": {
                result[key] = { $regex: filterExpressions[key], $options: "i" };
                break;
              }
              case "greaterThan": {
                result[key] = { $gt: Number(filterExpressions[key]) };
                break;
              }
              case "lessThan": {
                result[key] = { $lt: Number(filterExpressions[key]) };
                break;
              }
              case "after": {
                result[key] = { $gte: filterExpressions[key] };
                break;
              }
              case "between": {
                // TODO: is between always date related (assume this for now)
                // convert to UTC and add one day to end expression
                if (!(columnkey in result)) {
                  result[columnkey] = {};
                }
                if (key.endsWith(".start")) {
                  blocal = DateTime.fromISO(filterExpressions[key]).toUTC();
                  result[columnkey]["begin"] = blocal.toISO();
                }
                if (key.endsWith(".end")) {
                  elocal = DateTime.fromISO(filterExpressions[key]).toUTC().plus({days: 1});
                  result[columnkey]["end"] = elocal.toISO();
                }
                break;
              }
              case "is": {
                result[key] = filterExpressions[key];
                break;
              }
              default: {
                result[key] = { $regex: filterExpressions[key], $options: "i" };
                break;
              }
            }
          }
          if (columnkey === "globalSearch"){
            result["text"] = filterExpressions["globalSearch"];
          }
        }
      });
    }
    // add missing time range limits
    Object.keys(result).forEach((key, index) => {
      if (typeof result[key] === "object") {
        if ("begin" in result[key] && !("end" in result[key])) {
          result[key].end = "2099-12-31";
        } else if (!("begin" in result[key]) && ("end" in result[key])) {
          result[key].begin = "1970-01-01";
        }
      }
    });
    // console.log("Result of map after single syntax:",result)

    return result;
  };

  findAllData(
    url: string,
    columns: Column[],
    filterExpressions = {},
    sortField?: string,
    sortOrder = "asc",
    pageNumber = 0,
    pageSize = 10
  ): Observable<any[]> {
    // Dataset filter syntax (not used here)
    // {"limit":3,"skip":11,"where":{"ownerGroup":"p16633"},"order":"size ASC"}

    // fullQuery syntax
    // allows to including full text search and filter on individual fields
    // v3/Datasets/fullquery?fields=...&limits=

    // fields	{"mode":{"datasetlifecycle.retrievable":true,"datasetlifecycle.archivable":false},
    //         "text":"wasp","creationLocation":["/PSI/SLS/TOMCAT"],"isPublished":false}
    // The mode field can have any valiq query expression, as described in
    // https://docs.mongodb.com/manual/tutorial/query-documents/#read-operations-query-argument
    // and https://docs.mongodb.com/manual/reference/operator/query/

    // limits	{"skip":0,"limit":50,"order":"creationTime:desc"}

    // ("findalldata:", filterExpressions)
    const filterFields = this.createColumnFilterMongoExpression(columns, filterExpressions);
    const limits: FilterLimits = { limit: pageSize, skip: pageSize * pageNumber };
    if (sortField) {
      limits["order"] = sortField + ":" + sortOrder;
    }

    const params = new HttpParams()
      .set("fields", JSON.stringify(filterFields))
      .set("limits", JSON.stringify(limits))
      .append("access_token", this.accessToken);
    return this.http.get<any[]>(`${url}/fullquery`, { params });
  }

  // use fullfacets instead of count to allow for more complex filters. facet "all" is default I assume
  // fields	{"mode":{},"text":"wasp","creationLocation":["/PSI/SLS/TOMCAT"],"isPublished":false}
  // facets	["type","creationTime","creationLocation","ownerGroup","keywords"]
  getCount(
    url: string,
    columns: Column[],
    filterExpressions?: any
  ): Observable<any> {

    const filterFields = this.createColumnFilterMongoExpression(columns, filterExpressions);
    const params = new HttpParams()
      .set("fields", JSON.stringify(filterFields))
      .set("facets", JSON.stringify([]))
      .append("access_token", this.accessToken);

    return this.http.get<any>(`${url}/fullfacet`, { params });
  }
}
