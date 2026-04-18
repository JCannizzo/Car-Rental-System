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
            .AddPolicy("CustomerOnly", policy => policy.RequireAssertion(context => context.User.HasRealmRole("customer")))
            .AddPolicy("EmployeeOnly", policy => policy.RequireAssertion(context => context.User.HasRealmRole("employee")))
            .AddPolicy("AdminOnly", policy => policy.RequireAssertion(context => context.User.HasRealmRole("admin")))
            .AddPolicy("StaffOrAdmin", policy => policy.RequireAssertion(context =>
                context.User.HasRealmRole("employee") || context.User.HasRealmRole("admin")));
        
        return builder;
    }
}
