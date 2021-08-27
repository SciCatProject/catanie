import { APP_CONFIG, AppConfig } from "./app-config.module";
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewChecked,
  ChangeDetectorRef
} from "@angular/core";
import { select, Store } from "@ngrx/store";
import { LoopBackConfig } from "shared/sdk";
import {
  clearMessageAction,
  fetchCurrentUserAction,
  logoutAction
} from "state-management/actions/user.actions";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Meta, Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import {
  getIsLoading,
  getUserMessage
} from "state-management/selectors/user.selectors";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnDestroy, OnInit, AfterViewChecked {
  loading$ = this.store.pipe(select(getIsLoading));

  title: string;
  facility: string;
  status: string;
  userMessageSubscription: Subscription = new Subscription();

  constructor(
    private cdRef: ChangeDetectorRef,
    private metaService: Meta,
    public snackBar: MatSnackBar,
    private titleService: Title,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    private store: Store<any>
  ) {
    this.facility = this.appConfig.facility ?? "";
    if (appConfig.production === true) {
      this.status = "";
    } else {
      this.status = "test";
    }
    this.title = "SciCat " + this.facility + " " + this.status;
    this.titleService.setTitle(this.title);
    this.metaService.addTag({
      name: "description",
      content: "SciCat metadata catalogue at" + this.facility
    });
  }

  /**
   * Handles initial check of username and updates
   * auth service (loopback does not by default)
   * @memberof AppComponent
   */
  ngOnInit() {
    LoopBackConfig.setBaseURL(this.appConfig.lbBaseURL);
    console.log(LoopBackConfig.getPath());
    this.store.dispatch(fetchCurrentUserAction());
    if (window.location.pathname.indexOf("logout") !== -1) {
      this.logout();
    }

    this.userMessageSubscription = this.store
      .pipe(select(getUserMessage))
      .subscribe(current => {
        if (current && current.content !== undefined) {
          this.snackBar.open(current.content, undefined, {
            duration: current.duration
          });
          this.store.dispatch(clearMessageAction());
        }
      });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    this.userMessageSubscription.unsubscribe();
  }

  logout(): void {
    this.store.dispatch(logoutAction());
  }
}
