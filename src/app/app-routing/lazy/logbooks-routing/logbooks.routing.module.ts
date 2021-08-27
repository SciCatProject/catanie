import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "app-routing/auth.guard";
import { LogbookGuard } from "app-routing/logbook.guard";
import { LogbooksDashboardComponent } from "logbooks/logbooks-dashboard/logbooks-dashboard.component";
import { LogbooksTableComponent } from "logbooks/logbooks-table/logbooks-table.component";


const routes: Routes = [

  {
    path: "",
    component: LogbooksTableComponent,
    canActivate: [AuthGuard, LogbookGuard],
  },
  {
    path: ":name",
    component: LogbooksDashboardComponent,
    canActivate: [AuthGuard, LogbookGuard],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogbooksRoutingModule {}
