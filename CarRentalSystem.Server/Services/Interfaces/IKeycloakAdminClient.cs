namespace CarRentalSystem.Server.Services.Interfaces;

public interface IKeycloakAdminClient
{
    Task ClearUserAttributeAsync(Guid userId, string attributeName, CancellationToken cancellationToken = default);
}
