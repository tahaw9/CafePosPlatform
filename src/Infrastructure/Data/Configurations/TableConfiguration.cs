using CafePosBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafePosBackend.Infrastructure.Data.Configurations;

public class TableConfiguration : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder
            .Property(t => t.Status)
            .HasConversion<string>();

        builder
            .Property(t => t.Name)
            .HasMaxLength(100);

        builder
            .HasQueryFilter(t => !t.IsDeleted);

        builder
            .HasIndex(t => t.TableNumber);
    }
}
