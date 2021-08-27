import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { ProposalDashboardNewComponent } from "proposals/proposal-dashboard-new/proposal-dashboard-new.component";
import { ViewProposalPageComponent } from "proposals/view-proposal-page/view-proposal-page.component";

const routes: Routes = [

  {
    path: "",
    component: ProposalDashboardNewComponent,
    canActivate: [AuthGuard],
  },
  // Can we remove this?
  // {
  //   path: "old",
  //   component: ProposalDashboardComponent,
  //   canActivate: [AuthGuard],
  // },
  {
    path: ":id",
    component: ViewProposalPageComponent,
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalsRoutingModule {}
