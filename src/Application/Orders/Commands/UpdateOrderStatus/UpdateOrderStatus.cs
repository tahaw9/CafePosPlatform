using CafePosBackend.Application.Common.Interfaces;
using CafePosBackend.Domain.Enums;

namespace CafePosBackend.Application.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public OrderStatus Status { get; set; }
}

public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        //RuleFor(x => x.Status)
        //    .NotNull()
        //    .NotEmpty();
    }
}

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders.FindAsync(new object[] { request.Id }, cancellationToken);

        if(entity == null)
        {
            throw new NullReferenceException("order not found");
        }

        entity.Status = request.Status;
        _context.Orders.Update(entity);
        int rowsAffected = await _context.SaveChangesAsync(cancellationToken);
        return rowsAffected > 0;
    }
}
