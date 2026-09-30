using System;
using AutoMapper;
using CafePosBackend.Domain.Entities;

namespace CafePosBackend.Application.Extras;

public class ExtraDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public int DisplayOrder { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Extra, ExtraDto>();
        }
    }
}
