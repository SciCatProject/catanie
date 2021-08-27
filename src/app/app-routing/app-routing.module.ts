import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ErrorPageComponent } from "shared/modules/error-page/error-page.component";
import { LoginLayoutComponent } from "_layout/login-layout/login-layout.component";
import { AppLayoutComponent } from "_layout/app-layout/app-layout.component";
import { AnonymousLayoutComponent } from "_layout/anonymous-layout/anonymous-layout.component";

export const routes: Routes = [
  {
    path: "",
    component: AnonymousLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "anonymous/datasets",
        pathMatch: "full",
      },
      {
        path: "anonymous/datasets",
        loadChildren: () => import("./lazy/public-datasets-routing/public-datasets.feature.module").then( m => m.PublicDatasetsFeatureModule)
      },
      {
        path: "anonymous/about",
        loadChildren: () => import("./lazy/about-routing/about.feature.module").then( m => m.AboutFeatureModule)
      },
      {
        path: "anonymous/help",
        loadChildren: () => import("./lazy/help-routing/help.feature.module").then( m => m.HelpFeatureModule)
      },
    ],
  },
  {
    path: "",
    component: LoginLayoutComponent,
    children: [
      { path: "", redirectTo: "/login", pathMatch: "full" },
      {
        path: "login",
        loadChildren: () => import("./lazy/login-routing/login.feature.module").then( m => m.LoginFeatureModule)
      },
    ],
  },
  {
    path: "",
    component: AppLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "/datasets",
        pathMatch: "full",
      },
      {
        path: "datasets",
        loadChildren: () => import("./lazy/private-datasets-routing/private-datasets.feature.module").then( m  => m.PrivateDatasetsFeatureModule)
      },
      {
        path: "files",
        loadChildren: () => import("./lazy/file-routing/file.feature.module").then( m => m.FileFeatureModule)
      },
      {
        path: "instruments",
        loadChildren: () => import("./lazy/instruments-routing/instruments.feature.module").then( m => m.InstrumentsFeatureModule)
      },
      {
        path: "proposals",
        loadChildren: () => import("./lazy/proposal-routing/proposal.feature.module").then( m => m.ProposalFeatureModule)
      },
      {
        path: "publishedDatasets",
        loadChildren: () => import("./lazy/publisheddata-routing/publisheddata.feature.module").then( m => m.PublisheddataFeatureModule)
      },
      {
        path: "samples",
        loadChildren: () => import("./lazy/samples-routing/samples.feature.module").then( m => m.SamplesFeatureModule)
      },
      {
        path: "policies",
        loadChildren: () => import("./lazy/policies-routing/policies.feature.module").then( m => m.PoliciesFeatureModule)
      },

      {
        path: "user",
        loadChildren: () => import("./lazy/user-routing/user.feature.module").then( m => m.UsersFeatureModule)
      },
      {
        path: "about",
        loadChildren: () => import("./lazy/about-routing/about.feature.module").then( m => m.AboutFeatureModule)
      },
      {
        path: "help",
        loadChildren: () => import("./lazy/help-routing/help.feature.module").then( m => m.HelpFeatureModule)
      },
      {
        path: "logbooks",
        loadChildren: () => import("./lazy/logbooks-routing/logbooks.feature.module").then( m => m.LogbooksFeatureModule)
      },
      {
        path: "error",
        component: ErrorPageComponent,
        data: { errorTitle: "Location Not Found"},
      },
      {
        path: "404",
        component: ErrorPageComponent,
        data: { errorTitle: "404 Page not found" , message: "Sorry, the page you are trying to view doesn't exist"}
      },
    ],
  },
  {
    path: "**",
    pathMatch: "full",
    redirectTo: "/404",
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {
  constructor() {}
}
