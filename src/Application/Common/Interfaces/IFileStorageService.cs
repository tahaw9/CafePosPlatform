namespace CafePosBackend.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Saves a base64 encoded image to the storage and returns the URL.
    /// </summary>
    Task<string> SaveBase64ImageAsync(string base64Image, string directory);

    /// <summary>
    /// Deletes an image from the storage using its relative URL.
    /// </summary>
    void DeleteImage(string relativeUrl);
}
