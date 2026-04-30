using CarRentalSystem.Server.DTOs;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IBookingService
{
    Task<BookingConfirmationDto> CreateBookingAsync(CreateBookingDto dto, Guid? userId, string frontendBaseUrl);
    Task<ClaimBookingResultDto> ClaimGuestBookingAsync(string confirmationCode, Guid userId, string userEmail);
    Task<BookingDto?> GetBookingByConfirmationCodeAsync(string confirmationCode);
    Task<BookingDto?> GetBookingByIdAsync(Guid id);
    Task<List<BookingDto>> GetBookingsByUserAsync(Guid userId);
    Task<PaginatedResult<AdminBookingDto>> GetAdminBookingsAsync(AdminBookingQueryParams query);
    Task<AdminBookingDto?> UpdateBookingStatusAsync(Guid id, string status);
    Task<AdminBookingDto?> ReturnBookingAsync(Guid id, ReturnBookingDto dto);
    Task<bool> CancelBookingAsync(string confirmationCode);
}
