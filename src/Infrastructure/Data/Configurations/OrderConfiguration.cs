using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;
using CafePosBackend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafePosBackend.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder
            .Property(o => o.Status)
            .HasConversion<string>();

        builder
            .Property(o => o.DiscountType)
            .HasConversion<string>();

        builder
            .Property(o => o.PaymentMethod)
            .HasConversion<string>();

        builder
        .HasIndex(o => o.Created)
        .IncludeProperties(o => o.OrderCode);
    }
}
