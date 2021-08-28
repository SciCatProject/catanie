import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "StripProposalPrefix"
})
export class StripProposalPrefixPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return "";
    }
    //Proposal might be of other type than string
    return String(value).replace(/proposal-/i, "");
  }
}
