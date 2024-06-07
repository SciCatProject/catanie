import { NO_ERRORS_SCHEMA } from "@angular/core";
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Store, StoreModule } from "@ngrx/store";
import { MockStore } from "shared/MockStubs";
import { AppConfigService } from "app-config.service";

import { UserSettingsComponent } from "./user-settings.component";
import { SharedScicatFrontendModule } from "shared/shared.module";
import { Message, MessageType } from "state-management/models";
import { showMessageAction } from "state-management/actions/user.actions";
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";

describe("UserSettingsComponent", () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;

  let store: MockStore;
  let dispatchSpy;

  const getConfig = () => ({});

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FlexLayoutModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        SharedScicatFrontendModule,
        StoreModule.forRoot({}),
      ],
      declarations: [UserSettingsComponent],
    });
    TestBed.overrideComponent(UserSettingsComponent, {
      set: {
        providers: [{ provide: AppConfigService, useValue: { getConfig } }],
      },
    });
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([Store], (mockStore: MockStore) => {
    store = mockStore;
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#onCopy()", () => {
    it("should copy the token to the users clipboard and dispatch a showMessageAction", () => {
      const commandSpy = spyOn(document, "execCommand");
      dispatchSpy = spyOn(store, "dispatch");

      const message = new Message(
        "SciCat token has been copied to your clipboard",
        MessageType.Success,
        5000,
      );

      component.onCopy("test");

      expect(commandSpy).toHaveBeenCalledTimes(1);
      expect(commandSpy).toHaveBeenCalledWith("copy");
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(showMessageAction({ message }));
    });
  });
});
