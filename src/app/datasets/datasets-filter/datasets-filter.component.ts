import 'rxjs/add/operator/take';

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OutputSelector, createSelector} from 'reselect';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AutoComplete, Tree} from 'primeng/primeng';
import * as utils from 'shared/utils';
import * as dsa from 'state-management/actions/datasets.actions';
import * as dStore from 'state-management/state/datasets.store';
import {DatepickerState, SelectionModes} from 'shared/modules/datepicker/datepicker.reducer';
import TimeRange from 'shared/modules/datepicker/LocalizedDateTime/TimeRange';

@Component({
  selector : 'datasets-filter',
  templateUrl : './datasets-filter.component.html',
  styleUrls : [ './datasets-filter.component.css' ]
})
export class DatasetsFilterComponent implements OnInit, OnDestroy {
  @ViewChild('datetree') dateTree: Tree;
  @ViewChild('loc') locField: AutoComplete;
  @ViewChild('grp') grpField: AutoComplete;

  datepickerSelector: OutputSelector<any, DatepickerState, (res: any) => DatepickerState>;
  dateSelectionMode = SelectionModes.range;

  // @Input() datasets: Array<any> = [];
  facets: Array<any> = [];
  months = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  startDate: Date;
  endDate: Date;
  resultCount$;
  dates = [];

  dateFacet = [];

  location: {};
  locations = [];
  filteredLocations = [];

  group: {};
  groups = [];
  selectedGroups = [];
  filteredGroups = [];

  filters = dStore.initialDatasetState.activeFilters;
  filterValues;

  subscriptions = [];

  constructor(private store: Store<any>, private route: ActivatedRoute,
              private router: Router) {}

  /**
   * Load locations and ownergroups on start up and
   * only use unique values
   */
  ngOnInit() {
    const datasetsStoreSlicePath = ['root', 'datasets'];
    const datasetsSelector = createSelector(
      (state: any) : any => {
        return datasetsStoreSlicePath.reduce((obj: any, sliceKey: any) => obj[sliceKey], state);
      },
      (selectedDatasets: any) : any => selectedDatasets);

    this.datepickerSelector = createSelector(
      datasetsSelector,
      (selectedDatasets: any) : DatepickerState => selectedDatasets['datepicker']);

    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      let newParams = Object.assign({}, params);
      delete newParams['mode'];
      this.store.select(state => state.root.datasets.activeFilters)
          .take(1)
          .subscribe(filters => {
            const f = utils.filter(filters, newParams);
            console.log(f);
            this.location = f['creationLocation']
                                ? {_id : filters['creationLocation']}
                                : '';
            if (f['groups'] && f['groups'] && Array.isArray(f['groups']) && f['groups'].length > 0) {
              this.selectedGroups =
                  f['groups'].map(x => { return {_id : x}; });
            } else if (f['groups'] && !Array.isArray(f['groups'])) {
              this.selectedGroups = [{'_id': f['groups']}];
            } else {
              this.selectedGroups= [];
            }
            if (utils.compareObj(newParams, f)) {
              this.router.navigate(
                  [ '/datasets' ],
                  {queryParams : newParams, replaceUrl : true});
            }
            this.store.dispatch({type : dsa.FILTER_UPDATE, payload : f});
          });
    }));
    this.subscriptions.push(
        this.store.select(state => state.root.datasets.activeFilters)
            .subscribe(data => {
              this.filters = Object.assign({}, this.route.snapshot.queryParams, data);
              // this.router.navigate(
              //     [ '/datasets' ],
              //     {queryParams : this.filters});
            }));
    this.resultCount$ =
        this.store.select(state => state.root.datasets.totalSets);
    this.subscriptions.push(
        this.store.select(state => state.root.datasets.filterValues)
            .subscribe(values => {
              this.filterValues = Object.assign({}, values);
              if (this.filterValues) {
                if (this.filterValues['locations'] !== null) {
                  this.locations = this.filterValues['locations']
                                       ? this.filterValues['locations']
                                       : [];
                  const totalSets = this.locations.reduce(
                      (sum, value) => sum + value['count'], 0);
                  this.store.dispatch(
                      {type : dsa.TOTAL_UPDATE, payload : totalSets});
                  }

                if (this.groups.length === 0 &&
                    this.filterValues['groups'] !== null) {
                  this.groups = this.filterValues['groups'];
                }
              }
            }));
  }

  /**
   *
   * @param timeranges
   */
  updateDateRange(timeranges: TimeRange[]) {
    let startDate: Date = null;
    let endDate: Date = null;
    const selectedRange: TimeRange = timeranges[0];
    if (selectedRange != null) {
      startDate = selectedRange.datePair[0];
      endDate = selectedRange.datePair[1];
    }
    if ((startDate instanceof Date) && (endDate instanceof Date)) {
      this.filters.startDate = new Date(startDate.getTime());
      this.filters.endDate = new Date(endDate.getTime());
    }
    this.store.dispatch({type : dsa.FILTER_UPDATE, payload : this.filters});
  }

  ngOnDestroy() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe();
    }
  }

  /**
   * Handles search queries for the creation
   * location dropdown, this links to a mongo filter query
   * @param {any} event
   * @memberof DatasetsFilterComponent
   */
  handleInputLocation(event) {
    this.filteredLocations =
        this.filterDatasets(event.query, 'creationLocation');
  }

  /**
   * Could be combined with above and handled based on event but
   * complicated to access source element through event
   * @param {any} event
   * @memberof DatasetsFilterComponent
   */
  handleInputOwner(event) {
    this.filteredGroups = this.filterDatasets(event.query, 'ownerGroup');
  }

  /**
   * Handles the event of the ngModel changing
   * Linked to both autocomplete values. Currently re runs the search when they
   * are cleared
   * @param {any} event
   * @memberof DatasetsFilterComponent
   */
  textValueChanged(event, key) {
    if (event.length === 0) {
      this.filters[key] = null;
    } else if (event.length >= 4) {
      if (key === 'groups') {
        this.filters[key] = [ event ];
      } else {
        this.filters[key] = event;
      }
    }
    // TODO handle text values changing
    // TODO debounce time needs to be here even though it is in the effects?
    // this.store.dispatch({type : dsa.FILTER_UPDATE, payload : this.filters});
  }
  /**
   * Creates a filtered array based
   * on provided search term that matches the given key
   * @param {any} query
   * @param {any} key
   * @returns
   * @memberof DatasetsFilterComponent
   */
  filterDatasets(query, key) {
    const filtered = [];
    const array = key === 'creationLocation' ? this.locations : this.groups;
    if (array) {
      for (let i = 0; i < array.length; i++) {
        const loc = typeof array[i] === 'object' && !('_id' in array[i])
                        ? array[i]
                        : array[i]['_id'];
        if (loc && loc.toLowerCase().indexOf(query.toLowerCase()) === 0 &&
            filtered.indexOf(loc) === -1) {
          filtered.push(array[i]);
        }
      }
      }
    return filtered;
  }

  /**
   * Handle clicking of available locations
   */
  locSelected() {
    this.filters.creationLocation = this.location['_id'];
    // this.store.dispatch(
    //     {type : dua.SAVE, payload : {beamlineText : this.location}});
    this.store.dispatch({type : dsa.FILTER_UPDATE, payload : this.filters});
  }

  /**
   * Handle clicking of available groups (contains ANOTHER primeng hack to wait
   * for array to be cleared
   * since this is called before that happens)
   */
  groupSelected(event) {
    setTimeout(() => {
      this.filters.groups = this.selectedGroups.map(x => { return x['_id']; });
      this.store.dispatch({type : dsa.FILTER_UPDATE, payload : this.filters});
    }, 400);
  }

  /**
   * Clear the filters and reset the user groups (when not a functional account)
   */
  clearFacets() {
    this.dates = [];
    this.location = undefined;
    this.group = undefined;

    // YES, another primeng hack to clear the field
    this.grpField.value = [];
    this.selectedGroups.map(x => { this.grpField.removeItem(x); });

    // TODO clearing this does not visually clear (although it is removed from
    // the array)
    this.selectedGroups = [];
    this.locField.value = '';
    this.grpField.value = '';
    this.filters = dStore.initialDatasetState.activeFilters;
    this.store.select(state => state.root.user.currentUserGroups)
        .take(1)
        .subscribe(groups => { this.filters.groups = groups; });
    this.filterValues = dStore.initialDatasetState.filterValues;
    this.filterValues.text = '';
    // this.store.dispatch({ type: dsa.FILTER_UPDATE, payload: this.filters });
    this.store.dispatch(
        {type : dsa.FILTER_VALUE_UPDATE, payload : this.filterValues});
    // this.store.dispatch({
    //   type: dua.SAVE,
    //   payload: dUIStore.initialDashboardUIState
    // });
    let m;
    this.store.select(state => state.root.dashboardUI.mode)
        .take(1)
        .subscribe(mode => (m = mode));
    const currentParams = this.route.snapshot.queryParams;
    this.router.navigate([ '/datasets' ], {
      queryParams :
          Object.assign({}, currentParams, this.filters, {mode : m})
    });
    // TODO clear selected sets
  }

  /**
   * Handle the dropdown click to show
   * a list of locations
   * @param {any} event
   * @memberof DatasetsFilterComponent
   */
  handleDropClick(event) {
    // TODO handle selected item
    console.log(event);
  }
}
