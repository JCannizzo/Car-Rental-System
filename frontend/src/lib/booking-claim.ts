import { ApiError } from "@/lib/api";

const pendingClaimKey = "pendingBookingClaimCode";

function claimErrorKey(code: string) {
  return `bookingClaimError:${code}`;
}

export function setPendingBookingClaimCode(code: string) {
  window.sessionStorage.setItem(pendingClaimKey, code);
}

export function getPendingBookingClaimCode() {
  return window.sessionStorage.getItem(pendingClaimKey);
}

export function clearPendingBookingClaimCode() {
  window.sessionStorage.removeItem(pendingClaimKey);
}

export function setBookingClaimError(code: string, message: string) {
  window.sessionStorage.setItem(claimErrorKey(code), message);
}

export function consumeBookingClaimError(code: string) {
  const key = claimErrorKey(code);
  const message = window.sessionStorage.getItem(key);
  if (message) {
    window.sessionStorage.removeItem(key);
  }

  return message;
}

export function mapClaimErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return "This booking is not eligible to be claimed.";
      case 403:
        return "Use the same email address you entered during checkout.";
      case 404:
        return "We couldn't find a booking for that confirmation code.";
      case 409:
        return "This booking is already linked to another account.";
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "We couldn't attach this booking right now.";
}

export function isTerminalClaimError(error: unknown) {
  return error instanceof ApiError
    && [400, 403, 404, 409].includes(error.status);
}
