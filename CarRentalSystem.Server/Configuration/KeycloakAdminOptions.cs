namespace CarRentalSystem.Server.Configuration;

public class KeycloakAdminOptions
{
    public const string SectionName = "Keycloak";

    public string Realm { get; set; } = "car-rental";
    public string AdminClientId { get; set; } = "carrental-admin";
    public string AdminClientSecret { get; set; } = string.Empty;
}
