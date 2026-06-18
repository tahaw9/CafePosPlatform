using Aspire.Hosting.Docker;
using CafePosBackend.Shared;

var builder = DistributedApplication.CreateBuilder(args);

IResourceBuilder<DockerComposeEnvironmentResource> env = builder.AddDockerComposeEnvironment("env");

var databaseServer = builder
    .AddPostgres(Services.DatabaseServer)
    .WithDataVolume()
    .WithPgAdmin()
    .WithLifetime(ContainerLifetime.Persistent)
    .AddDatabase(Services.Database);

var web = builder.AddProject<Projects.Web>(Services.WebApi)
    .WithReference(databaseServer)
    .WaitFor(databaseServer)
    .WithExternalHttpEndpoints()
    .WithAspNetCoreEnvironment()
    .WithUrlForEndpoint("http", url =>
    {
        url.DisplayText = "Scalar API Reference";
        url.Url = "/scalar";
    });

if (builder.ExecutionContext.IsRunMode)
{
    builder.AddJavaScriptApp(Services.WebFrontend, "./../Web/ClientApp")
        .WithRunScript("dev")
        .WithReference(web)
        .WaitFor(web)
        .WithHttpEndpoint(env: "PORT")
        .WithExternalHttpEndpoints();
}

builder.Build().Run();
