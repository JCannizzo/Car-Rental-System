using System.Security.Claims;
using System.Text.Json;

namespace CarRentalSystem.Server.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var rawUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    public static string? GetUserEmail(this ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Email)
            ?? user.FindFirstValue("email");
    }

    public static bool HasRealmRole(this ClaimsPrincipal user, string role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return false;
        }

        if (user.IsInRole(role))
        {
            return true;
        }

        if (user.Claims.Any(claim =>
                (claim.Type == ClaimTypes.Role
                 || claim.Type == "role"
                 || claim.Type == "roles"
                 || claim.Type == "realm_access.roles")
                && string.Equals(claim.Value, role, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        foreach (var claim in user.Claims.Where(c => c.Type == "realm_access"))
        {
            try
            {
                using var document = JsonDocument.Parse(claim.Value);
                if (!document.RootElement.TryGetProperty("roles", out var rolesElement)
                    || rolesElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var entry in rolesElement.EnumerateArray())
                {
                    if (entry.ValueKind == JsonValueKind.String
                        && string.Equals(entry.GetString(), role, StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
            }
            catch (JsonException)
            {
                // Ignore malformed role claims and continue checking fallback sources.
            }
        }

        return false;
    }
}
