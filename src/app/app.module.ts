import { userReducer } from "state-management/reducers/user.reducer";
import { AppComponent } from "./app.component";
import { AppConfigModule } from "app-config.module";
import { AppRoutingModule, routes } from "app-routing/app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule, Title } from "@angular/platform-browser";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { ExtraOptions, RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { ApiModule, Configuration } from "@scicatproject/scicat-sdk-ts";
import { routerReducer } from "@ngrx/router-store";
import { extModules } from "./build-specifics";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { LayoutModule } from "_layout/layout.module";
import { AppConfigService } from "app-config.service";
import { AppThemeService } from "app-theme.service";
import { SnackbarInterceptor } from "shared/interceptors/snackbar.interceptor";
import { AuthService } from "shared/services/auth/auth.service";
import { InternalStorage, SDKStorage } from "shared/services/auth/base.storage";
import { CookieService } from "ngx-cookie-service";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { CustomTranslateLoader } from "shared/loaders/custom-translate.loader";

const appConfigInitializerFn = (appConfig: AppConfigService) => {
  return () => appConfig.loadAppConfig();
};

const appThemeInitializerFn = (appTheme: AppThemeService) => {
  return () => appTheme.loadTheme();
};

const apiConfigurationFn = (
  authService: AuthService,
  configurationService: AppConfigService,
) =>
  new Configuration({
    basePath: configurationService.getConfig().lbBaseURL,
    accessToken: authService.getToken().id,
  });

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppConfigModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [AppConfigService],
      },
    }),
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    LayoutModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    ApiModule,
    StoreModule.forRoot(
      { router: routerReducer, users: userReducer },
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false,
          strictStateSerializability: false,
          strictActionSerializability: false,
        },
      },
    ),
    extModules,
    RouterModule.forRoot(routes, {
      useHash: false,
    } as ExtraOptions),
    EffectsModule.forRoot([]),
  ],
  exports: [MatNativeDateModule],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigInitializerFn,
      multi: true,
      deps: [AppConfigService],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appThemeInitializerFn,
      multi: true,
      deps: [AppThemeService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SnackbarInterceptor,
      multi: true,
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: "dynamic",
      },
    },
    AuthService,
    AppThemeService,
    Title,
    MatNativeDateModule,
    { provide: InternalStorage, useClass: CookieService },
    { provide: SDKStorage, useClass: CookieService },
    {
      provide: Configuration,
      useFactory: apiConfigurationFn,
      deps: [AuthService, AppConfigService],
      multi: false,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
