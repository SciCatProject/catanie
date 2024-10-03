import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import {
  DatasetApi,
  Dataset,
  LoopBackFilter,
  OrigDatablock,
  Attachment,
  Datablock,
  DerivedDataset,
} from "shared/sdk";
import { Store } from "@ngrx/store";
import {
  selectFullqueryParams,
  selectFullfacetParams,
  selectDatasetsInBatch,
  selectCurrentDataset,
  selectRelatedDatasetsFilters,
} from "state-management/selectors/datasets.selectors";
import * as fromActions from "state-management/actions/datasets.actions";
import {
  withLatestFrom,
  mergeMap,
  map,
  catchError,
  switchMap,
  tap,
  filter,
} from "rxjs/operators";
import { of } from "rxjs";
import { selectCurrentUser } from "state-management/selectors/user.selectors";
import {
  logoutCompleteAction,
  loadingAction,
  loadingCompleteAction,
  updateUserSettingsAction,
} from "state-management/actions/user.actions";
import { fetchMetadataTypesAction } from "state-management/actions/datasets.actions";

@Injectable()
export class DatasetEffects {
  currentDataset$ = this.store.select(selectCurrentDataset);
  relatedDatasetsFilters$ = this.store.select(selectRelatedDatasetsFilters);
  fullqueryParams$ = this.store.select(selectFullqueryParams);
  fullfacetParams$ = this.store.select(selectFullfacetParams);
  datasetsInBatch$ = this.store.select(selectDatasetsInBatch);
  currentUser$ = this.store.select(selectCurrentUser);

  fetchDatasets$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchDatasetsAction),
      concatLatestFrom(() => this.fullqueryParams$),
      map(([action, params]) => params),
      mergeMap(({ query, limits }) =>
        this.datasetApi.fullquery(query, limits).pipe(
          map((datasets) =>
            fromActions.fetchDatasetsCompleteAction({ datasets }),
          ),
          catchError(() => of(fromActions.fetchDatasetsFailedAction())),
        ),
      ),
    );
  });

  fetchFacetCounts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchFacetCountsAction),
      concatLatestFrom(() => this.fullfacetParams$),
      map(([action, params]) => params),
      mergeMap(({ fields, facets }) =>
        this.datasetApi.fullfacet(fields, facets).pipe(
          map((res) => {
            const { all, ...facetCounts } = res[0];
            const allCounts = all && all.length > 0 ? all[0].totalSets : 0;
            return fromActions.fetchFacetCountsCompleteAction({
              facetCounts,
              allCounts,
            });
          }),
          catchError(() => of(fromActions.fetchFacetCountsFailedAction())),
        ),
      ),
    );
  });

  fetchMetadataKeys$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchMetadataKeysAction),
      concatLatestFrom(() => this.fullqueryParams$),
      map(([action, params]) => params),
      mergeMap(({ query }) => {
        const parsedQuery = JSON.parse(query);
        parsedQuery.scientificMetadata = { $exists: true, $ne: "" };
        return this.datasetApi.metadataKeys(JSON.stringify(parsedQuery)).pipe(
          map((metadataKeys) =>
            fromActions.fetchMetadataKeysCompleteAction({ metadataKeys }),
          ),
          catchError(() => of(fromActions.fetchMetadataKeysFailedAction())),
        );
      }),
    );
  });

  fetchMetadataTypes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchMetadataTypesAction),
      mergeMap(() => {
        return this.datasetApi.metadataTypes().pipe(
          map((metadataTypes) =>
            fromActions.fetchMetadataTypesCompleteAction({ metadataTypes }),
          ),
          catchError(() => of(fromActions.fetchMetadataTypesFailedAction())),
        );
      }),
    );
  });

  updateUserDatasetsLimit$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.changePageAction),
      map(({ limit }) =>
        updateUserSettingsAction({ property: { datasetCount: limit } }),
      ),
    );
  });

  updateMetadataKeys$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.addScientificConditionAction,
        fromActions.removeScientificConditionAction,
        fromActions.clearFacetsAction,
      ),
      map(() => fromActions.fetchMetadataKeysAction()),
    );
  });

  fetchDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchDatasetAction),
      switchMap(({ pid }) => {
        return this.datasetApi.findById<Dataset>(encodeURIComponent(pid)).pipe(
          map((dataset: Dataset) =>
            fromActions.fetchDatasetCompleteAction({ dataset }),
          ),
          catchError(() => of(fromActions.fetchDatasetFailedAction())),
        );
      }),
    );
  });
  fetchDatablocksOfDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchDatablocksAction),
      switchMap(({ pid, filters }) => {
        return this.datasetApi
          .getDatablocks(encodeURIComponent(pid), filters)
          .pipe(
            map((datablocks: Datablock[]) =>
              fromActions.fetchDatablocksCompleteAction({ datablocks }),
            ),
            catchError(() => of(fromActions.fetchDatablocksFailedAction())),
          );
      }),
    );
  });

  fetchOrigDatablocksOfDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchOrigDatablocksAction),
      switchMap(({ pid, filters }) => {
        return this.datasetApi
          .getOrigdatablocks(encodeURIComponent(pid), {})
          .pipe(
            map((origdatablocks: OrigDatablock[]) =>
              fromActions.fetchOrigDatablocksCompleteAction({ origdatablocks }),
            ),
            catchError(() => of(fromActions.fetchOrigDatablocksFailedAction())),
          );
      }),
    );
  });

  fetchAttachmentsOfDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchAttachmentsAction),
      switchMap(({ pid, filters }) => {
        return this.datasetApi
          .getAttachments(encodeURIComponent(pid), filters)
          .pipe(
            map((attachments: Attachment[]) =>
              fromActions.fetchAttachmentsCompleteAction({ attachments }),
            ),
            catchError(() => of(fromActions.fetchAttachmentsFailedAction())),
          );
      }),
    );
  });

  fetchRelatedDatasets$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchRelatedDatasetsAction),
      concatLatestFrom(() => [
        this.currentDataset$,
        this.relatedDatasetsFilters$,
      ]),
      switchMap(([_, dataset, filters]) => {
        const queryFilter: LoopBackFilter = {
          where: {},
          limits: {
            skip: filters.skip,
            limit: filters.limit,
            order: filters.sortField,
          },
        };
        if (dataset.type === "raw") {
          queryFilter.where = {
            type: "derived",
            inputDatasets: dataset.pid,
          };
        }
        if (dataset.type === "derived") {
          queryFilter.where = {
            pid: { $in: (dataset as unknown as DerivedDataset).inputDatasets },
          };
        }
        return this.datasetApi.find<Dataset>(queryFilter).pipe(
          map((relatedDatasets: Dataset[]) =>
            fromActions.fetchRelatedDatasetsCompleteAction({ relatedDatasets }),
          ),
          catchError(() => of(fromActions.fetchRelatedDatasetsFailedAction())),
        );
      }),
    );
  });

  fetchRelatedDatasetsCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchRelatedDatasetsAction),
      concatLatestFrom(() => [this.currentDataset$]),
      switchMap(([_, dataset]) => {
        const queryFilter: LoopBackFilter = {
          where: {},
        };
        if (dataset.type === "raw") {
          queryFilter.where = {
            type: "derived",
            inputDatasets: dataset.pid,
          };
        }
        if (dataset.type === "derived") {
          queryFilter.where = {
            pid: { $in: (dataset as unknown as DerivedDataset).inputDatasets },
          };
        }
        return this.datasetApi.count(queryFilter).pipe(
          map(({ count }) =>
            fromActions.fetchRelatedDatasetsCountCompleteAction({
              count,
            }),
          ),
          catchError(() =>
            of(fromActions.fetchRelatedDatasetsCountFailedAction()),
          ),
        );
      }),
    );
  });

  addDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.addDatasetAction),
      mergeMap(({ dataset }) =>
        this.datasetApi.create(dataset).pipe(
          mergeMap((res) => [
            fromActions.addDatasetCompleteAction({ dataset: res }),
            fromActions.fetchDatasetsAction(),
            fromActions.fetchDatasetAction({ pid: res.pid }),
          ]),
          catchError(() => of(fromActions.addDatasetFailedAction())),
        ),
      ),
    );
  });

  updateProperty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.updatePropertyAction),
      switchMap(({ pid, property }) =>
        this.datasetApi.patchAttributes(encodeURIComponent(pid), property).pipe(
          switchMap(() => [
            fromActions.updatePropertyCompleteAction(),
            fromActions.fetchDatasetAction({ pid }),
          ]),
          catchError(() => of(fromActions.updatePropertyFailedAction())),
        ),
      ),
    );
  });

  addAttachment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.addAttachmentAction),
      switchMap(({ attachment }) => {
        const {
          id,
          rawDatasetId,
          derivedDatasetId,
          proposalId,
          sampleId,
          ...theRest
        } = attachment;
        return this.datasetApi
          .createAttachments(encodeURIComponent(theRest.datasetId!), theRest)
          .pipe(
            map((res) =>
              fromActions.addAttachmentCompleteAction({ attachment: res }),
            ),
            catchError(() => of(fromActions.addAttachmentFailedAction())),
          );
      }),
    );
  });

  updateAttachmentCaption$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.updateAttachmentCaptionAction),
      switchMap(({ datasetId, attachmentId, caption }) => {
        const data = { caption };
        return this.datasetApi
          .updateByIdAttachments(
            encodeURIComponent(datasetId),
            encodeURIComponent(attachmentId),
            data,
          )
          .pipe(
            map((attachment) =>
              fromActions.updateAttachmentCaptionCompleteAction({ attachment }),
            ),
            catchError(() =>
              of(fromActions.updateAttachmentCaptionFailedAction()),
            ),
          );
      }),
    );
  });

  removeAttachment$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.removeAttachmentAction),
      switchMap(({ datasetId, attachmentId }) =>
        this.datasetApi
          .destroyByIdAttachments(encodeURIComponent(datasetId), attachmentId)
          .pipe(
            map(() =>
              fromActions.removeAttachmentCompleteAction({ attachmentId }),
            ),
            catchError(() => of(fromActions.removeAttachmentFailedAction())),
          ),
      ),
    );
  });

  reduceDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.reduceDatasetAction),
      mergeMap(({ dataset }) =>
        this.datasetApi.reduceDataset(dataset).pipe(
          map((result) => fromActions.reduceDatasetCompleteAction({ result })),
          catchError(() => of(fromActions.reduceDatasetFailedAction())),
        ),
      ),
    );
  });

  appendToArrayField$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.appendToDatasetArrayFieldAction),
      mergeMap(({ pid, fieldName, data }) =>
        this.datasetApi.appendToArrayField(pid, fieldName, data).pipe(
          map(() => fromActions.appendToDatasetArrayFieldCompleteAction()),
          catchError(() =>
            of(fromActions.appendToDatasetArrayFieldFailedAction()),
          ),
        ),
      ),
    );
  });

  loading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchDatasetsAction,
        fromActions.fetchFacetCountsAction,
        fromActions.fetchMetadataKeysAction,
        fromActions.fetchDatasetAction,
        fromActions.fetchOrigDatablocksAction,
        fromActions.fetchDatablocksAction,
        fromActions.fetchAttachmentsAction,
        fromActions.addDatasetAction,
        fromActions.updatePropertyAction,
        fromActions.addAttachmentAction,
        fromActions.updateAttachmentCaptionAction,
        fromActions.removeAttachmentAction,
      ),
      switchMap(() => of(loadingAction())),
    );
  });

  loadingComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchDatasetsCompleteAction,
        fromActions.fetchDatasetsFailedAction,
        fromActions.fetchFacetCountsCompleteAction,
        fromActions.fetchFacetCountsFailedAction,
        fromActions.fetchMetadataKeysCompleteAction,
        fromActions.fetchMetadataKeysFailedAction,
        fromActions.fetchDatasetCompleteAction,
        fromActions.fetchDatasetFailedAction,
        fromActions.fetchOrigDatablocksCompleteAction,
        fromActions.fetchOrigDatablocksFailedAction,
        fromActions.fetchDatablocksCompleteAction,
        fromActions.fetchDatablocksFailedAction,
        fromActions.fetchOrigDatablocksCompleteAction,
        fromActions.fetchOrigDatablocksFailedAction,
        fromActions.fetchAttachmentsCompleteAction,
        fromActions.fetchAttachmentsFailedAction,
        fromActions.addDatasetCompleteAction,
        fromActions.addDatasetFailedAction,
        fromActions.updatePropertyCompleteAction,
        fromActions.updatePropertyFailedAction,
        fromActions.addAttachmentCompleteAction,
        fromActions.addAttachmentFailedAction,
        fromActions.updateAttachmentCaptionCompleteAction,
        fromActions.updateAttachmentCaptionFailedAction,
        fromActions.removeAttachmentCompleteAction,
        fromActions.removeAttachmentFailedAction,
      ),
      switchMap(() => of(loadingCompleteAction())),
    );
  });

  prefillBatch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.prefillBatchAction),
      concatLatestFrom(() => this.currentUser$),
      filter(([, user]) => user != null),
      map(([, user]) => this.retrieveBatch(user?.id)),
      map((batch) => fromActions.prefillBatchCompleteAction({ batch })),
    );
  });

  storeBatch$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          fromActions.addToBatchAction,
          fromActions.storeBatchAction,
          fromActions.removeFromBatchAction,
          fromActions.clearBatchAction,
        ),
        withLatestFrom(this.datasetsInBatch$, this.currentUser$),
        tap(([, batch, user]) => this.storeBatch(batch, user?.id)),
      );
    },
    { dispatch: false },
  );

  clearBatchOnLogout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(logoutCompleteAction),
        tap(() => this.storeBatch([], "")),
      );
    },
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private datasetApi: DatasetApi,
    private store: Store,
  ) {}

  private storeBatch(batch: Dataset[], userId: string) {
    const json = JSON.stringify(batch);
    localStorage.setItem("batch", json);
    localStorage.setItem("batchUser", userId);
  }

  private retrieveBatch(ofUserId: string): Dataset[] {
    const json = localStorage.getItem("batch");
    const userId = localStorage.getItem("batchUser");

    if (json != null && userId === ofUserId) {
      return JSON.parse(json);
    } else {
      return [];
    }
  }
}
