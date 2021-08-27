import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { APP_CONFIG, AppConfig } from "app-config.module";
import { Store, select } from "@ngrx/store";
import {
  fetchCurrentUserAction,
  logoutAction
} from "state-management/actions/user.actions";
import { Subscription } from "rxjs";
import {
  getCurrentUserAccountType,
  getCurrentUser,
  getProfile,
  getIsLoggedIn,
  getCurrentUserName
} from "state-management/selectors/user.selectors";
import { getDatasetsInBatch } from "state-management/selectors/datasets.selectors";

@Component({
  selector: "app-app-header",
  templateUrl: "./app-header.component.html",
  styleUrls: ["./app-header.component.scss"]
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  facility: string;
  status: string;

  username = "";
  profileImage: string;
  batch$ = this.store.pipe(select(getDatasetsInBatch));
  inBatchPids: string[] = [];
  inBatchCount = 0;
  inBatchIndicator = "";
  loggedIn$ = this.store.pipe(select(getIsLoggedIn));

  constructor(
    private store: Store<any>,
    @Inject(APP_CONFIG) public appConfig: AppConfig
  ) {
    this.facility = appConfig.facility ?? "";
    if (appConfig.production === true) {
      this.status = "";
    } else {
      this.status = "test";
    }
    this.profileImage = "assets/images/user.png";
  }

  logout(): void {
    this.store.dispatch(logoutAction());
  }

  ngOnInit() {
    this.store.dispatch(fetchCurrentUserAction());

    this.subscriptions.push(
      this.batch$.subscribe(datasets => {
        if (datasets) {
          this.inBatchPids = datasets.map(dataset => dataset.pid);
          this.inBatchCount = this.inBatchPids.length;
          this.inBatchIndicator =
            this.inBatchCount > 99 ? "99+" : this.inBatchCount + "";
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(select(getCurrentUserAccountType)).subscribe(type => {
        if (type === "functional") {
          this.profileImage = "assets/images/user.png";
        }
      })
    );

    this.subscriptions.push(
      this.store.pipe(select(getCurrentUser)).subscribe(current => {
        console.log("current: ", current);
        if (current) {
          this.username = current.username.replace("ms-ad.", "");
          if (!current.realm && current.id) {
            this.store.pipe(select(getCurrentUserName)).subscribe(profile => {
              console.log("TEST");
            });
            this.store.pipe(select(getProfile)).subscribe(profile => {
              if (profile) {
                this.username = profile.username;
                if (profile.thumbnailPhoto.startsWith("data")) {
                  this.profileImage = profile.thumbnailPhoto;
                }
              }
            });
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
