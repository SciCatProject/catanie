import { NgModule } from "@angular/core";
import { DatasetsModule } from "datasets/datasets.module";
import { PublicDatasetsRoutingModule } from "./public-datasets.routing.module";

@NgModule({
  imports: [
    DatasetsModule,
    PublicDatasetsRoutingModule
  ]
})
export class PublicDatasetsFeatureModule {}
