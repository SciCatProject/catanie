import { NgModule } from "@angular/core";
import { PoliciesModule } from "policies/policies.module";
import { PoliciesRoutingModule } from "./policies.routing.module";

@NgModule({
  imports: [
    PoliciesModule,
    PoliciesRoutingModule
  ]
})
export class PoliciesFeatureModule {}
