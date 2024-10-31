import { Injectable, Inject } from "@angular/core";
import { InternalStorage } from "./base.storage";
import { User } from "shared/sdk";

export interface AccessTokenInterface {
  id?: string;
  ttl?: number;
  scopes?: [string];
  created?: Date;
  userId?: string;
  user?: User;
}

export class SDKToken implements AccessTokenInterface {
  id: string = null;
  ttl: number = null;
  scopes: [string] = null;
  created: Date = null;
  userId: string = null;
  user: User = null;
  rememberMe: boolean = null;
  constructor(data?: AccessTokenInterface) {
    Object.assign(this, data);
  }
}

@Injectable()
export class AuthService {
  private token = new SDKToken();

  protected prefix = "";

  constructor(@Inject(InternalStorage) protected storage: InternalStorage) {
    // TODO: Test if all this works with the new changes and removal of any types
    this.token.id = this.load("id");
    this.token.user = JSON.parse(this.load("user") || null);
    this.token.userId = this.load("userId");
    this.token.created = new Date(this.load("created"));
    this.token.ttl = parseInt(this.load("ttl"));
    this.token.rememberMe = this.load("rememberMe") === "true";
  }

  protected load(prop: string) {
    return decodeURIComponent(this.storage.get(`${this.prefix}${prop}`));
  }

  protected persist(
    prop: string,
    value: string | User | number | Date | boolean,
    expires?: Date,
  ): void {
    try {
      this.storage.set(
        `${this.prefix}${prop}`,
        typeof value === "object" ? JSON.stringify(value) : value,
        this.token.rememberMe ? expires : null,
      );
    } catch (err) {
      throw new Error(
        `Cannot access local/session storage: ${JSON.stringify(err)}`,
      );
    }
  }

  public clear(): void {
    Object.keys(this.token).forEach((prop: string) =>
      this.storage.delete(`${this.prefix}${prop}`),
    );
    this.token = new SDKToken();
  }

  public setRememberMe(value: boolean): void {
    this.token.rememberMe = value;
  }

  public setUser(user: User) {
    this.token.user = user;
    this.save();
  }

  public setToken(token: SDKToken): void {
    this.token = Object.assign({}, this.token, token);
    this.save();
  }

  public getToken(): SDKToken {
    return <SDKToken>this.token;
  }

  public getAccessTokenId(): string {
    return this.token.id;
  }

  public getCurrentUserId() {
    return this.token.userId;
  }

  public getCurrentUserData() {
    return typeof this.token.user === "string"
      ? JSON.parse(this.token.user)
      : this.token.user;
  }

  public isAuthenticated() {
    return !(
      this.getCurrentUserId() === "" ||
      this.getCurrentUserId() == null ||
      this.getCurrentUserId() == "null"
    );
  }

  public save(): boolean {
    const today = new Date();
    const expires = new Date(today.getTime() + this.token.ttl * 1000);
    this.persist("id", this.token.id, expires);
    this.persist("user", this.token.user, expires);
    this.persist("userId", this.token.userId, expires);
    this.persist("created", this.token.created, expires);
    this.persist("ttl", this.token.ttl, expires);
    this.persist("rememberMe", this.token.rememberMe, expires);

    return true;
  }
}
