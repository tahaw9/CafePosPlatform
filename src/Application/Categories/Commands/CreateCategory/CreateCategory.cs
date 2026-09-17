using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Categories.Commands.CreateCategory;

[Authorize(Roles = Roles.Administrator)]
public record CreateCategoryCommand : IRequest<CategoryDto>
{
    public string Name { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public int? DisplayOrder { get; init; }
}

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("نام دسته‌بندی را وارد کنید.")
            .MaximumLength(100).WithMessage("حداکثر طول نام دسته‌بندی 100 کاراکتر است.");

        RuleFor(v => v.DisplayOrder)
            .GreaterThanOrEqualTo(0).When(v => v.DisplayOrder.HasValue)
            .WithMessage("ترتیب نمایش باید بزرگتر یا مساوی صفر باشد.");
    }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var trimmedName = request.Name.Trim();

        var exists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (exists)
        {
            throw new ConflictException($"دسته‌بندی با نام '{trimmedName}' قبلاً ثبت شده است.");
        }

        int displayOrder;
        if (request.DisplayOrder.HasValue && request.DisplayOrder.Value > 0)
        {
            displayOrder = request.DisplayOrder.Value;
        }
        else
        {
            var maxOrder = await _context.Categories.MaxAsync(c => (int?)c.DisplayOrder, cancellationToken) ?? 0;
            displayOrder = maxOrder + 1;
        }

        var entity = new Category
        {
            Id = Guid.NewGuid(),
            Name = trimmedName,
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "Coffee" : request.Icon,
            DisplayOrder = displayOrder
        };

        _context.Categories.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryDto>(entity);
    }
}
