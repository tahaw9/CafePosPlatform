using System;
using System.Collections.Generic;
using System.Text;

namespace CafePosBackend.Application.Common.Models;

public class BaseResponsePagination<T>
{
    public int PageNumber { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
    public T? Data { get; set; }
}
