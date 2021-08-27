import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AppMainLayoutComponent } from "./app-main-layout.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { BreadcrumbModule } from "shared/modules/breadcrumb/breadcrumb.module";
import { AppHeaderComponent } from "_layout/app-header/app-header.component";
import { RouterTestingModule } from "@angular/router/testing";
import {MatMenuModule} from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { APP_CONFIG } from "app-config.module";
import { MockStore, MockActivatedRoute, MockRouter } from "shared/MockStubs";

describe("AppMainLayoutComponent", () => {
  let component: AppMainLayoutComponent;
  let fixture: ComponentFixture<AppMainLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [AppMainLayoutComponent, AppHeaderComponent],
      imports: [
        BreadcrumbModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule
      ]
    });
    TestBed.overrideComponent(AppHeaderComponent, {
      set: {
        providers: [{ provide: APP_CONFIG, useValue: { facility: "ESS" } }]
      }
    });
    TestBed.overrideComponent(AppMainLayoutComponent, {
      set: {
        providers: [
          { provide: Store, useClass: MockStore },
          { provide: ActivatedRoute, useClass: MockActivatedRoute },
          { provide: Router, useClass: MockRouter }
        ]
      }
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
