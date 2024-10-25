import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { PolicyApi, Policy } from "shared/sdk";
import { Store } from "@ngrx/store";
import {
  selectQueryParams,
  selectEditableQueryParams,
} from "state-management/selectors/policies.selectors";
import * as fromActions from "state-management/actions/policies.actions";
import {
  switchMap,
  withLatestFrom,
  map,
  catchError,
  mergeMap,
} from "rxjs/operators";
import { of } from "rxjs";
import { selectProfile } from "state-management/selectors/user.selectors";
import {
  loadingAction,
  loadingCompleteAction,
} from "state-management/actions/user.actions";
import { concatLatestFrom } from "@ngrx/operators";

@Injectable()
export class PolicyEffects {
  private queryParams$ = this.store.select(selectQueryParams);
  private editableQueryParams$ = this.store.select(selectEditableQueryParams);
  private userProfile$ = this.store.select(selectProfile);

  fetchPolicies$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchPoliciesAction,
        fromActions.changePageAction,
        fromActions.sortByColumnAction,
      ),
      concatLatestFrom(() => this.queryParams$),
      map(([action, params]) => params),
      switchMap((params) =>
        this.policyApi.find<Policy>(params).pipe(
          mergeMap((policies: Policy[]) => [
            fromActions.fetchPoliciesCompleteAction({ policies }),
            fromActions.fetchCountAction(),
            fromActions.fetchEditablePoliciesAction(),
          ]),
          catchError(() => of(fromActions.fetchPoliciesFailedAction())),
        ),
      ),
    );
  });

  fetchCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchCountAction),
      switchMap(() =>
        this.policyApi.count().pipe(
          map(({ count }) => fromActions.fetchCountCompleteAction({ count })),
          catchError(() => of(fromActions.fetchCountFailedAction())),
        ),
      ),
    );
  });

  fetchEditablePolicies$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchEditablePoliciesAction,
        fromActions.changeEditablePageAction,
        fromActions.sortEditableByColumnAction,
      ),
      withLatestFrom(this.userProfile$, this.editableQueryParams$),
      switchMap(([action, profile, params]) => {
        let filter;
        if (!profile) {
          // allow functional users
          filter = params;
        } else {
          const email = profile.email.toLowerCase();
          const { order, skip, limit } = params;
          filter = { where: { manager: email }, order, skip, limit };
        }
        return this.policyApi.find<Policy>(filter).pipe(
          mergeMap((policies: Policy[]) => [
            fromActions.fetchEditablePoliciesCompleteAction({ policies }),
            fromActions.fetchEditableCountAction(),
          ]),
          catchError(() => of(fromActions.fetchEditablePoliciesFailedAction())),
        );
      }),
    );
  });

  fetchEditableCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.fetchEditableCountAction),
      concatLatestFrom(() => this.userProfile$),
      switchMap(([action, profile]) => {
        let filter;
        if (!profile) {
          filter = {};
        } else {
          const email = profile.email.toLowerCase();
          filter = { manager: email };
        }
        return this.policyApi.count(filter).pipe(
          map(({ count }) =>
            fromActions.fetchEditableCountCompleteAction({ count }),
          ),
          catchError(() => of(fromActions.fetchEditableCountFailedAction())),
        );
      }),
    );
  });

  submitPolicy$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromActions.submitPolicyAction),
      switchMap(({ ownerList, policy }) =>
        this.policyApi.updatewhere(ownerList.join(), policy).pipe(
          mergeMap(({ submissionResponse }) => [
            fromActions.submitPolicyCompleteAction({
              policy: submissionResponse,
            }),
            fromActions.fetchPoliciesAction(),
          ]),
          catchError(() => of(fromActions.submitPolicyFailedAction())),
        ),
      ),
    );
  });

  loading$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchPoliciesAction,
        fromActions.fetchCountAction,
        fromActions.fetchEditablePoliciesAction,
        fromActions.fetchEditableCountAction,
        fromActions.submitPolicyAction,
      ),
      switchMap(() => of(loadingAction())),
    );
  });

  loadingComplete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        fromActions.fetchPoliciesFailedAction,
        fromActions.fetchCountCompleteAction,
        fromActions.fetchCountFailedAction,
        fromActions.fetchEditablePoliciesFailedAction,
        fromActions.fetchEditableCountCompleteAction,
        fromActions.fetchEditableCountFailedAction,
        fromActions.submitPolicyCompleteAction,
        fromActions.submitPolicyFailedAction,
      ),
      switchMap(() => of(loadingCompleteAction())),
    );
  });

  constructor(
    private actions$: Actions,
    private policyApi: PolicyApi,
    private store: Store,
  ) {}
}
