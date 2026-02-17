import { ContentAnalyzerService } from './content-analyzer.service';

describe('ContentAnalyzerService', () => {
  let service: ContentAnalyzerService;

  beforeEach(() => {
    service = new ContentAnalyzerService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('containsRestrictedContent', () => {
    // Email detection
    it('should detect an email address', () => {
      expect(
        service.containsRestrictedContent('Contact me at user@example.com'),
      ).toBe(true);
    });

    it('should detect an email with subdomains', () => {
      expect(
        service.containsRestrictedContent('Send to test@mail.example.co.uk'),
      ).toBe(true);
    });

    // Phone number detection (French formats)
    it('should detect a French phone number with spaces', () => {
      expect(
        service.containsRestrictedContent('Appelez-moi au 06 12 34 56 78'),
      ).toBe(true);
    });

    it('should detect a French phone number with dots', () => {
      expect(service.containsRestrictedContent('Tel: 06.12.34.56.78')).toBe(
        true,
      );
    });

    it('should detect a French phone number with dashes', () => {
      expect(service.containsRestrictedContent('Tel: 06-12-34-56-78')).toBe(
        true,
      );
    });

    it('should detect a French phone number with +33 prefix', () => {
      expect(service.containsRestrictedContent('Call +33 6 12 34 56 78')).toBe(
        true,
      );
    });

    it('should detect a French phone number with 0033 prefix', () => {
      expect(service.containsRestrictedContent('Call 0033 6 12 34 56 78')).toBe(
        true,
      );
    });

    // Clean content
    it('should return false for clean text', () => {
      expect(
        service.containsRestrictedContent(
          'A beautiful vintage lamp in great condition',
        ),
      ).toBe(false);
    });

    it('should return false for text with numbers that are not phone numbers', () => {
      expect(
        service.containsRestrictedContent(
          'Price is 1500 euros, item ref 123456',
        ),
      ).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.containsRestrictedContent('')).toBe(false);
    });

    // Both email and phone
    it('should detect text containing both email and phone', () => {
      expect(
        service.containsRestrictedContent(
          'Email: a@b.com or call 06 12 34 56 78',
        ),
      ).toBe(true);
    });
  });
});
