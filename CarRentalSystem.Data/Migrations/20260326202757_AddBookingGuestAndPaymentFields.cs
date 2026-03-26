using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarRentalSystem.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingGuestAndPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Bookings",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "ConfirmationCode",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Bookings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "GuestEmail",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestPhone",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentStatus",
                table: "Bookings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "StripeSessionId",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ConfirmationCode",
                table: "Bookings",
                column: "ConfirmationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_StripeSessionId",
                table: "Bookings",
                column: "StripeSessionId",
                unique: true,
                filter: "\"StripeSessionId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_ConfirmationCode",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_StripeSessionId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ConfirmationCode",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestEmail",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "GuestPhone",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StripeSessionId",
                table: "Bookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Bookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
