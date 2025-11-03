/**
 * Privacy utility functions for filtering sensitive user data in API responses
 */

/**
 * Base interface for user data that contains email information
 */
export interface UserDataWithEmail {
  userId: string;
  userEmail: string | null;
  [key: string]: any;
}

/**
 * Configuration options for privacy filtering
 */
export interface PrivacyFilterOptions {
  /**
   * ID of the current authenticated user
   * If provided, this user's email will be preserved in the response
   */
  currentUserId?: string;
  
  /**
   * Whether to preserve email for the current user
   * Defaults to true
   */
  preserveEmailForCurrentUser?: boolean;
}

/**
 * Filters email data from user objects based on privacy rules
 * 
 * @param userData Array of user data objects containing email fields
 * @param options Privacy filter configuration options
 * @returns Modified array with email fields conditionally included
 * 
 * Privacy Rules:
 * - Current user's email is preserved (if preserveEmailForCurrentUser is true)
 * - All other users' emails are set to null
 * - If no currentUserId is provided, all emails are filtered out
 * - All other user data fields remain unchanged
 */
export function filterEmailPrivacy<T extends UserDataWithEmail>(
  userData: T[],
  options: PrivacyFilterOptions = {}
): T[] {
  const { 
    currentUserId, 
    preserveEmailForCurrentUser = true 
  } = options;

  // Handle edge cases
  if (!userData || !Array.isArray(userData)) {
    return [];
  }

  return userData.map((user) => {
    // Handle null/undefined user objects
    if (!user || typeof user !== 'object') {
      return user;
    }

    // Create a copy to avoid mutating the original object
    const filteredUser = { ...user };

    // Determine if this user's email should be preserved
    const shouldPreserveEmail = 
      preserveEmailForCurrentUser && 
      currentUserId && 
      user.userId === currentUserId;

    // Filter email based on privacy rules
    if (!shouldPreserveEmail) {
      filteredUser.userEmail = null;
    }

    return filteredUser;
  });
}

/**
 * Type guard to check if an object has the required email structure
 */
export function hasEmailField(obj: any): obj is UserDataWithEmail {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.userId === 'string' &&
    (obj.userEmail === null || typeof obj.userEmail === 'string')
  );
}

/**
 * Validates that user data array contains valid email structures
 */
export function validateUserDataStructure<T extends UserDataWithEmail>(
  userData: T[]
): boolean {
  if (!Array.isArray(userData)) {
    return false;
  }

  return userData.every(hasEmailField);
}