using System;
using System.Collections.Generic;
using System.Text;
using CafePosBackend.Application.Common.Models;

namespace CafePosBackend.Application.Common.Generics.Queries.PaginationQuery;

public abstract record PaginationQuery<TFilter, TResult> : IRequest<BaseResponsePagination<IEnumerable<TResult>>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public TFilter? Filters { get; set; }
}
