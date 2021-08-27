import { NgModule } from "@angular/core";
import { DatasetsModule } from "datasets/datasets.module";
import { PrivateDatasetsRoutingModule } from "./private-datasets.routing.module";
@NgModule({
  imports: [
    DatasetsModule,
    PrivateDatasetsRoutingModule
  ]
})
export class PrivateDatasetsFeatureModule {}
