using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using CarRentalSystem.Server.Configuration;
using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace CarRentalSystem.Server.Services;

public class KeycloakAdminClient : IKeycloakAdminClient
{
    private readonly HttpClient _httpClient;
    private readonly KeycloakAdminOptions _options;
    private readonly ILogger<KeycloakAdminClient> _logger;

    private readonly SemaphoreSlim _tokenLock = new(1, 1);
    private string? _cachedToken;
    private DateTimeOffset _tokenExpiresAt = DateTimeOffset.MinValue;

    public KeycloakAdminClient(
        HttpClient httpClient,
        IOptions<KeycloakAdminOptions> options,
        ILogger<KeycloakAdminClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        if (_httpClient.BaseAddress is null)
        {
            _httpClient.BaseAddress = new Uri("http://keycloak");
        }
    }

    public async Task ClearUserAttributeAsync(Guid userId, string attributeName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(attributeName))
        {
            throw new ArgumentException("Attribute name is required.", nameof(attributeName));
        }

        var userPath = $"admin/realms/{_options.Realm}/users/{userId}";

        var token = await GetAccessTokenAsync(cancellationToken);

        using var getRequest = new HttpRequestMessage(HttpMethod.Get, userPath);
        getRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var getResponse = await _httpClient.SendAsync(getRequest, cancellationToken);
        if (getResponse.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning(
                "Keycloak user {UserId} not found while clearing attribute {AttributeName}; skipping.",
                userId,
                attributeName);
            return;
        }

        getResponse.EnsureSuccessStatusCode();

        var userJson = await getResponse.Content.ReadAsStringAsync(cancellationToken);
        var userNode = JsonNode.Parse(userJson)?.AsObject()
            ?? throw new InvalidOperationException("Keycloak returned an empty user representation.");

        if (userNode["attributes"] is JsonObject attributes && attributes.ContainsKey(attributeName))
        {
            attributes.Remove(attributeName);
        }
        else
        {
            return;
        }

        using var putRequest = new HttpRequestMessage(HttpMethod.Put, userPath)
        {
            Content = JsonContent.Create(userNode),
        };
        putRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        using var putResponse = await _httpClient.SendAsync(putRequest, cancellationToken);
        putResponse.EnsureSuccessStatusCode();

        _logger.LogInformation(
            "Cleared attribute {AttributeName} on Keycloak user {UserId}.",
            attributeName,
            userId);
    }

    private async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        if (_cachedToken is not null && DateTimeOffset.UtcNow < _tokenExpiresAt)
        {
            return _cachedToken;
        }

        await _tokenLock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedToken is not null && DateTimeOffset.UtcNow < _tokenExpiresAt)
            {
                return _cachedToken;
            }

            if (string.IsNullOrWhiteSpace(_options.AdminClientSecret))
            {
                throw new InvalidOperationException(
                    "Keycloak:AdminClientSecret is not configured. Set it in user-secrets or appsettings.Development.json.");
            }

            var tokenPath = $"realms/{_options.Realm}/protocol/openid-connect/token";
            using var request = new HttpRequestMessage(HttpMethod.Post, tokenPath)
            {
                Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("client_id", _options.AdminClientId),
                    new KeyValuePair<string, string>("client_secret", _options.AdminClientSecret),
                }),
            };

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: cancellationToken)
                ?? throw new InvalidOperationException("Keycloak returned an empty token response.");

            _cachedToken = payload.AccessToken;
            _tokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(Math.Max(30, payload.ExpiresIn - 30));

            return _cachedToken;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private sealed record TokenResponse(
        [property: System.Text.Json.Serialization.JsonPropertyName("access_token")] string AccessToken,
        [property: System.Text.Json.Serialization.JsonPropertyName("expires_in")] int ExpiresIn);
}
