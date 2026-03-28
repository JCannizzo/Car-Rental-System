using CarRentalSystem.Data.Models;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IPaymentService
{
    Task<string?> CreateCheckoutSessionAsync(Booking booking, string frontendBaseUrl);
    Task<bool> HandleWebhookAsync(string payload, string signature);
}
