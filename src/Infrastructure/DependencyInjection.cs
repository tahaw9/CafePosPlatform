using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Infrastructure.Data;
using CafePosBackend.Infrastructure.Data.Interceptors;
using CafePosBackend.Infrastructure.Identity;
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

        //builder.Services.AddAuthentication(options =>
        //    {
        //        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        //        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
        //    })
        //    .AddBearerToken(IdentityConstants.BearerScheme)
        //    .AddIdentityCookies();

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

                return IdentityConstants.ApplicationScheme;
            };
        })
        .AddBearerToken(IdentityConstants.BearerScheme, options =>
        {
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
    }
}
