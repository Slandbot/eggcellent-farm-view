/**
 * Error handling utilities for consistent error management across the application
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION', 
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable?: boolean;
  details?: any;
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror')
    );
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isNetworkError(error)) {
    return true;
  }
  if (isTimeoutError(error)) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Retry on 5xx server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return true;
    }
  }
  return false;
}

/**
 * Parse error from API response
 */
export function parseApiError(error: unknown): AppError {
  // Network errors
  if (isNetworkError(error)) {
    return {
      type: ErrorType.NETWORK,
      message: isOnline()
        ? 'Unable to connect to the server. Please check your internet connection and try again.'
        : 'You are currently offline. Please check your internet connection.',
      originalError: error instanceof Error ? error : undefined,
      retryable: true,
    };
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'The request took too long to complete. Please try again.',
      originalError: error instanceof Error ? error : undefined,
      retryable: true,
    };
  }

  // Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication')) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Your session has expired. Please log in again.',
        originalError: error,
        statusCode: 401,
        retryable: false,
      };
    }

    // Authorization errors
    if (message.includes('403') || message.includes('forbidden') || message.includes('authorization')) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'You do not have permission to perform this action.',
        originalError: error,
        statusCode: 403,
        retryable: false,
      };
    }

    // Not found errors - check status code first
    const notFoundStatusCode = (error as any).status || extractStatusCode(message);
    
    // Handle 404 errors, especially authentication-related ones
    if (notFoundStatusCode === 404 || message.includes('404') || message.includes('not found')) {
      const isUserNotFound = message.toLowerCase().includes('user not found') ||
                            message.toLowerCase().includes('user does not exist');
      
      // If it's a user not found error, treat it as authentication error
      if (isUserNotFound) {
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'No account found with this email address. Please check your email or register a new account.',
          originalError: error,
          statusCode: 404,
          retryable: false,
        };
      }
      
      return {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found.',
        originalError: error,
        statusCode: 404,
        retryable: false,
      };
    }

    // Server errors (5xx) - check status code from error object if available
    const serverStatusCode = (error as any).status || extractStatusCode(message);
    if (serverStatusCode && serverStatusCode >= 500 && serverStatusCode < 600) {
      // Check for GCP permission errors
      const errorStr = JSON.stringify(error).toLowerCase();
      const isGcpPermissionError = errorStr.includes('permission denied') ||
                                   errorStr.includes('serviceusage') ||
                                   errorStr.includes('identitytoolkit') ||
                                   errorStr.includes('caller does not have required permission') ||
                                   errorStr.includes('user_project_denied');
      
      // Check if this is an authentication-related server error
      const isAuthError = message.includes('firebase') || 
                         message.includes('authentication') || 
                         message.includes('signin') ||
                         message.includes('login') ||
                         message.includes('profile');
      
      let errorMessage: string;
      if (isGcpPermissionError) {
        errorMessage = 'The authentication service is experiencing a configuration issue. This is a server-side permission problem that needs to be fixed by the backend team. Please contact your administrator.';
      } else if (isAuthError) {
        errorMessage = 'The authentication service is temporarily unavailable. Please try again in a few moments.';
      } else {
        errorMessage = 'The server encountered an error. Please try again later.';
      }
      
      return {
        type: ErrorType.SERVER,
        message: errorMessage,
        originalError: error,
        statusCode: serverStatusCode,
        retryable: !isGcpPermissionError, // Don't retry GCP permission errors
        details: (error as any).originalError || (error as any).originalMessage || message, // Preserve technical details
      };
    }
    
    // Also check for server error patterns in message
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      const extractedStatusCode = extractStatusCode(message);
      
      // Check for GCP permission errors
      const isGcpPermissionError = message.toLowerCase().includes('permission denied') ||
                                   message.toLowerCase().includes('serviceusage') ||
                                   message.toLowerCase().includes('identitytoolkit') ||
                                   message.toLowerCase().includes('caller does not have required permission') ||
                                   message.toLowerCase().includes('user_project_denied');
      
      const isAuthError = message.includes('firebase') || 
                         message.includes('authentication') || 
                         message.includes('signin') ||
                         message.includes('login') ||
                         message.includes('profile');
      
      let errorMessage: string;
      if (isGcpPermissionError) {
        errorMessage = 'The authentication service is experiencing a configuration issue. This is a server-side permission problem that needs to be fixed by the backend team. Please contact your administrator.';
      } else if (isAuthError) {
        errorMessage = 'The authentication service is temporarily unavailable. Please try again in a few moments.';
      } else {
        errorMessage = 'The server encountered an error. Please try again later.';
      }
      
      return {
        type: ErrorType.SERVER,
        message: errorMessage,
        originalError: error,
        statusCode: extractedStatusCode,
        retryable: !isGcpPermissionError, // Don't retry GCP permission errors
        details: message, // Preserve technical details
      };
    }

    // Rate limit errors - check status code first, then message
    const rateLimitStatusCode = (error as any).status || extractStatusCode(message);
    if (rateLimitStatusCode === 429 || message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
      const retryAfter = (error as any).retryAfter;
      let rateLimitMessage = 'Too many requests. Please wait a moment and try again.';
      
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (seconds < 60) {
          rateLimitMessage = `Too many requests. Please wait ${seconds} seconds and try again.`;
        } else {
          const minutes = Math.ceil(seconds / 60);
          rateLimitMessage = `Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} and try again.`;
        }
      }
      
      return {
        type: ErrorType.RATE_LIMIT,
        message: rateLimitMessage,
        originalError: error,
        statusCode: 429,
        retryable: true,
        details: { retryAfter },
      };
    }

    // Validation errors (4xx)
    if (message.includes('400') || message.includes('validation') || message.includes('invalid')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || 'Invalid input. Please check your data and try again.',
        originalError: error,
        statusCode: 400,
        retryable: false,
      };
    }

    // Generic error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred. Please try again.',
      originalError: error,
      retryable: isRetryableError(error),
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred. Please try again.',
    originalError: error instanceof Error ? error : undefined,
    retryable: false,
  };
}

/**
 * Extract status code from error message
 */
function extractStatusCode(message: string): number | undefined {
  const match = message.match(/\b(\d{3})\b/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = parseApiError(error);
  return appError.message;
}

/**
 * Safe localStorage operations with error handling
 */
export const storage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item from localStorage (${key}):`, error);
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to set item in localStorage (${key}):`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Consider clearing old data.');
      }
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from localStorage (${key}):`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create a timeout promise
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

