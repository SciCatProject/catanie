import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { InstrumentDetailsComponent } from "instruments/instrument-details/instrument-details.component";
import { InstrumentsDashboardComponent } from "instruments/instruments-dashboard/instruments-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: InstrumentsDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ":id",
    component: InstrumentDetailsComponent,
    canActivate: [AuthGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstrumentsRoutingModule {}
