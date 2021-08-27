import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { PoliciesGuard } from "app-routing/policies.guard";
import { PoliciesDashboardComponent } from "policies/policies-dashboard/policies-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: PoliciesDashboardComponent,
    canActivate: [AuthGuard, PoliciesGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PoliciesRoutingModule {}
