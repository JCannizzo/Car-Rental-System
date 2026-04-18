using System.Security.Claims;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IBookingLinkingService
{
    Task TryLinkAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);
}
