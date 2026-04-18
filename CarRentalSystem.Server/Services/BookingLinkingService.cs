using System.Security.Claims;
using CarRentalSystem.Server.Extensions;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace CarRentalSystem.Server.Services;

public class BookingLinkingService : IBookingLinkingService
{
    private const string ClaimName = "booking_confirmation_code";
    private const string AttributeName = "bookingConfirmationCode";
    private static readonly TimeSpan LinkedSentinelTtl = TimeSpan.FromMinutes(5);

    private readonly IBookingService _bookingService;
    private readonly IKeycloakAdminClient _keycloakAdmin;
    private readonly IMemoryCache _cache;
    private readonly ILogger<BookingLinkingService> _logger;

    public BookingLinkingService(
        IBookingService bookingService,
        IKeycloakAdminClient keycloakAdmin,
        IMemoryCache cache,
        ILogger<BookingLinkingService> logger)
    {
        _bookingService = bookingService;
        _keycloakAdmin = keycloakAdmin;
        _cache = cache;
        _logger = logger;
    }

    public async Task TryLinkAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        var code = user.FindFirstValue(ClaimName);
        if (string.IsNullOrWhiteSpace(code))
        {
            return;
        }

        var userId = user.GetUserId();
        if (userId is null)
        {
            return;
        }

        var sentinelKey = $"booking-linked:{userId.Value}";
        if (_cache.TryGetValue(sentinelKey, out _))
        {
            return;
        }

        var email = user.GetUserEmail();
        if (string.IsNullOrWhiteSpace(email))
        {
            _logger.LogWarning(
                "Skipping auto-link for user {UserId}: no email claim on token.",
                userId.Value);
            _cache.Set(sentinelKey, true, LinkedSentinelTtl);
            return;
        }

        var shouldClearAttribute = false;
        try
        {
            await _bookingService.ClaimGuestBookingAsync(code, userId.Value, email);
            shouldClearAttribute = true;
        }
        catch (BookingClaimException ex)
        {
            shouldClearAttribute = ex.StatusCode is StatusCodes.Status404NotFound or StatusCodes.Status409Conflict;

            _logger.LogWarning(
                "Auto-link rejected for user {UserId} with code {Code}: {StatusCode} {Message}. AttributeCleared={Cleared}",
                userId.Value,
                code,
                ex.StatusCode,
                ex.Message,
                shouldClearAttribute);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Auto-link failed unexpectedly for user {UserId} with code {Code}; leaving attribute in place for retry.",
                userId.Value,
                code);
            return;
        }

        if (shouldClearAttribute)
        {
            try
            {
                await _keycloakAdmin.ClearUserAttributeAsync(userId.Value, AttributeName, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to clear Keycloak attribute {AttributeName} for user {UserId}; will retry on next request.",
                    AttributeName,
                    userId.Value);
                return;
            }
        }

        _cache.Set(sentinelKey, true, LinkedSentinelTtl);
    }
}
