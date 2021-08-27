import { NgModule } from "@angular/core";
import { PublisheddataModule } from "publisheddata/publisheddata.module";
import { PublisheddataRoutingModule } from "./publisheddata.routing.module";

@NgModule({
  imports: [
    PublisheddataModule,
    PublisheddataRoutingModule
  ]
})
export class PublisheddataFeatureModule {}
