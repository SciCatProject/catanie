import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { PolicyApi, Policy } from "shared/sdk";
import { Store, select } from "@ngrx/store";
import {
  getQueryParams,
  getEditableQueryParams
} from "state-management/selectors/policies.selectors";
import * as fromActions from "state-management/actions/policies.actions";
import {
  switchMap,
  withLatestFrom,
  map,
  catchError,
  mergeMap
} from "rxjs/operators";
import { of } from "rxjs";
import { getProfile } from "state-management/selectors/users.selectors";

@Injectable()
export class PolicyEffects {
  private queryParams$ = this.store.pipe(select(getQueryParams));
  private editableQueryParams$ = this.store.pipe(
    select(getEditableQueryParams)
  );
  private userProfile$ = this.store.pipe(select(getProfile));

  fetchPolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        fromActions.fetchPoliciesAction,
        fromActions.changePageAction,
        fromActions.sortByColumnAction
      ),
      withLatestFrom(this.queryParams$),
      map(([action, params]) => params),
      switchMap(params =>
        this.policyApi.find(params).pipe(
          mergeMap((policies: Policy[]) => [
            fromActions.fetchPoliciesCompleteAction({ policies }),
            fromActions.fetchCountAction(),
            fromActions.fetchEditablePoliciesAction()
          ]),
          catchError(() => of(fromActions.fetchPoliciesFailedAction()))
        )
      )
    )
  );

  fetchCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.fetchCountAction),
      switchMap(() =>
        this.policyApi.count().pipe(
          map(({ count }) => fromActions.fetchCountCompleteAction({ count })),
          catchError(() => of(fromActions.fetchCountFailedAction()))
        )
      )
    )
  );

  fetchEditablePolicies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        fromActions.fetchEditablePoliciesAction,
        fromActions.changeEditablePageAction,
        fromActions.sortEditableByColumnAction
      ),
      withLatestFrom(this.userProfile$, this.editableQueryParams$),
      switchMap(([action, profile, params]) => {
        if (!profile) {
          // allow functional users
          return this.policyApi.find(params);
        } else {
          const email = profile.email.toLowerCase();
          const { order, skip, limit } = params;
          const filter = { where: { manager: email }, order, skip, limit };
          return this.policyApi.find(filter);
        }
      }),
      mergeMap((policies: Policy[]) => [
        fromActions.fetchEditablePoliciesCompleteAction({ policies }),
        fromActions.fetchEditableCountAction()
      ]),
      catchError(() => of(fromActions.fetchEditablePoliciesFailedAction()))
    )
  );

  fetchEditableCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.fetchEditableCountAction),
      withLatestFrom(this.userProfile$),
      switchMap(([action, profile]) => {
        if (!profile) {
          return this.policyApi.count();
        } else {
          const email = profile.email.toLowerCase();
          return this.policyApi.count({ where: { manager: email } });
        }
      }),
      map(({ count }) =>
        fromActions.fetchEditableCountCompleteAction({ count })
      ),
      catchError(() => of(fromActions.fetchEditableCountFailedAction()))
    )
  );

  submitPolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.submitPolicyAction),
      switchMap(({ ownerList, policy }) =>
        this.policyApi.updatewhere(ownerList.join(), policy).pipe(
          mergeMap(({ submissionResponse }) => [
            fromActions.submitPolicyCompleteAction({
              policy: submissionResponse
            }),
            fromActions.fetchPoliciesAction()
          ]),
          catchError(() => of(fromActions.submitPolicyFailedAction()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private policyApi: PolicyApi,
    private store: Store<Policy>
  ) {}
}
