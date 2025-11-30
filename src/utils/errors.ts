// Structured Error Classes

export class ApiError extends Error {
  public status?: number;
  public statusText?: string;
  public response?: Response;

  constructor(message: string, status?: number, statusText?: string, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your internet connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Map technical errors to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'NetworkError': 'Unable to connect. Please check your internet connection.',
  'Failed to fetch': 'Unable to connect to the server. Please try again.',
  'TypeError': 'Network error. Please check your internet connection.',

  // Authentication errors
  'Unauthorized': 'Your session has expired. Please login again.',
  'Forbidden': 'You don\'t have permission to perform this action.',

  // Validation errors
  'ValidationError': 'Please check your input and try again.',

  // Server errors
  'InternalServerError': 'Something went wrong on our end. We\'re looking into it.',
  '500': 'Server error. Please try again later.',

  // Default
  'default': 'An unexpected error occurred. Please try again.',
};

export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status === 401) {
      return ERROR_MESSAGES['Unauthorized'];
    }
    if (error.status === 403) {
      return ERROR_MESSAGES['Forbidden'];
    }
    if (error.status && error.status >= 500) {
      return ERROR_MESSAGES['InternalServerError'];
    }
    return error.message || ERROR_MESSAGES.default;
  }

  if (error instanceof NetworkError) {
    return ERROR_MESSAGES['NetworkError'];
  }

  if (error instanceof ValidationError) {
    return error.message || ERROR_MESSAGES['ValidationError'];
  }

  if (error instanceof Error) {
    // Check if we have a friendly message for this error
    return ERROR_MESSAGES[error.message] || ERROR_MESSAGES[error.name] || error.message || ERROR_MESSAGES.default;
  }

  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  return ERROR_MESSAGES.default;
};

