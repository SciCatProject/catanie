import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppHeaderComponent } from "./app-header/app-header.component";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { AnonymousLayoutComponent } from "./anonymous-layout/anonymous-layout.component";
import { AppLayoutComponent } from "./app-layout/app-layout.component";
import { LoginHeaderComponent } from "./login-header/login-header.component";
import { LoginLayoutComponent } from "./login-layout/login-layout.component";
import { BatchCardModule } from "datasets/batch-card/batch-card.module";
import { BreadcrumbModule } from "shared/modules/breadcrumb/breadcrumb.module";

@NgModule({
  declarations: [
    AnonymousLayoutComponent,
    AppHeaderComponent,
    AppLayoutComponent,
    LoginHeaderComponent,
    LoginLayoutComponent
  ],
  imports: [
    CommonModule,
    BatchCardModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    RouterModule,
    BreadcrumbModule
  ],
  exports: []
})
export class LayoutModule {}
