# Phase 2: API Endpoints (Controllers) Roadmap

This document outlines the REST API endpoints needed for the React frontend, mappings between HTTP verbs and Controller routes. It relies on the entities and DTOs established in Phase 1.

## 1. Auth & Users (`AuthController` / `UsersController`)

These endpoints manage login, session creation, and staff administration.

### **POST** `/api/auth/login`
- **Request:** `LoginRequest` (phone, password)
- **Response:** `AuthResponse` (JWT Token, UserDto)
- **Description:** Authenticate users and return a JWT token for subsequent requests.

### **GET** `/api/users/me`
- **Request:** None (Requires JWT)
- **Response:** `UserDto`
- **Description:** Get the profile of the currently logged in user based on the token.

### **GET** `/api/users`
- **Request:** None (Requires `[Authorize(Roles = "Admin")]`)
- **Response:** `List<UserDto>`
- **Description:** Retrieve all registered staff/users.

### **POST** `/api/users`
- **Request:** `CreateUserRequest`
- **Response:** `UserDto`
- **Description:** Create a new staff member (Admin only).

---

## 2. Menu Management (`ProductsController` & `CategoriesController`)

### **GET** `/api/categories`
- **Request:** None
- **Response:** `List<CategoryDto>`
- **Description:** Get all available menu categories.

### **GET** `/api/products`
- **Request:** None
- **Response:** `List<ProductDto>`
- **Description:** Get all products, optionally querying by category or availability.

### **POST** `/api/products`
- **Request:** `CreateProductRequest`
- **Response:** `ProductDto`
- **Description:** Create a new product. (Admin only)

### **PUT** `/api/products/{id}`
- **Request:** `UpdateProductRequest`
- **Response:** `ProductDto`
- **Description:** Update an existing product, such as changing price, image, or description. (Admin only)

### **PATCH** `/api/products/{id}/availability`
- **Request:** `{ isAvailable: boolean }`
- **Response:** `ProductDto`
- **Description:** Quickly toggle whether a product is available or not. (Admin/Barista)

### **DELETE** `/api/products/{id}`
- **Request:** None
- **Response:** `204 No Content`
- **Description:** Delete a product from the inventory. (Admin only)

---

## 3. Order processing (`OrdersController`)

### **GET** `/api/orders`
- **Request:** Optional query params like `?status=pending` or `?date=2026-05-10`
- **Response:** `List<OrderDto>`
- **Description:** Get all orders based on query parameters. Used for reporting or POS order view.

### **GET** `/api/orders/{id}`
- **Request:** None
- **Response:** `OrderDto`
- **Description:** Fetch the details and items of a specific order.

### **POST** `/api/orders`
- **Request:** `CreateOrderRequest`
- **Response:** `OrderDto` (Returns created order)
- **Description:** Create a new order, originating either from the customer menu or POS.

### **PATCH** `/api/orders/{id}/status`
- **Request:** `UpdateOrderStatusRequest` (Status: pending, preparing, completed, cancelled)
- **Response:** `OrderDto`
- **Description:** Update the fulfillment status of the order.

### **PATCH** `/api/orders/{id}/pay`
- **Request:** `PayOrderRequest` (PaymentMethod, Discount details)
- **Response:** `OrderDto`
- **Description:** Mark the order as paid, apply final discounts, set payment method.

---

## 4. Tables & Infrastructure (`TablesController`)

### **GET** `/api/tables`
- **Request:** None
- **Response:** `List<TableDto>`
- **Description:** Current state and status of all tables.

### **PATCH** `/api/tables/{id}/status`
- **Request:** `{ status: 'empty' | 'occupied' | 'waiter_called' }`
- **Response:** `TableDto`
- **Description:** Update the current status of a specific table.

---

## Next Steps
This defines the Controller-level routing for the API. When Phase 3 starts, it will guide modifying the React application to replace the Zustand `fetch/add/update` mock logic with actual HTTP requests using `axios` or `fetch` connecting to these endpoints. Please review and approve!
