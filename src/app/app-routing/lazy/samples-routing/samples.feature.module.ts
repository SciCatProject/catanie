import { NgModule } from "@angular/core";
import { SamplesModule } from "samples/samples.module";
import { SamplesRoutingModule } from "./samples.routing.module";

@NgModule({
  imports: [
    SamplesModule,
    SamplesRoutingModule
  ]
})
export class SamplesFeatureModule {}
