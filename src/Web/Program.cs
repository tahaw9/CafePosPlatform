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
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
}
else
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

app.UseFileServer();

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
