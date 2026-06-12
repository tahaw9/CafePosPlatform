using CafePosBackend.Domain.Entities;
using AutoMapper;

namespace CafePosBackend.Application.Tables.Queries.GetTables;

public class TableDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "empty";

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Table, TableDto>()
                .ForMember(d => d.Status, opt => opt.MapFrom(s => 
                    s.Status == TableStatus.Empty ? "empty" :
                    s.Status == TableStatus.Occupied ? "occupied" :
                    s.Status == TableStatus.WaiterCalled ? "waiter_called" : "empty"));
        }
    }
}
