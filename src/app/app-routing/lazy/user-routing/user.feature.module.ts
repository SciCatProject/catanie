import { NgModule } from "@angular/core";
import { JobsModule } from "jobs/jobs.module";
import { UsersModule } from "users/users.module";
import { UsersRoutingModule } from "./user.routing.module";

@NgModule({
  imports: [
    UsersModule,
    JobsModule,
    UsersRoutingModule
  ]
})
export class UsersFeatureModule {}
