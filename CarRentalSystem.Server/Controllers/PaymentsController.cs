using CarRentalSystem.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarRentalSystem.Server.Controllers;

/// <summary>
/// Handles payment provider webhooks.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Tags("Payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Stripe webhook endpoint. Receives events like checkout.session.completed.
    /// </summary>
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var payload = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var signature = Request.Headers["Stripe-Signature"].ToString();

        var success = await _paymentService.HandleWebhookAsync(payload, signature);
        return success ? Ok() : BadRequest();
    }
}
