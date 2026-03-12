namespace CarRentalSystem.Server.Extensions;

public static class KeycloakAuthExtensions
{
    public static IHostApplicationBuilder AddKeycloakAuth(this IHostApplicationBuilder builder)
    {
        builder.Services.AddAuthentication()
            .AddKeycloakJwtBearer(
                serviceName: "keycloak",
                realm: "car-rental",
                options =>
                {
                    options.Audience = "carrental-api";

                    if (builder.Environment.IsDevelopment())
                    {
                        options.RequireHttpsMetadata = false;
                    }
                });

        builder.Services.AddAuthorizationBuilder()
            .AddPolicy("CustomerOnly", policy => policy.RequireClaim("customer"))
            .AddPolicy("EmployeeOnly", policy => policy.RequireClaim("employee"))
            .AddPolicy("AdminOnly", policy => policy.RequireClaim("admin"))
            .AddPolicy("StaffOrAdmin", policy => policy.RequireClaim("employee", "admin"));
        
        return builder;
    }
}