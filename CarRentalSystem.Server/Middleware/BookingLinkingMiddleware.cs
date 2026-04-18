using CarRentalSystem.Server.Services.Interfaces;

namespace CarRentalSystem.Server.Middleware;

public class BookingLinkingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<BookingLinkingMiddleware> _logger;

    public BookingLinkingMiddleware(RequestDelegate next, ILogger<BookingLinkingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IBookingLinkingService linker)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            try
            {
                await linker.TryLinkAsync(context.User, context.RequestAborted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Booking auto-link middleware threw; continuing request pipeline.");
            }
        }

        await _next(context);
    }
}
