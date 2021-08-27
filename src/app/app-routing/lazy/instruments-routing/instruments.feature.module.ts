import { NgModule } from "@angular/core";
import { InstrumentsModule } from "instruments/instruments.module";
import { InstrumentsRoutingModule } from "./instruments.routing.module";

@NgModule({
  imports: [
    InstrumentsModule,
    InstrumentsRoutingModule
  ]
})
export class InstrumentsFeatureModule {}
