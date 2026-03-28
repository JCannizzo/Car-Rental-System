using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.Services.Interfaces;

namespace CarRentalSystem.Server.Services;

/// Placeholder payment service used until Stripe is integrated.
/// Replace this registration with StripePaymentService in Program.cs when ready.
public class StubPaymentService : IPaymentService
{
    private readonly ILogger<StubPaymentService> _logger;

    public StubPaymentService(ILogger<StubPaymentService> logger)
    {
        _logger = logger;
    }

    public Task<string?> CreateCheckoutSessionAsync(Booking booking, string frontendBaseUrl)
    {
        _logger.LogWarning(
            "Payment service is not configured. Booking {ConfirmationCode} created without payment.",
            booking.ConfirmationCode);

        return Task.FromResult<string?>(null);
    }

    public Task<bool> HandleWebhookAsync(string payload, string signature)
    {
        _logger.LogWarning("Payment webhook received but no payment provider is configured.");
        return Task.FromResult(true);
    }
}
