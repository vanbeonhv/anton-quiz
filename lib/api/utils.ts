/**
 * Utility functions for API operations
 */

/**
 * Build query parameters from an object
 */
export const buildQueryParams = (params: Record<string, string | number | boolean | undefined>): URLSearchParams => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  
  return searchParams
}

/**
 * Validate required fields in form data
 */
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const missingFields: string[] = []
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missingFields.push(field)
    }
  })
  
  return missingFields
}

/**
 * Format validation error message
 */
export const formatValidationError = (missingFields: string[]): string => {
  if (missingFields.length === 0) return ''
  
  if (missingFields.length === 1) {
    return `${missingFields[0]} is required`
  }
  
  const lastField = missingFields.pop()
  return `${missingFields.join(', ')} and ${lastField} are required`
}