var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");

var postgres = builder.AddPostgres("postgres")
    .AddDatabase("car-rental-system-db");

var keycloak = builder.AddKeycloak("keycloak", 8080)
    .WithRealmImport("./Realms")
    .WithDataVolume();

var migrations = builder.AddProject<Projects.CarRentalSystem_MigrationService>("migrations")
    .WithReference(postgres)
    .WaitFor(postgres);

var server = builder.AddProject<Projects.CarRentalSystem_Server>("server")
    .WithReference(postgres)
    .WithReference(cache)
    .WithReference(migrations)
    .WaitFor(migrations)
    .WithReference(keycloak)
    .WaitFor(keycloak)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints()
    .WithUrlForEndpoint("https", url =>
    {
        url.DisplayText = "Scalar API Docs";
        url.Url = "/scalar/v1";
    });

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithExternalHttpEndpoints()
    .WithReference(keycloak)
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
