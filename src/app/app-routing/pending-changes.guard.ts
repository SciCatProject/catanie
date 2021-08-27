import { Injectable } from "@angular/core";
import {
  CanDeactivate,
} from "@angular/router";
import { Observable } from "rxjs";

export interface EditableComponent {
  hasUnsavedChanges: () => boolean | Observable<boolean>;
  // openLeavingPageGuardDialog(): () => void;
}
/**
 * Ensure that the user knowns about pending changes before leaving the page
 * @export
 * @class LeavingPageGuard
 * @implements {CanDeactivate}
 */
@Injectable({
  providedIn: "root",
})
export class LeavingPageGuard implements CanDeactivate<EditableComponent> {
  /**
   * Needs to return either a boolean or an observable that maps to a boolean
   */
  constructor(){}
  canDeactivate(component: EditableComponent): Observable<boolean> | boolean {
    return component.hasUnsavedChanges()?
      confirm("You have unsaved changes. Press Cancel to go back and save these changes, or OK to leave without saving")
      : true;
  }
}
