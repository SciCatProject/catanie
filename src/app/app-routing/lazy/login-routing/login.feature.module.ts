import { NgModule } from "@angular/core";
import { UsersModule } from "users/users.module";
import { LoginRoutingModule } from "./login.routing.module";

@NgModule({
  imports: [
    UsersModule,
    LoginRoutingModule
  ]
})
export class LoginFeatureModule {}
