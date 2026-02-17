import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentAnalyzerService {
  // Bounded quantifiers to prevent super-linear backtracking (ReDoS-safe)
  private readonly emailRegex =
    /[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9-]{1,63}\.[a-zA-Z]{2,63}/;
  // Simple phone regex (basic international or local patterns)
  private readonly phoneRegex =
    /(?:(?:\+|00)33|0)\s{0,3}[1-9](?:[\s.-]{0,3}\d{2}){4}/;

  containsRestrictedContent(text: string): boolean {
    return this.emailRegex.test(text) || this.phoneRegex.test(text);
  }
}
