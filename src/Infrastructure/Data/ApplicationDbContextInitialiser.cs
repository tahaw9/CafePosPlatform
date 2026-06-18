using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.ValueObjects;
using CafePosBackend.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace CafePosBackend.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger, ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {   
            // See https://jasontaylor.dev/ef-core-database-initialisation-strategies
            //await _context.Database.EnsureDeletedAsync();
            //await _context.Database.EnsureCreatedAsync();
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        // Default roles
        var administratorRole = new IdentityRole<Guid>(Roles.Administrator);
        var baristaRole = new IdentityRole<Guid>(Roles.Barista);

        if (_roleManager.Roles.All(r => r.Name != administratorRole.Name))
        {
            await _roleManager.CreateAsync(administratorRole);
        }
        if (_roleManager.Roles.All(r => r.Name != baristaRole.Name))
        {
            await _roleManager.CreateAsync(baristaRole);
        }

        // Default users
        var administrator = new ApplicationUser { UserName = "administrator@localhost", Email = "administrator@localhost", PhoneNumber = "09336439478" };

        if (_userManager.Users.All(u => u.UserName != administrator.UserName))
        {
            await _userManager.CreateAsync(administrator, "Administrator1!");
            if (!string.IsNullOrWhiteSpace(administratorRole.Name))
            {
                await _userManager.AddToRolesAsync(administrator, new [] { administratorRole.Name });
            }
        }

        // Default data
        // Seed, if necessary
        if (!_context.Categories.Any())
        {
            var coffeeId = Guid.Parse("9d5e69a9-6735-454e-9dea-0c3511ede9b0");
            var coldId = Guid.Parse("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");
            var fastfoodId = Guid.Parse("b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e");
            var pizzaId = Guid.Parse("c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f");
            var pastryId = Guid.Parse("d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a");

            _context.Categories.AddRange(
                new Category
                {
                    Id = coffeeId,
                    Name = "قهوه",
                    Icon = "Coffee",
                    Products = new List<Product>
                    {
                        new Product { Id = Guid.NewGuid(), Name = "اسپرسو", Price = 55000, ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", IsAvailable = true, Description = "یک شات اسپرسو خالص", CategoryId = coffeeId },
                        new Product { Id = Guid.NewGuid(), Name = "لاته", Price = 85000, ImageUrl = "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80", IsAvailable = true, Description = "ترکیب اسپرسو و شیر گرم", CategoryId = coffeeId },
                        new Product { Id = Guid.NewGuid(), Name = "کاپوچینو", Price = 90000, ImageUrl = "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80", IsAvailable = false, Description = "اسپرسو با فوم شیر فراوان", CategoryId = coffeeId }
                    }
                },
                new Category
                {
                    Id = coldId,
                    Name = "نوشیدنی سرد",
                    Icon = "GlassWater",
                    Products = new List<Product>
                    {
                        new Product { Id = Guid.NewGuid(), Name = "موخیتو", Price = 110000, ImageUrl = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80", IsAvailable = true, Description = "ترکیب لیمو، نعناع و سودا", CategoryId = coldId },
                        new Product { Id = Guid.NewGuid(), Name = "آیس لاته", Price = 95000, ImageUrl = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", IsAvailable = true, Description = "لاته سرد با یخ", CategoryId = coldId }
                    }
                },
                new Category
                {
                    Id = pizzaId,
                    Name = "پیتزا",
                    Icon = "Pizza",
                    Products = new List<Product>
                    {
                        new Product { Id = Guid.NewGuid(), Name = "پیتزا پپرونی", Price = 350000, ImageUrl = "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", IsAvailable = true, Description = "پیتزا با پپرونی و پنیر فراوان", CategoryId = pizzaId },
                        new Product { Id = Guid.NewGuid(), Name = "پیتزا مارگاریتا", Price = 290000, ImageUrl = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", IsAvailable = true, Description = "پیتزا کلاسیک با گوجه و ریحان", CategoryId = pizzaId }
                    }
                },
                new Category
                {
                    Id = fastfoodId,
                    Name = "فست فود",
                    Icon = "Sandwich",
                    Products = new List<Product>
                    {
                        new Product { Id = Guid.NewGuid(), Name = "برگر کلاسیک", Price = 280000, ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", IsAvailable = true, Description = "برگر گوشت با پنیر، کاهو و گوجه", CategoryId = fastfoodId }
                    }
                },
                new Category
                {
                    Id = pastryId,
                    Name = "شیرینی",
                    Icon = "Croissant",
                    Products = new List<Product>
                    {
                        new Product { Id = Guid.NewGuid(), Name = "کروسان کره‌ای", Price = 75000, ImageUrl = "https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=400&q=80", IsAvailable = true, Description = "کروسان تازه و ترد", CategoryId = pastryId }
                    }
                }
            );
        }

        if (!_context.Tables.Any())
        {
            var defaultTables = Enumerable.Range(1, 12).Select(i => new Table
            {
                Id = Guid.NewGuid(),
                Name = $"میز {i}",
                TableNumber = i,
                Status = TableStatus.Empty
            });
            _context.Tables.AddRange(defaultTables);
        }

        await _context.SaveChangesAsync();
    }
}
