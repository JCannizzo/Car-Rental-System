using CarRentalSystem.Data.Contexts;
using CarRentalSystem.Data.Models;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace CarRentalSystem.Server.Services;

public class StripePaymentService : IPaymentService
{
    private readonly IConfiguration _config;
    private readonly CarRentalSystemDbContext _dbContext;
    private readonly ILogger<StripePaymentService> _logger;

    public StripePaymentService(
        IConfiguration config,
        CarRentalSystemDbContext dbContext,
        ILogger<StripePaymentService> logger)
    {
        _config = config;
        _dbContext = dbContext;
        _logger = logger;

        // STRIPE_API_KEY is injected by Aspire's Stripe hosting toolkit,
        // falling back to Stripe:SecretKey from appsettings for non-Aspire environments
        StripeConfiguration.ApiKey = Environment.GetEnvironmentVariable("STRIPE_API_KEY")
            ?? _config["Stripe:SecretKey"];
    }

    public async Task<string?> CreateCheckoutSessionAsync(Booking booking, string frontendBaseUrl)
    {
        var vehicle = await _dbContext.Vehicles.FindAsync(booking.VehicleId);
        if (vehicle is null) return null;

        var days = (booking.EndDate.Date - booking.StartDate.Date).Days;
        var vehicleSummary = $"{vehicle.Year} {vehicle.Make} {vehicle.Model}";

        var baseUrl = frontendBaseUrl.TrimEnd('/');
        var successUrl = $"{baseUrl}/booking/confirmation/{booking.ConfirmationCode}";
        var cancelUrl = $"{baseUrl}/vehicles/{booking.VehicleId}";

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            ClientReferenceId = booking.Id.ToString(),
            LineItems =
            [
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        UnitAmountDecimal = booking.TotalPrice * 100, // cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = vehicleSummary,
                            Description = $"{days} day rental ({booking.StartDate:MMM d} - {booking.EndDate:MMM d})",
                        },
                    },
                    Quantity = 1,
                },
            ],
            BillingAddressCollection = "required",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = new Dictionary<string, string>
            {
                ["booking_id"] = booking.Id.ToString(),
                ["confirmation_code"] = booking.ConfirmationCode,
            },
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        // Save the Stripe session ID on the booking
        booking.StripeSessionId = session.Id;
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Stripe Checkout session {SessionId} created for booking {ConfirmationCode}",
            session.Id, booking.ConfirmationCode);

        return session.Url;
    }

    public async Task<bool> HandleWebhookAsync(string payload, string signature)
    {
        Event stripeEvent;
        // STRIPE_WEBHOOK_SECRET is injected by Aspire's Stripe hosting toolkit
        var webhookSecret = Environment.GetEnvironmentVariable("STRIPE_WEBHOOK_SECRET")
            ?? _config["Stripe:WebhookSecret"];

        if (string.IsNullOrEmpty(webhookSecret))
        {
            // Development mode: skip signature verification when using Stripe CLI forwarding
            _logger.LogWarning("Stripe webhook secret not configured — skipping signature verification.");
            stripeEvent = EventUtility.ParseEvent(payload);
        }
        else
        {
            try
            {
                stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);
            }
            catch (StripeException ex)
            {
                _logger.LogWarning("Stripe webhook signature verification failed: {Message}", ex.Message);
                return false;
            }
        }

        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;
            if (session is null) return false;

            await FulfillBookingAsync(session);
        }

        return true;
    }

    private async Task FulfillBookingAsync(Session session)
    {
        var booking = await _dbContext.Bookings
            .FirstOrDefaultAsync(b => b.StripeSessionId == session.Id);

        if (booking is null)
        {
            _logger.LogWarning("No booking found for Stripe session {SessionId}", session.Id);
            return;
        }

        if (booking.PaymentStatus == Data.Models.PaymentStatus.Paid)
        {
            _logger.LogInformation("Booking {ConfirmationCode} already fulfilled, skipping.", booking.ConfirmationCode);
            return;
        }

        // Pull customer details from the Stripe session
        booking.GuestEmail = session.CustomerDetails?.Email;
        booking.GuestName = session.CustomerDetails?.Name;
        booking.Status = BookingStatus.Confirmed;
        booking.PaymentStatus = Data.Models.PaymentStatus.Paid;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Booking {ConfirmationCode} confirmed via Stripe payment. Customer: {Email}",
            booking.ConfirmationCode, booking.GuestEmail);
    }
}
