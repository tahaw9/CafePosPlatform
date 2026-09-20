using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Infrastructure.Data;
using CafePosBackend.Infrastructure.Data.Interceptors;
using CafePosBackend.Infrastructure.Identity;
using CafePosBackend.Infrastructure.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString(Services.Database);
        Guard.Against.Null(connectionString, message: $"Connection string '{Services.Database}' not found.");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseNpgsql(connectionString, builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

        builder.EnrichNpgsqlDbContext<ApplicationDbContext>();

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        var keysFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".aspnet",
            "DataProtection-Keys");

        builder.Services.AddDataProtection()
            .SetApplicationName("CafePosBackend")
            .PersistKeysToFileSystem(new DirectoryInfo(keysFolder));

        builder.Services.AddAuthentication(options =>
        {
            // Set a virtual default scheme that will decide between Cookie and Bearer
            options.DefaultScheme = "Identity_Combined";
        })
        .AddPolicyScheme("Identity_Combined", "Identity_Combined", options =>
        {
            options.ForwardDefaultSelector = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return IdentityConstants.BearerScheme;
                }

                // SignalR sends the token as a query string parameter
                // because WebSockets can't send HTTP headers after the handshake.
                if (context.Request.Query.ContainsKey("access_token") &&
                    context.Request.Path.StartsWithSegments("/hubs"))
                {
                    return IdentityConstants.BearerScheme;
                }

                // All API endpoints (/api/...) should default to BearerScheme so unauthenticated requests
                // return 401 Unauthorized rather than issuing a 302 redirect to /Account/Login
                if (context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/hubs"))
                {
                    return IdentityConstants.BearerScheme;
                }

                return IdentityConstants.ApplicationScheme;
            };
        })
        .AddBearerToken(IdentityConstants.BearerScheme, options =>
        {
            // Extend token expiration to 14 days so staff sessions do not expire mid-shift
            options.BearerTokenExpiration = TimeSpan.FromDays(14);
            options.RefreshTokenExpiration = TimeSpan.FromDays(30);
            options.Events = new()
            {
                OnMessageReceived = context =>
                {
                    // Read the token from the query string for SignalR WebSocket requests
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };
        })
        .AddIdentityCookies();

        // Ensure Cookie authentication never issues a 302 redirect for API/AJAX requests
        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });


        builder.Services.AddAuthorizationBuilder()
            .SetDefaultPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder(
                IdentityConstants.ApplicationScheme,
                IdentityConstants.BearerScheme)
            .RequireAuthenticatedUser()
            .Build());


        builder.Services
            .AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders()
            .AddApiEndpoints();

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();
        builder.Services.AddTransient<IFileStorageService, LocalFileStorageService>();
    }
}
