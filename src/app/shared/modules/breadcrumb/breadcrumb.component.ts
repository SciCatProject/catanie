import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd, Params } from "@angular/router";
import { Store, select } from "@ngrx/store";

import {
  getArchiveViewMode,
  getFilters,
} from "state-management/selectors/datasets.selectors";
import { take, filter, map } from "rxjs/operators";
import { TitleCasePipe } from "shared/pipes/title-case.pipe";
import { ArchViewMode } from "state-management/models";

interface Breadcrumb {
  label: string;
  path: string;
  params: Params;
  url: string;
  fallback: string;
}

/**
 * Generates a `breadcrumb` from the URL pattern
 * Does not require a service and only uses activated route
 * @export
 * @class BreadcrumbComponent
 * @implements {OnInit}
 */
@Component({
  selector: "breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["breadcrumb.component.scss"],
})
export class BreadcrumbComponent implements OnInit {
  // partially based on: http://brianflove.com/2016/10/23/angular2-breadcrumb-using-router/
  breadcrumbs: Breadcrumb[] = [];

  // TODO: make a proper selector from this.
  // TODO: first, figure out how the NgRX connected router state works.
  // the below selection makes sure a string reaches the last map() by providing fallback values
  // all along the way.
  public shouldDisplay$ = this.store.pipe(
    select((state) => state["router"] || {}),
    select((router) => router["state"] || {}),
    select((state) => state["url"] || ""),
    select((url) => url.split("?")[0]),
    map((path) => path !== "/datasets")
  );

  constructor(
    private store: Store<any>,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Set initial breadcrumb
    this.setBreadcrumbs();
    // Update breadcrumb when navigating to child routes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.setBreadcrumbs();
      });
  }

  /**
   * Creates breadcrumbs from route and pushes them to breadcrumbs array
   * @memberof BreadcrumbComponent
   */
  setBreadcrumbs(): void {
    this.breadcrumbs = [];
    const children = this.route.children.reduce<ActivatedRoute[]>((accumulator, child) => {
      accumulator.push(child, ...child.children);
      return accumulator;
    }, []);
    children.forEach((root) => {
      let param: string;
      Object.keys(root.snapshot.params).forEach((key) => {
        param = root.snapshot.params[key];
      });
      root.snapshot.url.forEach((url) => {
        const crumb: Breadcrumb = {
          label: this.sanitise(url.path, param),
          path: url.path,
          params: url.parameters,
          url: "/" + encodeURIComponent(url.path),
          fallback: "/" + encodeURIComponent(url.path + "s"),
        };
        this.breadcrumbs.push(crumb);
      });
    });
  }

  /**
   * Clean text for easy reading
   * of path info (capitalise, strip chars etc)
   * @param {string} path
   * @returns Sanitised path for breadcrumb label
   * @memberof BreadcrumbComponent
   */
  sanitise(path: string, param: string): string {
    path = path.replace(new RegExp("_", "g"), " ");
    if (path !== param) {
      path = new TitleCasePipe().transform(path);
    }
    return path;
  }

  /**
   * Handles navigation for a click on a crumb
   * Fallsback to pluralised version of the page if there is an error
   * @example dataset -> Datasets
   * @param {number} index
   * @param {Breadcrumb} crumb
   * @memberof BreadcrumbComponent
   */
  crumbClick(index: number, crumb: Breadcrumb): void {
    let url = "";
    for (let i = 0; i < index; i++) {
      url += this.breadcrumbs[i].url;
    }
    // this catches errors and redirects to the fallback, this could/should be set in the routing module?
    if (crumb.fallback === "/datasets") {
      this.store.pipe(select(getFilters), take(1)).subscribe((filters) => {
        this.store
          .pipe(select(getArchiveViewMode), take(1))
          .subscribe((currentMode) => {
            filters["mode"] = setMode(currentMode);
            this.router.navigate(["/datasets"], {
              queryParams: { args: JSON.stringify(filters) },
            });
          });
      });
    } else {
      this.router
        .navigateByUrl(url + crumb.url)
        .catch((error) => this.router.navigateByUrl(url + crumb.fallback));
    }
    // });
  }
}

const setMode = (modeToggle: ArchViewMode) => {
  switch (modeToggle) {
    case ArchViewMode.all:
      return {};
    case ArchViewMode.archivable:
      return {
        "datasetlifecycle.archivable": true,
        "datasetlifecycle.retrievable": false,
      };
    case ArchViewMode.retrievable:
      return {
        "datasetlifecycle.retrievable": true,
        "datasetlifecycle.archivable": false,
      };
    case ArchViewMode.work_in_progress:
      return {
        $or: [
          {
            "datasetlifecycle.retrievable": false,
            "datasetlifecycle.archivable": false,
            "datasetlifecycle.archiveStatusMessage": {
              $ne: "scheduleArchiveJobFailed",
            },
            "datasetlifecycle.retrieveStatusMessage": {
              $ne: "scheduleRetrieveJobFailed",
            },
          },
        ],
      };
    case ArchViewMode.system_error:
      return {
        $or: [
          {
            "datasetlifecycle.retrievable": true,
            "datasetlifecycle.archivable": true,
          },
          {
            "datasetlifecycle.archiveStatusMessage": "scheduleArchiveJobFailed",
          },
          {
            "datasetlifecycle.retrieveStatusMessage":
              "scheduleRetrieveJobFailed",
          },
        ],
      };
    case ArchViewMode.user_error:
      return {
        $or: [
          {
            "datasetlifecycle.archiveStatusMessage": "missingFilesError",
          },
        ],
      };
    default: {
      return {};
    }
  }
};
