import { NgModule } from "@angular/core";
import { FilesModule } from "files/files.module";
import { FilesRoutingModule } from "./file.routing.module";

@NgModule({
  imports: [
    FilesModule,
    FilesRoutingModule
  ]
})
export class FileFeatureModule {}
