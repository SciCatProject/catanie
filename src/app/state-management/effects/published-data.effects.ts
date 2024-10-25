import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { PublishedDataApi, PublishedData } from "shared/sdk";
import { Store } from "@ngrx/store";
import {
  selectCurrentPublishedData,
  selectQueryParams,
} from "state-management/selectors/published-data.selectors";
import * as fromActions from "state-management/actions/published-data.actions";
import {
  mergeMap,
  map,
  catchError,
  switchMap,
  exhaustMap,
  filter,
} from "rxjs/operators";
import { of } from "rxjs";
import { MessageType } from "state-management/models";
import {
  showMessageAction,
  loadingAction,
  loadingCompleteAction,
} from "state-management/actions/user.actions";
import { Router } from "@angular/router";
import { concatLatestFrom } from "@ngrx/operators";

@Injectable()
export class PublishedDataEffects {
  private queryParams$ = this.store.select(selectQueryParams);

  fetchAllPublishedData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchAllPublishedDataAction,
        fromActions.sortByColumnAction,
        fromActions.changePageAction,
      ),
      concatLatestFrom(() => this.queryParams$),
      map(([action, params]) => params),
      mergeMap((params) =>
        this.publishedDataApi.find<PublishedData>(params).pipe(
          mergeMap((publishedData: PublishedData[]) => [
            fromActions.fetchAllPublishedDataCompleteAction({ publishedData }),
            fromActions.fetchCountAction(),
          ]),
          catchError(() => of(fromActions.fetchAllPublishedDataFailedAction())),
        ),
      ),
    );
  });

  fetchCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchCountAction),
      switchMap(() =>
        this.publishedDataApi.count().pipe(
          map(({ count }) => fromActions.fetchCountCompleteAction({ count })),
          catchError(() => of(fromActions.fetchCountFailedAction())),
        ),
      ),
    );
  });

  fetchPublishedData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchPublishedDataAction),
      switchMap(({ id }) =>
        this.publishedDataApi
          .findById<PublishedData>(encodeURIComponent(id))
          .pipe(
            map((publishedData: PublishedData) =>
              fromActions.fetchPublishedDataCompleteAction({ publishedData }),
            ),
            catchError(() => of(fromActions.fetchPublishedDataFailedAction())),
          ),
      ),
    );
  });

  navigateToResyncedPublishedData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(fromActions.resyncPublishedDataCompleteAction),
        concatLatestFrom(() => this.store.select(selectCurrentPublishedData)),
        filter(([_, publishedData]) => !!publishedData),
        exhaustMap(([_, publishedData]) =>
          this.router.navigateByUrl(
            "/publishedDatasets/" + encodeURIComponent(publishedData!.doi),
          ),
        ),
      );
    },
    { dispatch: false },
  );

  publishDataset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.publishDatasetAction),
      switchMap(({ data }) =>
        this.publishedDataApi.create(data).pipe(
          mergeMap((publishedData: PublishedData) => [
            fromActions.publishDatasetCompleteAction({ publishedData }),
            fromActions.fetchPublishedDataAction({ id: publishedData.doi }),
          ]),
          catchError(() => of(fromActions.publishDatasetFailedAction())),
        ),
      ),
    );
  });

  publishDatasetCompleteMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.publishDatasetCompleteAction),
      switchMap(() => {
        const message = {
          type: MessageType.Success,
          content: "Publication Successful",
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  publishDatasetFailedMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.publishDatasetFailedAction),
      switchMap(() => {
        const message = {
          type: MessageType.Error,
          content: "Publication Failed",
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  registerPublishedData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.registerPublishedDataAction),
      switchMap(({ doi }) =>
        this.publishedDataApi.register(encodeURIComponent(doi)).pipe(
          mergeMap((publishedData) => [
            fromActions.registerPublishedDataCompleteAction({ publishedData }),
            fromActions.fetchPublishedDataAction({ id: doi }),
          ]),
          catchError(() => of(fromActions.registerPublishedDataFailedAction())),
        ),
      ),
    );
  });

  resyncPublishedData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.resyncPublishedDataAction),
      switchMap(({ doi, data }) =>
        this.publishedDataApi.resync(encodeURIComponent(doi), data).pipe(
          mergeMap((publishedData) => [
            fromActions.resyncPublishedDataCompleteAction(publishedData),
            fromActions.fetchPublishedDataAction({ id: doi }),
          ]),
          catchError(() => of(fromActions.resyncPublishedDataFailedAction())),
        ),
      ),
    );
  });

  registerPublishedDataFailedMessage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.registerPublishedDataFailedAction),
      switchMap(() => {
        const message = {
          type: MessageType.Error,
          content: "Registration Failed",
          duration: 5000,
        };
        return of(showMessageAction({ message }));
      }),
    );
  });

  loading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchAllPublishedDataAction,
        fromActions.fetchCountAction,
        fromActions.sortByColumnAction,
        fromActions.fetchPublishedDataAction,
        fromActions.publishDatasetAction,
        fromActions.registerPublishedDataAction,
        fromActions.resyncPublishedDataCompleteAction,
      ),
      switchMap(() => of(loadingAction())),
    );
  });

  loadingComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchAllPublishedDataCompleteAction,
        fromActions.fetchAllPublishedDataFailedAction,
        fromActions.fetchCountCompleteAction,
        fromActions.fetchCountFailedAction,
        fromActions.fetchPublishedDataCompleteAction,
        fromActions.fetchPublishedDataFailedAction,
        fromActions.publishDatasetCompleteAction,
        fromActions.publishDatasetFailedAction,
        fromActions.registerPublishedDataCompleteAction,
        fromActions.registerPublishedDataFailedAction,
        fromActions.resyncPublishedDataCompleteAction,
      ),
      switchMap(() => of(loadingCompleteAction())),
    );
  });

  constructor(
    private actions$: Actions,
    private publishedDataApi: PublishedDataApi,
    private router: Router,
    private store: Store,
  ) {}
}
