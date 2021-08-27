import { userReducer } from "state-management/reducers/user.reducer";
import { AppComponent } from "./app.component";
import { AppConfigModule } from "app-config.module";
import { AppRoutingModule, routes } from "app-routing/app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule, Title } from "@angular/platform-browser";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SampleApi, SDKBrowserModule } from "shared/sdk/index";
import { StoreModule } from "@ngrx/store";
import { UserApi } from "shared/sdk/services";
import { routerReducer } from "@ngrx/router-store";
import { extModules } from "./build-specifics";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { LayoutModule } from "_layout/layout.module";
@NgModule({
  declarations: [AppComponent],
  imports: [
    AppConfigModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    LayoutModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SDKBrowserModule.forRoot(),
    StoreModule.forRoot(
      { router: routerReducer, users: userReducer },
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false,
          strictStateSerializability: false,
          strictActionSerializability: false,
        },
      }
    ),
    extModules,
    RouterModule.forRoot(routes, {
      useHash: false,
      relativeLinkResolution: "legacy",
    }),
    EffectsModule.forRoot([]),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  exports: [MatNativeDateModule],
  providers: [UserApi, SampleApi, Title, MatNativeDateModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
