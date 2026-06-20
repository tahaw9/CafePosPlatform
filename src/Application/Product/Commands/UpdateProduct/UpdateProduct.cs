using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Product.Commands.UpdateProduct;

public record UpdateProductCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Base64Image { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public Guid CategoryId { get; set; }
}

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty).WithMessage("Product ID is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100).WithMessage("Product name is required and must be less than 100 characters.");
        RuleFor(x => x.Price).GreaterThan(1000).WithMessage("Product price must be a positive value and greater than 1000.");
        RuleFor(x => x.CategoryId).NotEqual(Guid.Empty).WithMessage("Category ID is required.");
    }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public UpdateProductCommandHandler(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var getEntity = await _context.Products.FindAsync(new object[] { request.Id }, cancellationToken);
        if(getEntity == null) { throw new NullReferenceException("Product not found"); }

        if (!string.IsNullOrEmpty(request.Base64Image))
        {
            if (!string.IsNullOrEmpty(getEntity.ImageUrl))
            {
                _fileStorageService.DeleteImage(getEntity.ImageUrl);
            }
            getEntity.ImageUrl = await _fileStorageService.SaveBase64ImageAsync(request.Base64Image, "/images/products");
        }

        getEntity.Name = request.Name;
        getEntity.CategoryId = request.CategoryId;
        getEntity.IsAvailable = request.IsAvailable;
        getEntity.Price = request.Price;
        getEntity.Description = request.Description;    

        _context.Products.Update(getEntity);

        int rowsAffected = await _context.SaveChangesAsync(cancellationToken);

        return rowsAffected > 0;
    }
}
