import type { FieldValidation, TextValidationType } from "./types"

// ─── Regex patterns ───────────────────────────────────────────────────────────

export const VALIDATION_PRESETS: Record<
  TextValidationType,
  { label: string; description: string; pattern?: RegExp }
> = {
  none: {
    label: "ללא ולידציה",
    description: "כל ערך מתקבל",
  },
  numbers_only: {
    label: "מספרים בלבד",
    description: "רק ספרות 0–9",
    pattern: /^\d+$/,
  },
  text_only: {
    label: "טקסט בלבד",
    description: "אותיות בלבד, ללא מספרים",
    // Hebrew (U+0590–U+05FF) + Latin + spaces
    pattern: /^[\u0590-\u05FF\u200f\u200ea-zA-Z\s'.,-]+$/,
  },
  phone_il: {
    label: "טלפון ישראלי",
    description: "05X-XXXXXXX או 0X-XXXXXXX",
    // Accepts: 0521234567 | 052-1234567 | 052 1234567 | 021234567 | 02-1234567
    pattern: /^0(5[0-9]|[2-9])\d?[-\s]?\d{3}[-\s]?\d{4}$/,
  },
  id_il: {
    label: "תעודת זהות ישראלית",
    description: "9 ספרות עם בדיקת ספרת ביקורת",
    pattern: /^\d{9}$/,
  },
  custom_regex: {
    label: "Regex מותאם אישית",
    description: "הגדר תבנית Regex משלך",
  },
}

// ─── Israeli ID (Luhn algorithm) ──────────────────────────────────────────────

function validateIsraeliID(id: string): boolean {
  if (!/^\d{9}$/.test(id)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]) * (i % 2 === 0 ? 1 : 2)
    if (digit > 9) digit -= 9
    sum += digit
  }
  return sum % 10 === 0
}

// ─── Error messages ───────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<TextValidationType, string> = {
  none: "",
  numbers_only: "ניתן להזין מספרים בלבד",
  text_only: "ניתן להזין טקסט בלבד (ללא מספרים)",
  phone_il: "מספר טלפון לא תקין (לדוגמה: 050-1234567)",
  id_il: "תעודת זהות לא תקינה (9 ספרות תקינות)",
  custom_regex: "הערך אינו תואם לפורמט הנדרש",
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Validates a text field value against the given validation rule.
 * Returns null if valid, or a Hebrew error string if invalid.
 */
export function validateTextValue(
  value: string,
  validation: FieldValidation | undefined
): string | null {
  if (!validation || validation.type === "none") return null
  if (!value || value.trim() === "") return null // required is checked separately

  const { type, custom_pattern } = validation

  // Special case: Israeli ID uses Luhn, not just regex
  if (type === "id_il") {
    const clean = value.replace(/[-\s]/g, "")
    if (!validateIsraeliID(clean)) return ERROR_MESSAGES.id_il
    return null
  }

  // Custom regex
  if (type === "custom_regex") {
    if (!custom_pattern) return null
    try {
      const re = new RegExp(custom_pattern)
      if (!re.test(value)) return ERROR_MESSAGES.custom_regex
    } catch {
      // invalid regex — don't block submission
    }
    return null
  }

  // Preset patterns
  const preset = VALIDATION_PRESETS[type]
  if (preset?.pattern && !preset.pattern.test(value)) {
    return ERROR_MESSAGES[type]
  }

  return null
}
