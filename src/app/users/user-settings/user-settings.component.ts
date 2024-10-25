import { Component, OnInit, Inject } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  showMessageAction,
  fetchCurrentUserAction,
  fetchScicatTokenAction,
} from "state-management/actions/user.actions";
import { Message, MessageType } from "state-management/models";
import {
  selectIsAdmin,
  selectUserSettingsPageViewModel,
} from "state-management/selectors/user.selectors";
import { DOCUMENT } from "@angular/common";
import packageJson from "../../../../package.json";
import { AppConfigService } from "app-config.service";

@Component({
  selector: "app-user-settings",
  templateUrl: "./user-settings.component.html",
  styleUrls: ["./user-settings.component.scss"],
})
export class UserSettingsComponent implements OnInit {
  vm$ = this.store.select(selectUserSettingsPageViewModel);
  isAdmin$ = this.store.select(selectIsAdmin);
  appVersion: string | undefined = packageJson.version;
  appConfig = this.appConfigService.getConfig();
  tokenValue: string;
  showMore = true;
  showConfig = {
    //TODO backend settings to be implemented
    frontend: true,
    backend: true,
  };

  constructor(
    public appConfigService: AppConfigService,
    @Inject(DOCUMENT) private document: Document,
    private store: Store,
  ) {
    // TODO handle service and endpoint for user settings
  }

  ngOnInit() {
    this.vm$.subscribe(
      (settings) =>
        (this.tokenValue = settings.scicatToken.replace("Bearer ", "")),
    );

    this.store.dispatch(fetchCurrentUserAction());
    this.store.dispatch(fetchScicatTokenAction());
  }

  onCopy(token: string) {
    const selectionBox = this.document.createElement("textarea");
    selectionBox.style.position = "fixed";
    selectionBox.style.left = "0";
    selectionBox.style.top = "0";
    selectionBox.style.opacity = "0";
    selectionBox.value = token;
    this.document.body.appendChild(selectionBox);
    selectionBox.focus();
    selectionBox.select();
    this.document.execCommand("copy");
    this.document.body.removeChild(selectionBox);

    const message = new Message(
      "SciCat token has been copied to your clipboard",
      MessageType.Success,
      5000,
    );
    this.store.dispatch(showMessageAction({ message }));
  }
  toggleShowConfig(event: MouseEvent | KeyboardEvent, config: string) {
    const isMouseEvent = event instanceof MouseEvent;
    const isKeyboardEvent =
      event instanceof KeyboardEvent &&
      (event.key === "Enter" || event.key === " ");

    if (isMouseEvent || isKeyboardEvent) {
      if (config === "frontend") {
        this.showConfig.frontend = !this.showConfig.frontend;
      } else {
        this.showConfig.backend = !this.showConfig.backend;
      }

      if (isKeyboardEvent) {
        event.preventDefault();
      }
    }
  }

  toggleShowMore(event: MouseEvent | KeyboardEvent) {
    const isMouseEvent = event instanceof MouseEvent;
    const isKeyboardEvent =
      event instanceof KeyboardEvent &&
      (event.key === "Enter" || event.key === " ");

    if (isMouseEvent || isKeyboardEvent) {
      this.showMore = !this.showMore;
      if (isKeyboardEvent) {
        event.preventDefault();
      }
    }
  }
}
