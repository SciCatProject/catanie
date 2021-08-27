import { NgModule } from "@angular/core";
import { HelpRoutingModule } from "./help.routing.module";
import { HelpModule } from "help/help.module";

@NgModule({
  imports: [
    HelpModule,
    HelpRoutingModule
  ]
})
export class HelpFeatureModule {}
