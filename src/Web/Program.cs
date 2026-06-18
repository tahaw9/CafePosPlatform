using CafePosBackend.Infrastructure.Data;
using CafePosBackend.Web.Hubs;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddServiceDefaults();

builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
// Always run migrations on startup (useful for containerized deployments)
if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("RUN_MIGRATIONS") == "true")
{
    await app.InitialiseDatabaseAsync();
}

if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors(static corsBuilder =>
    corsBuilder
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()                // Required for SignalR WebSockets
        .SetIsOriginAllowed(_ => true));   // For production, replace with .WithOrigins("https://yourdomain.com")

app.UseFileServer(new FileServerOptions
{
    StaticFileOptions =
    {
        OnPrepareResponse = ctx =>
        {
            // Cache static files (like images, JS, CSS) for 7 days to dramatically improve load times
            ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=604800");
        }
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseExceptionHandler(options => { });


app.MapDefaultEndpoints();
app.MapEndpoints(typeof(Program).Assembly);

// Map SignalR Hub endpoint
app.MapHub<CafeHub>("/hubs/cafeHub");

app.MapFallbackToFile("index.html");

app.Run();
