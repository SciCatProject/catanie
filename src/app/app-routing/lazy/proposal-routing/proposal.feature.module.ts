import { NgModule } from "@angular/core";
import { ProposalsModule } from "proposals/proposals.module";
import { ProposalsRoutingModule } from "./proposal.routing.module";

@NgModule({
  imports: [
    ProposalsModule,
    ProposalsRoutingModule
  ]
})
export class ProposalFeatureModule {}
