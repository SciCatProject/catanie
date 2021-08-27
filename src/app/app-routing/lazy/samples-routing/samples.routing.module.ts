import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { SampleDashboardComponent } from "samples/sample-dashboard/sample-dashboard.component";
import { SampleDetailComponent } from "samples/sample-detail/sample-detail.component";

const routes: Routes = [

  {
    path: "",
    component: SampleDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ":id",
    component: SampleDetailComponent,
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SamplesRoutingModule { }
