/**
 * PII Detection & Privacy Enforcement
 * Scans user input for personally identifiable information
 */

/**
 * Regex patterns to detect PII in user queries
 * These are intentionally conservative (high sensitivity, lower specificity)
 * to err on the side of blocking potentially sensitive information
 */
const PII_PATTERNS = [
  // Student identifiers with context
  /\b(student|child|kid|pupil|learner)\b.*\b(name|id|identifier|ssn|social)\b/i,
  
  // IEP numbers
  /\bIEP\s*#?\d{3,}/i,
  
  // Social Security Numbers
  /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/,
  
  // Phone numbers (10 digits)
  /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/,
  
  // Addresses (coarse pattern)
  /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|circle|blvd|boulevard)\b/i,
  
  // ZIP codes with address context
  /\b\d{5}(-\d{4})?\b.{0,20}(address|street|ave|road|city)/i,
  
  // Image references with student context
  /\b(jpg|jpeg|png|gif|photo|image|picture)\b.{0,30}(student|child|face|kid)/i,
  
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  
  // Names with titles (common in student references)
  /\b(mr|mrs|ms|miss|dr)\.\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?\b/i,
  
  // Specific student references
  /\bmy student\s+[A-Z][a-z]+/,
  /\b(first|last)\s+name\s+(is|:|=)\s*[A-Z][a-z]+/i,
  
  // Parent/guardian names
  /\b(parent|guardian|mother|father|mom|dad)\s+(is|name|:|=)\s*[A-Z][a-z]+/i,
  
  // Birth dates
  /\b(birth|born|dob)\b.{0,10}\b(19|20)\d{2}\b/i,
  /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)?\d{2}\b/,
  
  // Medical diagnoses with names
  /\b[A-Z][a-z]+\s+(has|diagnosed|diagnosis)\b/,
];

/**
 * Scan input text for PII patterns
 * @param input - User query text
 * @returns true if PII is detected, false otherwise
 */
export function scan(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  // Normalize whitespace for better pattern matching
  const normalized = input.replace(/\s+/g, ' ').trim();
  
  return PII_PATTERNS.some(pattern => pattern.test(normalized));
}

/**
 * Privacy policy message shown when PII is detected
 */
export const POLICY_MESSAGE = 
  "For privacy and FERPA compliance, please describe general challenges and classroom context only. " +
  "Don't include student names, IDs, photos, or other identifying details. " +
  "Focus on describing the learning need, environment, and tasks instead.";

/**
 * Get specific feedback about what might have triggered PII detection
 * (For debugging/user guidance - doesn't reveal the exact pattern)
 */
export function getHint(input: string): string {
  if (/\b(student|child|kid)\b.*\b(name|id)\b/i.test(input)) {
    return "Avoid mentioning student names or IDs.";
  }
  if (/\bIEP\s*#?\d{3,}/i.test(input)) {
    return "Don't include IEP numbers.";
  }
  if (/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/.test(input)) {
    return "Remove any numbers that look like SSNs or phone numbers.";
  }
  if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/.test(input)) {
    return "Remove email addresses.";
  }
  if (/\b(jpg|jpeg|png|photo|image)\b/i.test(input)) {
    return "Don't reference student photos or images.";
  }
  return "Try describing the situation more generally without specific identifying details.";
}

/**
 * Safe query examples (for UI guidance) - Diverse AT needs
 */
export const SAFE_EXAMPLES = [
  "What AT tools help students with ADHD stay focused during independent work?",
  "Low-tech supports for elementary students with fine motor challenges in writing?",
  "Free text-to-speech options for Chromebooks for middle school reading comprehension?",
  "What graphic organizers work well for 5th graders organizing essay ideas?",
  "Mid-tech tools for students with autism to communicate in group activities?",
  "Assistive tech for high school students with visual impairments taking notes?",
  "AT tools for students with executive function challenges managing assignments?",
  "Voice-to-text options for students with physical disabilities in writing tasks?",
];

/**
 * Unsafe query examples (for training purposes)
 */
export const UNSAFE_EXAMPLES = [
  "What AT tools help Johnny Smith with his ADHD?",
  "My student with IEP #12345 needs writing support.",
  "Photos of students using devices—what should I buy?",
  "Sarah Jones (sarah.jones@email.com) struggles with reading.",
  "Parent contact: John Doe, 555-123-4567",
];

