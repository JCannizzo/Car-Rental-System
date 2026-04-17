var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var postgres = builder.AddPostgres("postgres")
    .AddDatabase("car-rental-system-db");

var keycloakThemeDir = Path.GetFullPath(
    Path.Combine(builder.AppHostDirectory, "..", "keycloak-theme", "dist_keycloak"));

var keycloak = builder.AddKeycloak("keycloak", 8080)
    .WithRealmImport("./Realms")
    .WithDataVolume();

if (Directory.Exists(keycloakThemeDir))
{
    keycloak.WithBindMount(keycloakThemeDir, "/opt/keycloak/providers", isReadOnly: true);
}

var migrations = builder.AddProject<Projects.CarRentalSystem_MigrationService>("migrations")
    .WithReference(postgres)
    .WaitFor(postgres);

var stripeApiKey = builder.AddParameter("stripe-api-key", secret: true);

var server = builder.AddProject<Projects.CarRentalSystem_Server>("server")
    .WithReference(postgres)
    .WithReference(cache)
    .WithReference(migrations)
    .WaitFor(migrations)
    .WithReference(keycloak)
    .WaitFor(keycloak)
    .WithEndpoint("http", endpoint => endpoint.Port = 5200)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints()
    .WithUrlForEndpoint("https", url =>
    {
        url.DisplayText = "Scalar API Docs";
        url.Url = "/scalar/v1";
    });

var webhookEndpoint = builder.AddExternalService("stripe-webhook-target",
    new Uri("http://host.docker.internal:5200"));

var stripe = builder.AddStripe("stripe", stripeApiKey)
    .WithListen(webhookEndpoint, webhookPath: "api/payments/webhook",
        events: ["checkout.session.completed"]);

server.WithReference(stripe)
    .WithEnvironment("STRIPE_API_KEY", stripeApiKey);

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithEndpoint("http", endpoint =>
    {
        endpoint.Port = 5173;
        endpoint.TargetPort = 5173;
        endpoint.IsExternal = true;
        endpoint.IsProxied = false;
    })
    .WithReference(keycloak)
    .WithReference(server)
    .WaitFor(server);

server.WithEnvironment("FrontendUrl", webfrontend.GetEndpoint("http"));
server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
