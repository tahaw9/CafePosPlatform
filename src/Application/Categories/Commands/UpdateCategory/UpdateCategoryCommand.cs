using CafePosBackend.Application.Common.Exceptions;
using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Application.Common.Security;
using CafePosBackend.Domain.Constants;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Categories.Commands.UpdateCategory;

[Authorize(Roles = Roles.Administrator)]
public record UpdateCategoryCommand : IRequest<CategoryDto>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public int DisplayOrder { get; init; }
}

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("شناسه دسته‌بندی معتبر نیست.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("نام دسته‌بندی را وارد کنید.")
            .MaximumLength(100).WithMessage("حداکثر طول نام دسته‌بندی 100 کاراکتر است.");

        RuleFor(v => v.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("ترتیب نمایش باید بزرگتر یا مساوی صفر باشد.");
    }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(Category), request.Id.ToString());
        }

        var trimmedName = request.Name.Trim();

        var duplicateExists = await _context.Categories
            .AnyAsync(c => c.Id != request.Id && c.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictException($"دسته‌بندی دیگری با نام '{trimmedName}' قبلاً ثبت شده است.");
        }

        entity.Name = trimmedName;
        if (!string.IsNullOrWhiteSpace(request.Icon))
        {
            entity.Icon = request.Icon;
        }
        entity.DisplayOrder = request.DisplayOrder;

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CategoryDto>(entity);
    }
}
