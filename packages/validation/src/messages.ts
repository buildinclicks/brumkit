/**
 * Validation message keys for internationalization (i18n)
 *
 * Usage:
 * - Use these keys in Zod schemas
 * - Map these keys to actual translations in your i18n files
 * - Format: '{category}.{specific_error}' (without 'validation.' prefix)
 * - The 'validation.' prefix is added automatically by useValidationMessages hook
 */

export const ValidationMessages = {
  // ============================================
  // COMMON
  // ============================================
  REQUIRED: 'common.required',
  INVALID_FORMAT: 'common.invalid_format',
  TOO_SHORT: 'common.too_short',
  TOO_LONG: 'common.too_long',
  INVALID_TYPE: 'common.invalid_type',
  INVALID_VALUE: 'common.invalid_value',

  // ============================================
  // EMAIL
  // ============================================
  EMAIL_REQUIRED: 'email.required',
  EMAIL_INVALID: 'email.invalid',
  EMAIL_TOO_SHORT: 'email.too_short',
  EMAIL_TOO_LONG: 'email.too_long',
  EMAIL_ALREADY_EXISTS: 'email.already_exists',
  EMAIL_IN_USE: 'email.in_use',
  EMAIL_SAME_AS_CURRENT: 'email.same_as_current',

  // ============================================
  // PASSWORD
  // ============================================
  PASSWORD_REQUIRED: 'password.required',
  PASSWORD_TOO_SHORT: 'password.too_short',
  PASSWORD_TOO_LONG: 'password.too_long',
  PASSWORD_NO_UPPERCASE: 'password.no_uppercase',
  PASSWORD_NO_LOWERCASE: 'password.no_lowercase',
  PASSWORD_NO_NUMBER: 'password.no_number',
  PASSWORD_MISMATCH: 'password.mismatch',
  PASSWORD_SAME_AS_CURRENT: 'password.same_as_current',
  PASSWORD_INCORRECT: 'password.incorrect',

  // ============================================
  // USERNAME
  // ============================================
  USERNAME_REQUIRED: 'username.required',
  USERNAME_INVALID: 'username.invalid_format',
  USERNAME_TOO_SHORT: 'username.too_short',
  USERNAME_TOO_LONG: 'username.too_long',
  USERNAME_ALREADY_EXISTS: 'username.already_exists',

  // ============================================
  // USER
  // ============================================
  USER_NAME_REQUIRED: 'user.name_required',
  USER_NAME_TOO_LONG: 'user.name_too_long',
  USER_BIO_TOO_LONG: 'user.bio_too_long',
  USER_IMAGE_INVALID: 'user.image_invalid_url',

  // ============================================
  // NOTIFICATION
  // ============================================
  NOTIFICATION_TITLE_REQUIRED: 'notification.title_required',
  NOTIFICATION_TITLE_TOO_LONG: 'notification.title_too_long',
  NOTIFICATION_MESSAGE_REQUIRED: 'notification.message_required',
  NOTIFICATION_LINK_INVALID: 'notification.link_invalid_url',
  NOTIFICATION_LINK_TOO_LONG: 'notification.link_too_long',

  // ============================================
  // SLUG
  // ============================================
  SLUG_INVALID: 'slug.invalid_format',
  SLUG_TOO_SHORT: 'slug.too_short',
  SLUG_TOO_LONG: 'slug.too_long',

  // ============================================
  // PAGINATION
  // ============================================
  PAGE_INVALID: 'pagination.page_invalid',
  PAGE_TOO_SMALL: 'pagination.page_too_small',
  LIMIT_INVALID: 'pagination.limit_invalid',
  LIMIT_TOO_SMALL: 'pagination.limit_too_small',
  LIMIT_TOO_LARGE: 'pagination.limit_too_large',

  // ============================================
  // SORT
  // ============================================
  SORT_FIELD_INVALID: 'sort.field_invalid',
  SORT_DIRECTION_INVALID: 'sort.direction_invalid',

  // ============================================
  // CUID
  // ============================================
  CUID_INVALID: 'cuid.invalid_format',
} as const;

/**
 * Type for validation message keys
 */
export type ValidationMessageKey =
  (typeof ValidationMessages)[keyof typeof ValidationMessages];
