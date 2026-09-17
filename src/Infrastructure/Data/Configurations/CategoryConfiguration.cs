using CafePosBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafePosBackend.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder
            .Property(c => c.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder
            .HasQueryFilter(c => !c.IsDeleted);

        builder
            .HasIndex(c => c.DisplayOrder);
    }
}
