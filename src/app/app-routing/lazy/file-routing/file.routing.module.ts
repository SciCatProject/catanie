import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { FilesDashboardComponent } from "files/files-dashboard/files-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: FilesDashboardComponent,
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesRoutingModule {}
