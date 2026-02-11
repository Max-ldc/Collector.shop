import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentAnalyzerService {
    private readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}/;
    // Simple phone regex (basic international or local patterns)
    private readonly phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/;

    containsRestrictedContent(text: string): boolean {
        return this.emailRegex.test(text) || this.phoneRegex.test(text);
    }
}
