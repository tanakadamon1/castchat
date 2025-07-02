import { ref, computed, readonly } from 'vue'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  custom?: (value: any) => boolean
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateField(value: any, rules: ValidationRule): ValidationResult {
  const errors: string[] = []
  
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push(rules.message || 'この項目は必須です')
    return { isValid: false, errors }
  }
  
  // If value is empty and not required, skip other validations
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true, errors: [] }
  }
  
  const stringValue = String(value)
  
  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(rules.message || `${rules.minLength}文字以上入力してください`)
  }
  
  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(rules.message || `${rules.maxLength}文字以内で入力してください`)
  }
  
  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(stringValue)) {
      errors.push(rules.message || '有効なメールアドレスを入力してください')
    }
  }
  
  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue)
    } catch {
      errors.push(rules.message || '有効なURLを入力してください')
    }
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.message || '入力形式が正しくありません')
  }
  
  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    errors.push(rules.message || '入力値が正しくありません')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateForm(data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
  const allErrors: string[] = []
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldValue = data[field]
    const fieldValidation = validateField(fieldValue, fieldRules)
    
    if (!fieldValidation.isValid) {
      allErrors.push(...fieldValidation.errors)
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

// Common validation rules
export const commonRules = {
  email: {
    email: true,
    message: '有効なメールアドレスを入力してください'
  },
  
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
    message: 'パスワードは8文字以上で、英字と数字を含む必要があります'
  },
  
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'ユーザー名は3-20文字の英数字とアンダースコアのみ使用できます'
  },
  
  url: {
    url: true,
    message: '有効なURLを入力してください'
  },
  
  required: {
    required: true,
    message: 'この項目は必須です'
  },
  
  discord: {
    pattern: /^.{3,32}#[0-9]{4}$|^[a-z0-9._]{2,32}$/,
    message: 'Discord ID（username#1234 または username）を入力してください'
  },
  
  twitter: {
    pattern: /^@?[A-Za-z0-9_]{1,15}$/,
    message: 'Twitterアカウント名（@username）を入力してください'
  },
  
  vrchat: {
    minLength: 3,
    maxLength: 20,
    message: 'VRChatユーザー名を入力してください'
  }
}

// Form field validation composable
export function useValidation() {
  const errors = ref<Record<string, string[]>>({})
  
  const validate = (field: string, value: any, rules: ValidationRule) => {
    const result = validateField(value, rules)
    errors.value[field] = result.errors
    return result.isValid
  }
  
  const validateAll = (data: Record<string, any>, rules: Record<string, ValidationRule>) => {
    const result = validateForm(data, rules)
    
    // Clear all errors first
    errors.value = {}
    
    // Set field-specific errors
    for (const [field, fieldRules] of Object.entries(rules)) {
      const fieldResult = validateField(data[field], fieldRules)
      if (!fieldResult.isValid) {
        errors.value[field] = fieldResult.errors
      }
    }
    
    return result.isValid
  }
  
  const clearErrors = (field?: string) => {
    if (field) {
      delete errors.value[field]
    } else {
      errors.value = {}
    }
  }
  
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)
  
  const getFieldError = (field: string) => {
    return errors.value[field]?.[0] || ''
  }
  
  return {
    errors: readonly(errors),
    validate,
    validateAll,
    clearErrors,
    hasErrors,
    getFieldError
  }
}