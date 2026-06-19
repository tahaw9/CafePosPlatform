using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafePosBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexToOrdersCreated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Orders_Created",
                table: "Orders",
                column: "Created")
                .Annotation("Npgsql:IndexInclude", new[] { "OrderCode" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Orders_Created",
                table: "Orders");
        }
    }
}
