import { NgModule } from "@angular/core";
import { LogbooksModule } from "logbooks/logbooks.module";
import { LogbooksRoutingModule } from "./logbooks.routing.module";

@NgModule({
  imports: [
    LogbooksModule,
    LogbooksRoutingModule
  ]
})
export class LogbooksFeatureModule {}
