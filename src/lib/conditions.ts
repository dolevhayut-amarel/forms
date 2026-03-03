import type {
  FieldConfig,
  FieldCondition,
  ConditionRule,
  ConditionOperator,
  InputFieldType,
} from "./types"

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValues = Record<string, string | string[]>

// ─── Operator metadata ────────────────────────────────────────────────────────

export interface OperatorMeta {
  label: string
  hasValueInput: boolean
}

export const OPERATOR_META: Record<ConditionOperator, OperatorMeta> = {
  equals:       { label: "שווה ל",      hasValueInput: true },
  not_equals:   { label: "שונה מ",      hasValueInput: true },
  contains:     { label: "מכיל",         hasValueInput: true },
  not_contains: { label: "לא מכיל",     hasValueInput: true },
  is_empty:     { label: "ריק",          hasValueInput: false },
  is_not_empty: { label: "לא ריק",      hasValueInput: false },
  greater_than: { label: "גדול מ",      hasValueInput: true },
  less_than:    { label: "קטן מ",       hasValueInput: true },
}

/** Operators available for each source field type */
export const OPERATORS_BY_TYPE: Partial<Record<InputFieldType, ConditionOperator[]>> = {
  text:         ["equals", "not_equals", "contains", "not_contains", "is_empty", "is_not_empty"],
  long_answer:  ["equals", "not_equals", "contains", "not_contains", "is_empty", "is_not_empty"],
  dropdown:     ["equals", "not_equals", "is_empty", "is_not_empty"],
  multiselect:  ["contains", "not_contains", "is_empty", "is_not_empty"],
  checkbox:     ["equals", "not_equals"],
  number:       ["equals", "not_equals", "greater_than", "less_than", "is_empty", "is_not_empty"],
  star_rating:  ["equals", "not_equals", "greater_than", "less_than", "is_empty", "is_not_empty"],
  date:         ["equals", "greater_than", "less_than", "is_empty", "is_not_empty"],
  entry_exit:   ["equals", "not_equals", "is_empty", "is_not_empty"],
  signature:    ["is_empty", "is_not_empty"],
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

/**
 * Returns true if the field should be visible given the current form values.
 * Fields with no conditions (or empty rules) are always visible.
 */
export function isFieldVisible(
  field: FieldConfig,
  values: FormValues
): boolean {
  if (!field.conditions || field.conditions.rules.length === 0) return true
  return evaluateCondition(field.conditions, values)
}

function evaluateCondition(cond: FieldCondition, values: FormValues): boolean {
  if (cond.rules.length === 0) return true
  const results = cond.rules.map((r) => evaluateRule(r, values))
  return cond.match === "all"
    ? results.every(Boolean)
    : results.some(Boolean)
}

function evaluateRule(rule: ConditionRule, values: FormValues): boolean {
  const val = values[rule.fieldId]
  const isEmpty =
    val === undefined ||
    val === "" ||
    (Array.isArray(val) && val.length === 0)

  switch (rule.operator) {
    case "is_empty":
      return isEmpty

    case "is_not_empty":
      return !isEmpty

    case "equals":
      if (Array.isArray(val)) return val.includes(rule.value ?? "")
      return val === (rule.value ?? "")

    case "not_equals":
      if (Array.isArray(val)) return !val.includes(rule.value ?? "")
      return val !== (rule.value ?? "")

    case "contains":
      if (Array.isArray(val)) return val.includes(rule.value ?? "")
      return String(val ?? "").includes(rule.value ?? "")

    case "not_contains":
      if (Array.isArray(val)) return !val.includes(rule.value ?? "")
      return !String(val ?? "").includes(rule.value ?? "")

    case "greater_than":
      return Number(val) > Number(rule.value ?? 0)

    case "less_than":
      return Number(val) < Number(rule.value ?? 0)

    default:
      return true
  }
}

// ─── Builder helpers ──────────────────────────────────────────────────────────

/**
 * Returns the input fields that can be used as condition sources
 * for a given target field (excludes layout fields and the field itself).
 */
export function getConditionSources(
  targetFieldId: string,
  allFields: FieldConfig[]
): FieldConfig[] {
  return allFields.filter(
    (f) =>
      f.id !== targetFieldId &&
      f.type !== "heading" &&
      f.type !== "subheading" &&
      f.type !== "paragraph" &&
      f.type !== "divider" &&
      f.type !== "image" &&
      f.type !== "link"
  )
}

/**
 * Returns valid operators for a given source field type.
 * Falls back to equals/not_equals/is_empty/is_not_empty if type not found.
 */
export function getOperatorsForField(field: FieldConfig): ConditionOperator[] {
  return (
    OPERATORS_BY_TYPE[field.type as InputFieldType] ?? [
      "equals",
      "not_equals",
      "is_empty",
      "is_not_empty",
    ]
  )
}
