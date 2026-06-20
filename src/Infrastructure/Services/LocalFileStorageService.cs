using CafePosBackend.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace CafePosBackend.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IWebHostEnvironment env, ILogger<LocalFileStorageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<string> SaveBase64ImageAsync(string base64Image, string directory)
    {
        try
        {
            // The base64 string might contain data:image/png;base64, prefix. We need to remove it.
            var base64Data = Regex.Match(base64Image, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
            var ext = Regex.Match(base64Image, @"data:image/(?<type>.+?),(?<data>.+)").Groups["type"].Value;
            
            if (string.IsNullOrEmpty(base64Data))
            {
                // Fallback in case there is no prefix
                base64Data = base64Image;
                ext = "jpg"; // default extension
            }
            
            if (ext.Contains(";"))
            {
                ext = ext.Split(';')[0];
            }

            var bytes = Convert.FromBase64String(base64Data);
            
            var fileName = $"{Guid.NewGuid()}.{ext}";
            var folderPath = Path.Combine(_env.WebRootPath, directory.TrimStart('/'));
            
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var filePath = Path.Combine(folderPath, fileName);
            await File.WriteAllBytesAsync(filePath, bytes);

            // Return relative path for HTTP access
            return $"/{directory.Trim('/')}/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save base64 image.");
            throw;
        }
    }

    public void DeleteImage(string relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return;

        try
        {
            var filePath = Path.Combine(_env.WebRootPath, relativeUrl.TrimStart('/'));
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete image at {Url}", relativeUrl);
        }
    }
}
