import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HelpComponent } from "help/help/help.component";

const routes: Routes = [
  {
    path: "",
    component: HelpComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule {}
