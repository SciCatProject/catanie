import { NgModule } from "@angular/core";
import { AboutRoutingModule } from "./about.routing.module";
import { AboutModule } from "about/about.module";

@NgModule({
  imports: [
    AboutModule,
    AboutRoutingModule
  ]
})
export class AboutFeatureModule {}
