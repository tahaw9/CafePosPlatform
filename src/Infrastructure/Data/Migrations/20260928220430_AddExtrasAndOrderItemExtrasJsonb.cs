using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafePosBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddExtrasAndOrderItemExtrasJsonb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Extras",
                table: "OrderItems",
                type: "jsonb",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Extras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Created = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModified = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Extras", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Extras_DisplayOrder",
                table: "Extras",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Extras_IsAvailable",
                table: "Extras",
                column: "IsAvailable");

            migrationBuilder.CreateIndex(
                name: "IX_Extras_IsDeleted",
                table: "Extras",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Extras");

            migrationBuilder.DropColumn(
                name: "Extras",
                table: "OrderItems");
        }
    }
}
