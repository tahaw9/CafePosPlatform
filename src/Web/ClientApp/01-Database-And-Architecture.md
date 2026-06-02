# Phase 1: Database Models & Architecture Roadmap

This document outlines the first phase of migrating the React frontend's mock state to a robust .NET Core backend. We will map the frontend interfaces from Zustand stores (`useMenuStore`, `useOrderStore`, `useAuthStore`, `useCartStore`) to Entity Framework Core entities, DTOs, and recommend a folder structure.

## 1. Suggested Architecture & Folder Structure

We recommend using a simplified **Clean Architecture** or **N-Tier Architecture**. Since this is an API feeding a React frontend, standardizing around the following directory structure is ideal:

```
src/
 ├── CafeSystem.Api/             # Main API Project (Controllers/Minimal APIs, Program.cs, Middleware)
 ├── CafeSystem.Application/     # Business logic, Services, Interfaces, AutoMapper Profiles, DTOs
 ├── CafeSystem.Domain/          # Core EF Entities, Enums, Exceptions
 └── CafeSystem.Infrastructure/  # EF Core DbContext, Migrations, Repositories
```

Alternatively, for smaller applications, a vertical slice or single-project structure with folders (`/Entities`, `/DTOs`, `/Services`, `/Controllers`, `/Data`) is perfectly fine. Below assumes standard separation of concerns.

---

## 2. Domain Entities (Entity Framework Core Models)

Based on the frontend types, here are the C# Domain Entities.

### Enums

```csharp
public enum UserRole { Admin, Barista }
public enum OrderStatus { Pending, Preparing, Completed, Cancelled }
public enum PaymentMethod { Card, Cash, Transfer }
public enum TableStatus { Empty, Occupied, WaiterCalled }
public enum DiscountType { Percentage, Amount }
```

### `User` (from `useAuthStore`)
```csharp
public class User 
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty; // Also acts as Username
    public string PasswordHash { get; set; } = string.Empty; // Required for backend auth
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
}
```

### `Category` (from `useMenuStore`)
```csharp
public class Category 
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;

    // Navigation property
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
```

### `Product` (MenuItem from `useMenuStore`)
```csharp
public class Product 
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }

    // Foreign Keys
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
```

### `Table` (from `useOrderStore`)
```csharp
public class Table 
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TableStatus Status { get; set; }
}
```

### `Order` & `OrderItem` (from `useOrderStore` & `useCartStore`)
```csharp
public class Order 
{
    public Guid Id { get; set; }

    // Nullable Guid for TableId, if null, means 'takeaway'
    public Guid? TableId { get; set; }
    public Table? Table { get; set; }

    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }

    // Discount details
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }

    public PaymentMethod? PaymentMethod { get; set; }
    public bool IsPaid { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}

public class OrderItem 
{
    public Guid Id { get; set; }
    
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    // Snapshots (Storing name and price securely in case menu changes later)
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    
    public int Quantity { get; set; }
    public string? Note { get; set; }
}
```

---

## 3. Data Transfer Objects (DTOs)

To keep the API clean and separate database entities from what the frontend receives/sends, we recommend the following DTOs mapping.

### Response DTOs (Sent to Frontend)
- `UserDto` (Id, Name, Phone, Role, IsActive)
- `CategoryDto` (Id, Name, Icon)
- `ProductDto` (Id, Name, Price, ImageUrl, IsAvailable, CategoryId, Description)
- `TableDto` (Id, Name, Status)
- `OrderDto` (Id, TableId, Items, Status, Total, Discount, PaymentMethod, IsPaid, CreatedAt, UpdatedAt)
- `OrderItemDto` (ProductId, Name, Price, Quantity, Note)

### Request DTOs (Received from Frontend)

**Auth**
- `LoginRequest` (Phone, Password)
- `CreateUserRequest` (Name, Phone, Role, Password)

**Menu**
- `CreateProductRequest` / `UpdateProductRequest` (Name, Price, ImageUrl, CategoryId, Description, IsAvailable)

**Orders**
- `CreateOrderRequest`
  - `TableId` (string or null for takeaway)
  - `Items` (List of `{ ProductId, Quantity, Note }`)
- `UpdateOrderStatusRequest` (Status)
- `PayOrderRequest` (PaymentMethod, DiscountType?, DiscountValue?)

---

## Next Steps

This covers the Database layer modeling, ensuring it perfectly complements the Zustand stores you built on the frontend. 

**If this Phase 1 structure looks good, please confirm and we will proceed to Phase 2: Generating the Controller Roadmap and API specifications.**
