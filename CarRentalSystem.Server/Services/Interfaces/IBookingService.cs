using CarRentalSystem.Server.DTOs;

namespace CarRentalSystem.Server.Services.Interfaces;

public interface IBookingService
{
    Task<BookingConfirmationDto> CreateBookingAsync(CreateBookingDto dto, Guid? userId);
    Task<BookingDto?> GetBookingByConfirmationCodeAsync(string confirmationCode);
    Task<BookingDto?> GetBookingByIdAsync(Guid id);
    Task<List<BookingDto>> GetBookingsByUserAsync(Guid userId);
    Task<bool> CancelBookingAsync(string confirmationCode);
}
