using CafePosBackend.Application.Common.Interfaces;

namespace CafePosBackend.Application.Categories.Commands.CreateCategory;

public record CreateCategoryCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
}

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("نام دسته بندی را وارد کنید.")
            .MaximumLength(100).WithMessage("حداکثر طول این فیلد 100 کاراکتر است.");
    }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = new CafePosBackend.Domain.Entities.Category
        {
            Name = request.Name,
            Id = Guid.NewGuid()
        };

        _context.Categories.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
