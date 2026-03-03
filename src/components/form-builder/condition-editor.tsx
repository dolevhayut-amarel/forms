"use client"

import { Plus, X, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type FieldConfig,
  type FieldCondition,
  type ConditionRule,
  type ConditionOperator,
} from "@/lib/types"
import {
  getConditionSources,
  getOperatorsForField,
  OPERATOR_META,
} from "@/lib/conditions"

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConditionEditorProps {
  field: FieldConfig
  allFields: FieldConfig[]
  onChange: (conditions: FieldCondition | undefined) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyRule(): ConditionRule {
  return { fieldId: "", operator: "equals", value: "" }
}

function emptyCondition(): FieldCondition {
  return { match: "all", rules: [emptyRule()] }
}

// ─── Value input — context-sensitive ─────────────────────────────────────────

function RuleValueInput({
  rule,
  sourceField,
  onChange,
}: {
  rule: ConditionRule
  sourceField: FieldConfig | undefined
  onChange: (value: string) => void
}) {
  const meta = OPERATOR_META[rule.operator]
  if (!meta.hasValueInput) return null
  if (!sourceField) return null

  // Dropdown / multiselect → select from options
  if (
    (sourceField.type === "dropdown" || sourceField.type === "multiselect") &&
    (sourceField.options ?? []).length > 0
  ) {
    return (
      <Select
        value={rule.value ?? ""}
        onValueChange={onChange}
        dir="rtl"
      >
        <SelectTrigger className="h-8 rounded-lg text-xs flex-1 min-w-0">
          <SelectValue placeholder="בחר ערך…" />
        </SelectTrigger>
        <SelectContent dir="rtl">
          {(sourceField.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt} className="text-xs">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Checkbox → מסומן / לא מסומן toggle
  if (sourceField.type === "checkbox") {
    return (
      <div className="flex gap-1 flex-1">
        {(["true", ""] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 h-8 rounded-lg border text-xs font-medium transition-colors ${
              (rule.value ?? "") === v
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {v === "true" ? "מסומן" : "לא מסומן"}
          </button>
        ))}
      </div>
    )
  }

  // Entry/exit → כניסה / יציאה toggle
  if (sourceField.type === "entry_exit") {
    return (
      <div className="flex gap-1 flex-1">
        {(["כניסה", "יציאה"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 h-8 rounded-lg border text-xs font-medium transition-colors ${
              rule.value === v
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    )
  }

  // Date → date input
  if (sourceField.type === "date") {
    return (
      <input
        type="date"
        value={rule.value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 min-w-0 rounded-lg border border-input px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
        dir="ltr"
      />
    )
  }

  // Number / star_rating → number input
  if (sourceField.type === "number" || sourceField.type === "star_rating") {
    return (
      <Input
        type="number"
        value={rule.value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ערך…"
        className="h-8 rounded-lg text-xs flex-1 min-w-0"
        min={sourceField.type === "star_rating" ? 1 : undefined}
        max={sourceField.type === "star_rating" ? 5 : undefined}
        dir="ltr"
      />
    )
  }

  // Default → plain text input
  return (
    <Input
      value={rule.value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="ערך…"
      className="h-8 rounded-lg text-xs flex-1 min-w-0"
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConditionEditor({ field, allFields, onChange }: ConditionEditorProps) {
  const sources = getConditionSources(field.id, allFields)
  const cond = field.conditions

  // Find a source field by id
  function getSource(fieldId: string): FieldConfig | undefined {
    return sources.find((f) => f.id === fieldId)
  }

  function updateRule(index: number, patch: Partial<ConditionRule>) {
    if (!cond) return
    const newRules = cond.rules.map((r, i) =>
      i === index ? { ...r, ...patch } : r
    )
    // Reset value when operator changes to one that has no value input
    if (patch.operator && !OPERATOR_META[patch.operator].hasValueInput) {
      newRules[index] = { ...newRules[index], value: undefined }
    }
    onChange({ ...cond, rules: newRules })
  }

  function updateRuleField(index: number, newFieldId: string) {
    if (!cond) return
    const newSource = getSource(newFieldId)
    const defaultOperator = newSource
      ? getOperatorsForField(newSource)[0]
      : "equals"
    const newRules = cond.rules.map((r, i) =>
      i === index
        ? { fieldId: newFieldId, operator: defaultOperator, value: undefined }
        : r
    )
    onChange({ ...cond, rules: newRules })
  }

  function addRule() {
    if (cond) {
      onChange({ ...cond, rules: [...cond.rules, emptyRule()] })
    } else {
      onChange(emptyCondition())
    }
  }

  function removeRule(index: number) {
    if (!cond) return
    const newRules = cond.rules.filter((_, i) => i !== index)
    if (newRules.length === 0) {
      onChange(undefined) // clear all conditions
    } else {
      onChange({ ...cond, rules: newRules })
    }
  }

  function setMatch(match: "all" | "any") {
    if (cond) onChange({ ...cond, match })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!cond || cond.rules.length === 0) {
    // Empty state
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <Label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            לוגיקה מותנית
          </Label>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          ברירת המחדל: שדה זה תמיד מוצג.
          <br />
          הוסף תנאי כדי להציג אותו רק כשמתקיים תנאי מסוים.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRule}
          className="h-8 rounded-xl text-xs gap-1.5 w-full border-dashed"
          disabled={sources.length === 0}
        >
          <Plus className="h-3.5 w-3.5" />
          הוסף תנאי
        </Button>
        {sources.length === 0 && (
          <p className="text-[11px] text-neutral-300 text-center">
            הוסף שדות נוספים לטופס כדי ליצור תנאים
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <Label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          לוגיקה מותנית
        </Label>
      </div>

      {/* Match selector */}
      <div className="flex items-center gap-2 text-xs text-neutral-600">
        <span>הצג שדה זה כאשר</span>
        <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
          {(["all", "any"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMatch(m)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                cond.match === m
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {m === "all" ? "כל" : "אחד"}
            </button>
          ))}
        </div>
        <span>מהתנאים מתקיימים:</span>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-2">
        {cond.rules.map((rule, i) => {
          const sourceField = getSource(rule.fieldId)
          const operators = sourceField ? getOperatorsForField(sourceField) : []

          return (
            <div
              key={i}
              className="flex items-start gap-1.5 bg-neutral-50 rounded-xl p-2"
            >
              {/* Field selector */}
              <Select
                value={rule.fieldId || "__none__"}
                onValueChange={(v) =>
                  updateRuleField(i, v === "__none__" ? "" : v)
                }
                dir="rtl"
              >
                <SelectTrigger className="h-8 rounded-lg text-xs flex-1 min-w-0 bg-white">
                  <SelectValue placeholder="בחר שדה…" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="__none__" className="text-xs text-neutral-400 italic">
                    בחר שדה…
                  </SelectItem>
                  {sources.map((src) => (
                    <SelectItem key={src.id} value={src.id} className="text-xs">
                      {src.label || `(שדה ${src.type})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator selector — only when field is chosen */}
              {sourceField && (
                <Select
                  value={rule.operator}
                  onValueChange={(v) =>
                    updateRule(i, { operator: v as ConditionOperator })
                  }
                  dir="rtl"
                >
                  <SelectTrigger className="h-8 rounded-lg text-xs w-28 shrink-0 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {operators.map((op) => (
                      <SelectItem key={op} value={op} className="text-xs">
                        {OPERATOR_META[op].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Value input — context-sensitive */}
              {sourceField && (
                <RuleValueInput
                  rule={rule}
                  sourceField={sourceField}
                  onChange={(v) => updateRule(i, { value: v })}
                />
              )}

              {/* Remove rule */}
              <button
                type="button"
                onClick={() => removeRule(i)}
                className="h-8 w-7 flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add rule */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addRule}
        className="h-7 rounded-lg text-xs gap-1 text-neutral-500 hover:text-neutral-700 w-full"
      >
        <Plus className="h-3 w-3" />
        הוסף תנאי
      </Button>
    </div>
  )
}
