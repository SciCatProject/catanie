import { Injectable } from "@angular/core";
import {DateTime} from "luxon";

@Injectable({
  providedIn: "root"
})
export class DateTimeService {
  isValidDateTime(input: string | Date){
    if (!input) {
      return false;
    }
    if (typeof input === "string"){
      return (
        DateTime.fromFormat(input, "yyyy-MM-dd").isValid ||
        DateTime.fromFormat(input, "yyyy-MM-dd HH:mm").isValid ||
        DateTime.fromFormat(input, "yyyy-MM-dd HH:mm:ss").isValid ||
        this.isISODateTime(input)
      );
    }
    return DateTime.fromJSDate(input).isValid;
  }
  isISODateTime(input: string){
    if (!input) {
      return false;
    }
    const regex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/g;
    if(input.match(regex) && DateTime.fromISO(input).isValid){
      return true;
    }
    return false;
  }
}
