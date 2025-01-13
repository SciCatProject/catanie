import { Injectable } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";
import {
  Attachment,
  CreateAttachmentDto,
  Datablock,
  DatasetsService,
  OrigDatablock,
  OutputDatasetObsoleteDto,
  UpdateAttachmentDto,
} from "@scicatproject/scicat-sdk-ts";
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
      ofType(
        fromActions.fetchDatasetsAction,
        fromActions.setPublicViewModeAction,
        fromActions.sortByColumnAction,
      ),
      concatLatestFrom(() => this.fullqueryParams$),
      map(([, params]) => params),
      mergeMap(({ query, limits }) =>
        this.datasetsService
          .datasetsControllerFullquery(JSON.stringify(limits), query)
          .pipe(
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
      ofType(
        fromActions.fetchFacetCountsAction,
        fromActions.setPublicViewModeAction,
        fromActions.sortByColumnAction,
      ),
      concatLatestFrom(() => this.fullfacetParams$),
      map(([, params]) => params),
      mergeMap(({ fields, facets }) =>
        this.datasetsService
          .datasetsControllerFullfacet(
            JSON.stringify(facets),
            JSON.stringify(fields),
          )
          .pipe(
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
      map(([, params]) => params),
      mergeMap(({ query }) => {
        const parsedQuery = JSON.parse(query);
        return this.datasetsService
          .datasetsControllerMetadataKeys(JSON.stringify(parsedQuery))
          .pipe(
            map((metadataKeys) =>
              fromActions.fetchMetadataKeysCompleteAction({ metadataKeys }),
            ),
            catchError(() => of(fromActions.fetchMetadataKeysFailedAction())),
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
        return this.datasetsService.datasetsControllerFindById(pid).pipe(
          map((dataset) => fromActions.fetchDatasetCompleteAction({ dataset })),
          catchError(() => of(fromActions.fetchDatasetFailedAction())),
        );
      }),
    );
  });
  fetchDatablocksOfDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchDatablocksAction),
      switchMap(({ pid, filters }) => {
        return this.datasetsService
          .datasetsControllerFindAllDatablocks(pid, filters)
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
      switchMap(({ pid }) => {
        return this.datasetsService
          .datasetsControllerFindAllOrigDatablocks(pid)
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
        return this.datasetsService
          .datasetsControllerFindAllAttachments(pid, filters)
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
      switchMap(([, dataset, filters]) => {
        const queryFilter = {
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
            pid: { $in: dataset.inputDatasets },
          };
        }
        return this.datasetsService
          .datasetsControllerFindAll(JSON.stringify(queryFilter))
          .pipe(
            map((relatedDatasets) =>
              fromActions.fetchRelatedDatasetsCompleteAction({
                relatedDatasets,
              }),
            ),
            catchError(() =>
              of(fromActions.fetchRelatedDatasetsFailedAction()),
            ),
          );
      }),
    );
  });

  fetchRelatedDatasetsCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchRelatedDatasetsAction),
      concatLatestFrom(() => [this.currentDataset$]),
      switchMap(([, dataset]) => {
        const queryFilter = {
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
            pid: { $in: dataset.inputDatasets },
          };
        }
        return this.datasetsService
          .datasetsControllerCount(JSON.stringify(queryFilter))
          .pipe(
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
        this.datasetsService.datasetsControllerCreate(dataset).pipe(
          mergeMap((res) => [
            fromActions.addDatasetCompleteAction({
              dataset: res,
            }),
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
        this.datasetsService
          .datasetsControllerFindByIdAndUpdate(pid, property)
          .pipe(
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
        const { id, proposalId, sampleId, ...theRest } = attachment;
        return this.datasetsService
          .datasetsControllerCreateAttachment(
            theRest.datasetId,
            theRest as CreateAttachmentDto,
          )
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
      switchMap(({ datasetId, attachmentId, caption, ownerGroup }) => {
        const data = { caption, ownerGroup };
        return this.datasetsService
          .datasetsControllerFindOneAttachmentAndUpdate(
            datasetId,
            attachmentId,
            data as UpdateAttachmentDto,
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
        this.datasetsService
          .datasetsControllerFindOneAttachmentAndRemove(datasetId, attachmentId)
          .pipe(
            map(() =>
              fromActions.removeAttachmentCompleteAction({ attachmentId }),
            ),
            catchError(() => of(fromActions.removeAttachmentFailedAction())),
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
    private datasetsService: DatasetsService,
    private store: Store,
  ) {}

  private storeBatch(batch: OutputDatasetObsoleteDto[], userId: string) {
    const json = JSON.stringify(batch);
    localStorage.setItem("batch", json);
    localStorage.setItem("batchUser", userId);
  }

  private retrieveBatch(ofUserId: string): OutputDatasetObsoleteDto[] {
    const json = localStorage.getItem("batch");
    const userId = localStorage.getItem("batchUser");

    if (json != null && userId === ofUserId) {
      return JSON.parse(json);
    } else {
      return [];
    }
  }
}
