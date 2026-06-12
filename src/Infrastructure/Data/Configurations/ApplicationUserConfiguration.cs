using System;
using System.Collections.Generic;
using System.Text;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CafePosBackend.Infrastructure.Data.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder
            .Property(u => u.PhoneNumber)
            .IsRequired();
        builder
            .Property(u => u.FullName)
            .HasMaxLength(100);
    }
}
