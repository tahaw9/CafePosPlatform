using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Common.Models;

public class LookupDto
{
    public int Id { get; init; }

    public string? Title { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TodoList, LookupDto>()
                .ForMember(d => d.Id, opt => opt.Ignore());
            CreateMap<TodoItem, LookupDto>()
                .ForMember(d => d.Id, opt => opt.Ignore());
        }
    }
}
