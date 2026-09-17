# Graph Report - .  (2026-09-06)

## Corpus Check
- 285 files · ~82,297 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1844 nodes · 3123 edges · 151 communities (127 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- TodoList Functional Test Suite
- Web Acceptance and Counter Tests
- Auditable Entities and Interceptors
- SignalR Hubs and Order Notifications
- Web Acceptance and Counter Tests
- System Architecture and Docker Setup
- Weather Forecast API Samples
- Product Catalog and Pagination
- Admin POS Layout and Guard Routes
- Dining Table State and Service
- Todo Entity Domain Models
- Waiter Call FAB and Navigation
- Category Management and DTOs
- Customer Cart and Order Client
- Identity and Account Services
- Identity and Account Services
- Aspire Launch Configuration
- Admin POS Layout and Guard Routes
- POS Modal Components and Receipts
- Category Management and DTOs
- Todo Entity Domain Models
- TodoList Functional Test Suite
- Identity and Account Services
- Web Acceptance and Counter Tests
- TypeScript Build Configuration
- Order Processing and Order Items
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Aspire Launch Configuration
- AddIndexToOrdersCreated Infrastructure Data
- Identity and Account Services
- Todo Entity Domain Models
- PayOrder DiscountType PaymentMethod
- Todo Entity Domain Models
- CAFEPOSBACKENDDB OTEL OTLP
- DependencyInjection Extensions Microsoft
- System Architecture and Docker Setup
- UpdateProduct IFileStorageService Application
- OneTimeSetUp OneTimeTearDown ILoggerFactory
- Order Processing and Order Items
- UnpaidOrders FlagAsUnpaid GetUnpaidOrders
- Identity and Account Services
- Identity and Account Services
- Identity and Account Services
- Product Catalog and Pagination
- AdminUnpaidOrders useUnpaidOrderStore unpaidOrderService
- Application FunctionalTests TestBase
- Order Processing and Order Items
- Order Processing and Order Items
- Todo Entity Domain Models
- ApplicationDbContextInitialiser RoleManager InitialiseAsync
- Todo Entity Domain Models
- UnpaidOrders Application Web
- Mock Process CancellationToken
- type manifest json
- TodosVm GetTodos GetTodosQuery
- Order OrderConfiguration DiscountType
- Client Dependencies and Package Config
- System Architecture and Docker Setup
- Todo Entity Domain Models
- AuthorizationBehaviour AuthorizeAttribute Attribute
- Todo Entity Domain Models
- Identity and Account Services
- OneTimeSetUp OneTimeTearDown DatabaseResetter
- Microsoft Build Core
- Domain Microsoft NET
- POSTGRES connectionString env
- type value inputs
- Product Catalog and Pagination
- GetUnpaidOrders GetUnpaidOrdersQuery GetUnpaidOrdersQueryHandler
- Todo Entity Domain Models
- Web DependencyInjection Services
- Order Processing and Order Items
- DbConnection IAsyncDisposable Respawner
- IEndpointRouteBuilder RouteHandlerBuilder EndpointRouteBuilderExtensions
- Todo Entity Domain Models
- Web Acceptance and Counter Tests
- https external protocol
- otlp grpc bindings
- Todo Entity Domain Models
- MethodInfoExtensions char IGuardClause
- Application Common Behaviours
- DeleteProduct Application Product
- Identity and Account Services
- ForbiddenAccessException ValidationException UnsupportedColourException
- ProblemDetailsExceptionHandler HttpContext IExceptionHandler
- IUser List IHttpContextAccessor
- ApiExceptionOperationTransformer IOpenApiOperationTransformer TransformAsync
- OpenTelemetry Extensions Instrumentation
- Category Management and DTOs
- PerformanceBehaviour Handle CancellationToken
- Order Processing and Order Items
- Product Catalog and Pagination
- Identity and Account Services
- UserByPhoneNumber UserByPhoneNumberQuery UserIdByPhoneNumberQueryHandler
- Identity and Account Services
- ValidationExceptionTests Application UnitTests
- Identity and Account Services
- Table IEntityTypeConfiguration TableStatus
- IPipelineBehavior UnhandledExceptionBehaviour Handle
- Migration Down MigrationBuilder
- SignalRLoggingBehaviour Handle CancellationToken
- ValidationBehaviour Handle CancellationToken
- Todo Entity Domain Models
- Todo Entity Domain Models
- FlagOrderAsUnpaid FlagOrderAsUnpaidCommand FlagOrderAsUnpaidCommandHandler
- Identity and Account Services
- WebApplication Extensions AddDefaultHealthChecks
- IWebHostEnvironment LocalFileStorageService DeleteImage
- System Architecture and Docker Setup
- Mapping LookupDto Profile
- http external protocol
- tcp bindings protocol
- NUnit Infrastructure IntegrationTests
- WebApplicationExtensions Assembly MapEndpoints
- Roles Domain Constants
- Order Processing and Order Items
- Product ProductDto Application
- Category Management and DTOs
- otlp http protocol
- aspnetcore https cjs
- AdminTables STATUS tsx
- Product Image Latte
- IResourceBuilder AppHost Extensions
- baseUrl main jsx
- Dev Container Development
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Client Dependencies and Package Config
- Map RouteGroupBuilder
- Product Image Classic
- Pizza Product Image
- MIT License
- ClientApp Favicon Icon
- ClientApp Studio Setup

## God Nodes (most connected - your core abstractions)
1. `CafePosBackend.Application.Common.Interfaces` - 60 edges
2. `IApplicationDbContext` - 45 edges
3. `CafePosBackend.Domain.Entities` - 44 edges
4. `IIdentityService` - 22 edges
5. `TestApp` - 20 edges
6. `Web` - 18 edges
7. `ApplicationDbContext` - 18 edges
8. `IdentityService` - 18 edges
9. `Application.FunctionalTests` - 17 edges
10. `env` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Cafe POS & On-Site Ordering Proposal (Farsi)` --semantically_similar_to--> `Cafe POS & On-Site Ordering Automation Proposal`  [INFERRED] [semantically similar]
  project-proposal-fa.md → project-proposal.md
- `Self-Service QR Ordering Workflow (Farsi)` --semantically_similar_to--> `QR Table Ordering Customer Journey`  [INFERRED] [semantically similar]
  project-proposal-fa.md → project-proposal.md
- `Hardware Receipt Printing Architecture (Farsi)` --semantically_similar_to--> `Hardware Receipt Printing Strategy`  [INFERRED] [semantically similar]
  project-proposal-fa.md → project-proposal.md
- `SignalR CORS Credentials Policy` --semantically_similar_to--> `Backend CORS Setup for Local React App`  [INFERRED] [semantically similar]
  signalr_backend_roadmap.md → src/Web/ClientApp/03-Frontend-Integration.md
- `RTL & Persian Typography Setup` --conceptually_related_to--> `Cafe POS & On-Site Ordering Proposal (Farsi)`  [INFERRED]
  src/Web/ClientApp/index.html → project-proposal-fa.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Real-Time Order & Waiter Call Notification Pipeline** — project_proposal_qr_table_ordering, signalr_backend_roadmap_cafe_hub, signalr_backend_roadmap_cafe_hub_client_interface, signalr_backend_roadmap_cafe_notification_service [INFERRED 0.85]
- **Frontend-Backend Multi-Phase Migration Lifecycle** — src_web_clientapp_01_database_and_architecture_domain_models, src_web_clientapp_02_api_endpoints_menu_endpoints, src_web_clientapp_03_frontend_integration_zustand_refactoring, src_web_clientapp_frontend_api_integration_guide_four_phase_integration [INFERRED 0.85]
- **Clean Architecture System and Deployment Stack** — readme_clean_architecture_template, project_proposal_system_architecture, docker_compose_webapi_service, docker_compose_database_service [INFERRED 0.85]
- **Coffee Beverage Product Images** — src_web_wwwroot_images_products_espresso_espresso_image, src_web_wwwroot_images_products_latte_latte_image, src_web_wwwroot_images_products_cappuccino_cappuccino_image, src_web_wwwroot_images_products_iced_latte_iced_latte_image [INFERRED 0.85]
- **Cafe POS Product Catalog Assets** — src_web_wwwroot_images_products_burger_burger_image, src_web_wwwroot_images_products_cappuccino_cappuccino_image, src_web_wwwroot_images_products_e2dd7c90_1f7e_4ccf_9b4d_f761b460ebea_e2dd7c90_1f7e_4ccf_9b4d_f761b460ebea_image, src_web_wwwroot_images_products_espresso_espresso_image, src_web_wwwroot_images_products_iced_latte_iced_latte_image, src_web_wwwroot_images_products_latte_latte_image, src_web_wwwroot_images_products_margarita_margarita_image, src_web_wwwroot_images_products_mojito_mojito_image, src_web_wwwroot_images_products_pepperoni_pepperoni_image [INFERRED 0.95]

## Communities (151 total, 24 thin omitted)

### Community 0 - "TodoList Functional Test Suite"
Cohesion: 0.06
Nodes (36): CafePosBackend.Application.FunctionalTests.TodoLists.Queries, IBaseRequest, IWebHostBuilder, TestBase, TestApp, Guid, IRequest, List (+28 more)

### Community 1 - "Web Acceptance and Counter Tests"
Cohesion: 0.05
Nodes (24): CafePosBackend.TestAppHost, CafePosBackend.Web.AcceptanceTests.Pages, CafePosBackend.Shared, IPage, Services, string, Program, BasePage (+16 more)

### Community 2 - "Auditable Entities and Interceptors"
Cohesion: 0.05
Nodes (31): CafePosBackend.Infrastructure.Data.Interceptors, CafePosBackend.Domain.Common, DateTimeOffset, EntityEntry, IMediator, INotification, SaveChangesInterceptor, BaseAuditableEntity (+23 more)

### Community 3 - "SignalR Hubs and Order Notifications"
Cohesion: 0.06
Nodes (28): CafePosBackend.Application.Cafe.Commands.NewOrder, CafePosBackend.Application.Cafe.Commands.RequestWaiter, CafePosBackend.Web.Hubs, Hub, IHubContext, NewOrderCommand, NewOrderCommandHandler, NewOrderCommandValidator (+20 more)

### Community 4 - "Web Acceptance and Counter Tests"
Cohesion: 0.06
Nodes (24): CafePosBackend.Web.AcceptanceTests.StepDefinitions, CounterStepDefinitions, AfterFeature, BeforeFeature, Given, IObjectContainer, Task, Then (+16 more)

### Community 5 - "System Architecture and Docker Setup"
Cohesion: 0.06
Nodes (42): Docker Compose Multi-Container Configuration, PostgreSQL 18.3 Database Service, Web API Docker Service, Cashier POS & Kanban Workflow, Cafe POS & On-Site Ordering Automation Proposal, Cafe POS & On-Site Ordering Proposal (Farsi), Hardware Receipt Printing Architecture (Farsi), Real-time Waiter Call System (Farsi) (+34 more)

### Community 6 - "Weather Forecast API Samples"
Cohesion: 0.08
Nodes (29): CafePosBackend.Application.WeatherForecasts.Queries.GetWeatherForecasts, IEndpointGroup, GetWeatherForecastsQuery, GetWeatherForecastsQueryHandler, CancellationToken, IEnumerable, string, Task (+21 more)

### Community 7 - "Product Catalog and Pagination"
Cohesion: 0.11
Nodes (26): CafePosBackend.Application.Product.Commands.CreateProduct, CafePosBackend.Application.Product.Queries.ProductPagination, CafePosBackend.Application.Product.Queries.GetProducts, CafePosBackend.Application.Product.Commands.ChangeProductAvailablity, CafePosBackend.Application.Common.Generics.Queries.PaginationQuery, BaseResponsePagination, ProductPaginationQuery, ProductPaginationQueryHandler (+18 more)

### Community 8 - "Admin POS Layout and Guard Routes"
Cohesion: 0.09
Nodes (24): App, AppRoutes, AuthContext, AuthProvider(), client, useAuth(), ProtectedRoute(), RegisterPage() (+16 more)

### Community 9 - "Dining Table State and Service"
Cohesion: 0.09
Nodes (27): CafePosBackend.Web.Endpoints, CafePosBackend.Application.Tables.Queries.GetTables, CafePosBackend.Application.Tables.Commands.UpdateTableStatus, UpdateTableStatusCommand, UpdateTableStatusCommandHandler, UpdateTableStatusCommandValidator, CancellationToken, Guid (+19 more)

### Community 10 - "Todo Entity Domain Models"
Cohesion: 0.08
Nodes (18): BaseEvent, CafePosBackend.Domain.ValueObjects, CafePosBackend.Domain.Exceptions, CafePosBackend.Application.TodoItems.EventHandlers, CafePosBackend.Domain.Events, CafePosBackend.Domain.UnitTests.ValueObjects, INotificationHandler, LogTodoItemCompleted (+10 more)

### Community 11 - "Waiter Call FAB and Navigation"
Cohesion: 0.12
Nodes (23): react, react, CallWaiterFAB(), CallWaiterProps, CartButton(), CartButtonProps, DeveloperBadge(), DeveloperBadgeProps (+15 more)

### Community 12 - "Category Management and DTOs"
Cohesion: 0.09
Nodes (23): CafePosBackend.Application.Categories.Queries.GetAllCategories, CafePosBackend.Application.Categories, CategoryDto, Mapping, Guid, GetAllCategoriesQuery, GetAllCategoriesQueryHandler, GetAllCategoriesQueryValidator (+15 more)

### Community 13 - "Customer Cart and Order Client"
Cohesion: 0.13
Nodes (20): CartModal(), CartModalProps, api, createOrder(), CreateOrderRequest, getOrderById(), getOrders(), OrderDiscountDto (+12 more)

### Community 14 - "Identity and Account Services"
Cohesion: 0.16
Nodes (12): IAuthorizationService, IdentityResult, IUserClaimsPrincipalFactory, Result, IEnumerable, IdentityService, Guid, IMapper (+4 more)

### Community 15 - "Identity and Account Services"
Cohesion: 0.22
Nodes (17): AccessTokenResponse, EmptyHttpResult, ProblemHttpResult, SignInManager, Users, Created, EndpointDescription, EndpointSummary (+9 more)

### Community 16 - "Aspire Launch Configuration"
Cohesion: 0.10
Nodes (24): ASPIRE_ALLOW_UNSECURED_TRANSPORT, ASPNETCORE_ENVIRONMENT, DOTNET_DASHBOARD_OTLP_ENDPOINT_URL, DOTNET_ENVIRONMENT, DOTNET_RESOURCE_SERVICE_ENDPOINT_URL, applicationUrl, commandName, dotnetRunMessages (+16 more)

### Community 17 - "Admin POS Layout and Guard Routes"
Cohesion: 0.18
Nodes (14): AdminLayout(), PcPosModal(), ProtectedRoute(), ProtectedRouteProps, RealtimeProvider(), ToastData, AdminLogin(), AdminProfile() (+6 more)

### Community 18 - "POS Modal Components and Receipts"
Cohesion: 0.17
Nodes (16): Dropdown(), DropdownProps, Option, OrderDetailModal(), OrderDetailModalProps, ThermalReceipt, ThermalReceiptProps, printReceiptViaIframe() (+8 more)

### Community 19 - "Category Management and DTOs"
Cohesion: 0.11
Nodes (17): BaseAuditableEntity, BaseEntity, IdentityDbContext, IdentityRole, Category, ICollection, OrderItem, Guid (+9 more)

### Community 20 - "Todo Entity Domain Models"
Cohesion: 0.12
Nodes (15): IRequestHandler, CancellationToken, Task, UpdateOrderCommandHandler, CancellationToken, IMapper, Task, DeleteTodoListCommand (+7 more)

### Community 21 - "TodoList Functional Test Suite"
Cohesion: 0.22
Nodes (11): CafePosBackend.Application.FunctionalTests.TodoLists.Commands, CafePosBackend.Application.TodoItems.Commands.DeleteTodoItem, CafePosBackend.Domain.Entities, CafePosBackend.Application.TodoItems.Commands.UpdateTodoItem, CafePosBackend.Application.TodoLists.Commands.CreateTodoList, CafePosBackend.Application.TodoLists.Commands.UpdateTodoList, CafePosBackend.Application.Common.Exceptions, CafePosBackend.Application.TodoItems.Commands.CreateTodoItem (+3 more)

### Community 22 - "Identity and Account Services"
Cohesion: 0.14
Nodes (9): CafePosBackend.Infrastructure.Identity, CafePosBackend.Application.Users.Queries.UserByPhoneNumber, CafePosBackend.Application.Users.Commands.CreateUser, CafePosBackend.Application.Common.Models, CafePosBackend.Application.Users.Commands.ChangePassword, CafePosBackend.Application.Users, CafePosBackend.Application.Users.Queries.GetAllUsers, UserLoginRequestDto (+1 more)

### Community 23 - "Web Acceptance and Counter Tests"
Cohesion: 0.11
Nodes (14): CafePosBackend.Web.AcceptanceTests, IBrowser, IDistributedApplicationTestingBuilder, IPlaywright, AspireSetup, DistributedApplication, OneTimeSetUp, OneTimeTearDown (+6 more)

### Community 24 - "TypeScript Build Configuration"
Cohesion: 0.11
Nodes (18): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules (+10 more)

### Community 25 - "Order Processing and Order Items"
Cohesion: 0.29
Nodes (13): Orders, BadRequest, Created, EndpointDescription, EndpointSummary, Guid, IEnumerable, ISender (+5 more)

### Community 26 - "Client Dependencies and Package Config"
Cohesion: 0.11
Nodes (18): autoprefixer, eslint, vite, devDependencies, autoprefixer, eslint, tailwindcss, tsx (+10 more)

### Community 27 - "Client Dependencies and Package Config"
Cohesion: 0.12
Nodes (18): axios, framer-motion, @microsoft/signalr, @radix-ui/react-alert-dialog, @radix-ui/react-avatar, @radix-ui/react-tabs, react-dom, react-hot-toast (+10 more)

### Community 28 - "Aspire Launch Configuration"
Cohesion: 0.12
Nodes (17): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, launchUrl, applicationUrl (+9 more)

### Community 29 - "AddIndexToOrdersCreated Infrastructure Data"
Cohesion: 0.15
Nodes (8): CafePosBackend.Infrastructure.Data, CafePosBackend.Infrastructure.Data.Migrations, ModelSnapshot, MigrationBuilder, AddIndexToOrdersCreated, ModelBuilder, ApplicationDbContextModelSnapshot, ModelBuilder

### Community 30 - "Identity and Account Services"
Cohesion: 0.24
Nodes (7): IIdentityService, Guid, Task, UserId, ApplicationUserDto, Guid, List

### Community 31 - "Todo Entity Domain Models"
Cohesion: 0.23
Nodes (12): TodoLists, BadRequest, Created, EndpointDescription, EndpointSummary, Guid, ISender, NoContent (+4 more)

### Community 32 - "PayOrder DiscountType PaymentMethod"
Cohesion: 0.17
Nodes (11): CafePosBackend.Domain.Enums, CafePosBackend.Application.Orders.Commands.PayOrder, PayOrderCommand, PayOrderCommandHandler, PayOrderCommandValidator, CancellationToken, Guid, Task (+3 more)

### Community 33 - "Todo Entity Domain Models"
Cohesion: 0.16
Nodes (11): DatabaseFacade, IApplicationDbContext, DbSet, UpdateTodoListCommand, UpdateTodoListCommandHandler, CancellationToken, Guid, Task (+3 more)

### Community 34 - "CAFEPOSBACKENDDB OTEL OTLP"
Cohesion: 0.12
Nodes (16): ASPNETCORE_ENVIRONMENT, ASPNETCORE_FORWARDEDHEADERS_ENABLED, CAFEPOSBACKENDDB_DATABASENAME, CAFEPOSBACKENDDB_HOST, CAFEPOSBACKENDDB_JDBCCONNECTIONSTRING, CAFEPOSBACKENDDB_PASSWORD, CAFEPOSBACKENDDB_PORT, CAFEPOSBACKENDDB_URI (+8 more)

### Community 35 - "DependencyInjection Extensions Microsoft"
Cohesion: 0.15
Nodes (8): Microsoft.Extensions.DependencyInjection, CafePosBackend.Application.FunctionalTests, Microsoft.Extensions.Hosting, CafePosBackend.Infrastructure.Services, IHostApplicationBuilder, DependencyInjection, IHostApplicationBuilder, DependencyInjection

### Community 36 - "System Architecture and Docker Setup"
Cohesion: 0.18
Nodes (13): net10.0, Aspire.Hosting.Azure.PostgreSQL, Aspire.Hosting.Docker, Aspire.Hosting.JavaScript, Aspire.Hosting.PostgreSQL, AppHost, Aspire.Hosting.AppHost, MessagePack (+5 more)

### Community 37 - "UpdateProduct IFileStorageService Application"
Cohesion: 0.20
Nodes (9): CafePosBackend.Application.Product.Commands.UpdateProduct, IFileStorageService, Task, UpdateProductCommand, UpdateProductCommandHandler, UpdateProductCommandValidator, CancellationToken, Guid (+1 more)

### Community 38 - "OneTimeSetUp OneTimeTearDown ILoggerFactory"
Cohesion: 0.18
Nodes (9): ILoggerFactory, MapperConfiguration, TestCase, MappingTests, IMapper, OneTimeSetUp, OneTimeTearDown, Test (+1 more)

### Community 39 - "Order Processing and Order Items"
Cohesion: 0.22
Nodes (11): GetOrdersQuery, GetOrdersQueryHandler, CancellationToken, IEnumerable, IMapper, Task, OrderDiscountDto, OrderDto (+3 more)

### Community 40 - "UnpaidOrders FlagAsUnpaid GetUnpaidOrders"
Cohesion: 0.20
Nodes (10): UnpaidOrders, Created, DateTime, Guid, ISender, List, NoContent, Ok (+2 more)

### Community 41 - "Identity and Account Services"
Cohesion: 0.15
Nodes (13): Azure.Extensions.AspNetCore.Configuration.Secrets, Microsoft.AspNetCore.OpenApi, Microsoft.EntityFrameworkCore.Design, Microsoft.Extensions.ApiDescription.Server, Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore, Microsoft.OpenApi, Scalar.AspNetCore, Microsoft.NET.Sdk.Web (+5 more)

### Community 42 - "Identity and Account Services"
Cohesion: 0.15
Nodes (13): Microsoft.AspNetCore.Mvc.Testing, Respawn, System.IdentityModel.Tokens.Jwt, Application.FunctionalTests, Aspire.Hosting.Testing, coverlet.collector, Microsoft.EntityFrameworkCore, Microsoft.NET.Test.Sdk (+5 more)

### Community 43 - "Identity and Account Services"
Cohesion: 0.26
Nodes (10): List, AllUsersDto, Guid, List, GetAllUsersQuery, GetAllUsersQueryHandler, GetAllUsersQueryValidator, CancellationToken (+2 more)

### Community 44 - "Product Catalog and Pagination"
Cohesion: 0.23
Nodes (11): CategoryDto, changeProductAvailability(), createProduct(), CreateProductRequest, deleteProduct(), getCategories(), getProducts(), ProductDto (+3 more)

### Community 45 - "AdminUnpaidOrders useUnpaidOrderStore unpaidOrderService"
Cohesion: 0.29
Nodes (10): flagOrderAsUnpaid(), FlagOrderAsUnpaidRequest, getUnpaidOrders(), GetUnpaidOrdersParams, settleUnpaidOrder(), UnpaidOrderDto, AdminDashboard(), AdminUnpaidOrders() (+2 more)

### Community 46 - "Application FunctionalTests TestBase"
Cohesion: 0.17
Nodes (7): CafePosBackend.Application.FunctionalTests.Infrastructure, Program, TestBase, SetUp, Task, WebApiFactory, WebApplicationFactory

### Community 47 - "Order Processing and Order Items"
Cohesion: 0.21
Nodes (9): CafePosBackend.Application.Orders.Queries.GetOrderById, CafePosBackend.Application.Orders.Commands.UpdateOrderStatus, CafePosBackend.Application.Orders.Queries.GetOrders, GetOrderByIdQuery, GetOrderByIdQueryHandler, CancellationToken, Guid, IMapper (+1 more)

### Community 48 - "Order Processing and Order Items"
Cohesion: 0.24
Nodes (10): CafePosBackend.Application.Orders.Commands.CreateOrder, CreateOrderCommand, CreateOrderCommandHandler, CreateOrderCommandValidator, CancellationToken, Guid, IEnumerable, IMapper (+2 more)

### Community 49 - "Todo Entity Domain Models"
Cohesion: 0.18
Nodes (9): CafePosBackend.Application.UnitTests.Common.Mappings, CafePosBackend.Application.TodoLists.Queries.GetTodos, Mapping, TodoItemDto, Guid, Mapping, TodoListDto, Guid (+1 more)

### Community 50 - "ApplicationDbContextInitialiser RoleManager InitialiseAsync"
Cohesion: 0.23
Nodes (7): RoleManager, ApplicationDbContextInitialiser, InitialiserExtensions, ILogger, Task, UserManager, WebApplication

### Community 51 - "Todo Entity Domain Models"
Cohesion: 0.23
Nodes (8): CreateTodoListCommand, CreateTodoListCommandHandler, CancellationToken, Guid, Task, CreateTodoListCommandValidator, CancellationToken, Task

### Community 52 - "UnpaidOrders Application Web"
Cohesion: 0.18
Nodes (6): CafePosBackend.Application.UnpaidOrders.Queries.GetUnpaidOrders, CafePosBackend.Web.Infrastructure, CafePosBackend.Application.UnpaidOrders.Commands.FlagOrderAsUnpaid, CafePosBackend.Application.UnpaidOrders.Commands.SettleUnpaidOrder, IEndpointGroup, RouteGroupBuilder

### Community 53 - "Mock Process CancellationToken"
Cohesion: 0.24
Nodes (7): Mock, CancellationToken, Task, RequestLoggerTests, SetUp, Task, Test

### Community 54 - "type manifest json"
Cohesion: 0.18
Nodes (10): connectionString, type, filter, type, value, error, resources, CafePosBackendDb (+2 more)

### Community 55 - "TodosVm GetTodos GetTodosQuery"
Cohesion: 0.27
Nodes (8): GetTodosQuery, GetTodosQueryHandler, CancellationToken, IMapper, Task, ColourDto, TodosVm, IReadOnlyCollection

### Community 56 - "Order OrderConfiguration DiscountType"
Cohesion: 0.20
Nodes (8): Order, DiscountType, Guid, ICollection, OrderStatus, PaymentMethod, OrderConfiguration, EntityTypeBuilder

### Community 57 - "Client Dependencies and Package Config"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, clean, dev, lint, preview (+2 more)

### Community 58 - "System Architecture and Docker Setup"
Cohesion: 0.18
Nodes (11): Application.UnitTests, Aspire.Npgsql.EntityFrameworkCore.PostgreSQL, Azure.Identity, coverlet.collector, Microsoft.EntityFrameworkCore, Microsoft.NET.Test.Sdk, Moq, nunit (+3 more)

### Community 59 - "Todo Entity Domain Models"
Cohesion: 0.27
Nodes (7): AbstractValidator, ChangeProductAvailablityCommand, ChangeProductAvailablityCommandHandler, ChangeProductAvailablityCommandValidator, CancellationToken, Task, CreateTodoItemCommandValidator

### Community 60 - "AuthorizationBehaviour AuthorizeAttribute Attribute"
Cohesion: 0.20
Nodes (7): Attribute, CafePosBackend.Application.Common.Security, AuthorizationBehaviour, CancellationToken, RequestHandlerDelegate, Task, AuthorizeAttribute

### Community 61 - "Todo Entity Domain Models"
Cohesion: 0.22
Nodes (6): Colour, CafePosBackend.Infrastructure.Data.Configurations, IList, TodoList, TodoListConfiguration, EntityTypeBuilder

### Community 62 - "Identity and Account Services"
Cohesion: 0.29
Nodes (7): CafePosBackend.Application.Users.Queries.GetCurrentUser, CafePosBackend.Application.FunctionalTests.Users.Queries, GetCurrentUserQuery, GetCurrentUserQueryHandler, ApplicationUserDto, CancellationToken, Task

### Community 63 - "OneTimeSetUp OneTimeTearDown DatabaseResetter"
Cohesion: 0.22
Nodes (8): DatabaseResetter, IServiceScopeFactory, FunctionalTestSetup, DistributedApplication, OneTimeSetUp, OneTimeTearDown, Task, WebApiFactory

### Community 64 - "Microsoft Build Core"
Cohesion: 0.20
Nodes (10): Ardalis.GuardClauses, AutoMapper, FluentValidation.DependencyInjectionExtensions, MediatR, Microsoft.Build.Tasks.Core, Microsoft.Build.Utilities.Core, Microsoft.Extensions.Hosting, System.Security.Cryptography.Xml (+2 more)

### Community 65 - "Domain Microsoft NET"
Cohesion: 0.22
Nodes (10): MediatR.Contracts, Domain, Microsoft.NET.Sdk, Domain.UnitTests, coverlet.collector, Microsoft.NET.Test.Sdk, nunit, NUnit3TestAdapter (+2 more)

### Community 66 - "POSTGRES connectionString env"
Cohesion: 0.20
Nodes (10): connectionString, env, image, type, volumes, POSTGRES_HOST_AUTH_METHOD, POSTGRES_INITDB_ARGS, POSTGRES_PASSWORD (+2 more)

### Community 67 - "type value inputs"
Cohesion: 0.20
Nodes (10): inputs, type, value, generate, minLength, value, dbserver-password, default (+2 more)

### Community 68 - "Product Catalog and Pagination"
Cohesion: 0.33
Nodes (8): GetProductsQuery, GetProductsQueryHandler, CancellationToken, Guid, IEnumerable, IMapper, ProductDto, Task

### Community 69 - "GetUnpaidOrders GetUnpaidOrdersQuery GetUnpaidOrdersQueryHandler"
Cohesion: 0.40
Nodes (8): GetUnpaidOrdersQuery, GetUnpaidOrdersQueryHandler, UnpaidOrderDto, CancellationToken, DateTime, Guid, List, Task

### Community 70 - "Todo Entity Domain Models"
Cohesion: 0.25
Nodes (6): bool, TodoItem, Guid, PriorityLevel, TodoItemConfiguration, EntityTypeBuilder

### Community 71 - "Web DependencyInjection Services"
Cohesion: 0.31
Nodes (4): CafePosBackend.Web.Services, CafePosBackend.Application.Common.Interfaces, IHostApplicationBuilder, DependencyInjection

### Community 72 - "Order Processing and Order Items"
Cohesion: 0.25
Nodes (7): CafePosBackend.Application.Orders.Commands.UpdateOrder, UpdateOrderCommand, UpdateOrderCommandValidator, Guid, IEnumerable, OrderItemDto, OrderStatus

### Community 73 - "DbConnection IAsyncDisposable Respawner"
Cohesion: 0.25
Nodes (6): DbConnection, IAsyncDisposable, Respawner, DatabaseResetter, Task, ValueTask

### Community 74 - "IEndpointRouteBuilder RouteHandlerBuilder EndpointRouteBuilderExtensions"
Cohesion: 0.56
Nodes (4): IEndpointRouteBuilder, RouteHandlerBuilder, EndpointRouteBuilderExtensions, Delegate

### Community 75 - "Todo Entity Domain Models"
Cohesion: 0.28
Nodes (7): IRequest, PaginationQuery, IEnumerable, DeleteTodoItemCommand, DeleteTodoItemCommandHandler, CancellationToken, Task

### Community 76 - "Web Acceptance and Counter Tests"
Cohesion: 0.22
Nodes (9): Microsoft.Playwright, Reqnroll.NUnit, Web.AcceptanceTests, Aspire.Hosting.Testing, MessagePack, Microsoft.NET.Test.Sdk, nunit, NUnit3TestAdapter (+1 more)

### Community 77 - "https external protocol"
Cohesion: 0.22
Nodes (9): https, external, protocol, scheme, transport, webapi, bindings, path (+1 more)

### Community 78 - "otlp grpc bindings"
Cohesion: 0.22
Nodes (9): otlp-grpc, bindings, image, type, protocol, scheme, targetPort, transport (+1 more)

### Community 79 - "Todo Entity Domain Models"
Cohesion: 0.28
Nodes (6): UpdateTodoItemCommand, UpdateTodoItemCommandHandler, CancellationToken, Guid, Task, UpdateTodoItemCommandValidator

### Community 80 - "MethodInfoExtensions char IGuardClause"
Cohesion: 0.29
Nodes (5): char, IGuardClause, MethodInfo, MethodInfoExtensions, Delegate

### Community 81 - "Application Common Behaviours"
Cohesion: 0.25
Nodes (5): CafePosBackend.Application.UnitTests.Common.Behaviours, CafePosBackend.Application.Common.Behaviours, IRequestPreProcessor, LoggingBehaviour, ILogger

### Community 82 - "DeleteProduct Application Product"
Cohesion: 0.36
Nodes (6): CafePosBackend.Application.Product.Commands.DeleteProduct, DeleteProductCommand, DeleteProductCommandHandler, DeleteProductCommandValidator, CancellationToken, Task

### Community 83 - "Identity and Account Services"
Cohesion: 0.25
Nodes (6): Dictionary, IdentityApiOperationTransformer, CancellationToken, OpenApiOperation, OpenApiOperationTransformerContext, Task

### Community 84 - "ForbiddenAccessException ValidationException UnsupportedColourException"
Cohesion: 0.25
Nodes (5): Exception, IDictionary, ForbiddenAccessException, ValidationException, UnsupportedColourException

### Community 85 - "ProblemDetailsExceptionHandler HttpContext IExceptionHandler"
Cohesion: 0.25
Nodes (6): HttpContext, IExceptionHandler, ProblemDetailsExceptionHandler, CancellationToken, Exception, ValueTask

### Community 86 - "IUser List IHttpContextAccessor"
Cohesion: 0.25
Nodes (7): IHttpContextAccessor, IUser, Guid, List, CurrentUser, Guid, List

### Community 87 - "ApiExceptionOperationTransformer IOpenApiOperationTransformer TransformAsync"
Cohesion: 0.25
Nodes (6): IOpenApiOperationTransformer, ApiExceptionOperationTransformer, CancellationToken, OpenApiOperation, OpenApiOperationTransformerContext, Task

### Community 88 - "OpenTelemetry Extensions Instrumentation"
Cohesion: 0.25
Nodes (8): Microsoft.Extensions.Http.Resilience, Microsoft.Extensions.ServiceDiscovery, OpenTelemetry.Exporter.OpenTelemetryProtocol, OpenTelemetry.Extensions.Hosting, OpenTelemetry.Instrumentation.AspNetCore, OpenTelemetry.Instrumentation.Http, OpenTelemetry.Instrumentation.Runtime, ServiceDefaults

### Community 89 - "Category Management and DTOs"
Cohesion: 0.43
Nodes (6): CreateCategoryCommand, CreateCategoryCommandHandler, CreateCategoryCommandValidator, CancellationToken, Guid, Task

### Community 90 - "PerformanceBehaviour Handle CancellationToken"
Cohesion: 0.25
Nodes (6): PerformanceBehaviour, CancellationToken, ILogger, RequestHandlerDelegate, Task, Stopwatch

### Community 91 - "Order Processing and Order Items"
Cohesion: 0.36
Nodes (6): UpdateOrderStatusCommand, UpdateOrderStatusCommandHandler, UpdateOrderStatusCommandValidator, CancellationToken, Guid, Task

### Community 92 - "Product Catalog and Pagination"
Cohesion: 0.43
Nodes (6): CreateProductCommand, CreateProductCommandHandler, CreateProductCommandValidator, CancellationToken, Guid, Task

### Community 93 - "Identity and Account Services"
Cohesion: 0.43
Nodes (6): CreateUserCommand, CreateUserCommandHandler, CreateUserCommandValidator, CancellationToken, Guid, Task

### Community 94 - "UserByPhoneNumber UserByPhoneNumberQuery UserIdByPhoneNumberQueryHandler"
Cohesion: 0.43
Nodes (6): UserByPhoneNumberQuery, UserIdByPhoneNumberQueryHandler, UserIdByPhoneNumberQueryValidator, ApplicationUserDto, CancellationToken, Task

### Community 95 - "Identity and Account Services"
Cohesion: 0.38
Nodes (5): CafePosBackend.Application.Users.Commands.ToggleUserStatus, ToggleUserStatusCommand, ToggleUserStatusCommandHandler, CancellationToken, Task

### Community 96 - "ValidationExceptionTests Application UnitTests"
Cohesion: 0.38
Nodes (3): CafePosBackend.Application.UnitTests.Common.Exceptions, ValidationExceptionTests, Test

### Community 97 - "Identity and Account Services"
Cohesion: 0.33
Nodes (5): IdentityUser, ApplicationUserConfiguration, EntityTypeBuilder, ApplicationUser, Guid

### Community 98 - "Table IEntityTypeConfiguration TableStatus"
Cohesion: 0.38
Nodes (5): IEntityTypeConfiguration, Table, TableStatus, TableConfiguration, EntityTypeBuilder

### Community 99 - "IPipelineBehavior UnhandledExceptionBehaviour Handle"
Cohesion: 0.29
Nodes (6): IPipelineBehavior, UnhandledExceptionBehaviour, CancellationToken, ILogger, RequestHandlerDelegate, Task

### Community 100 - "Migration Down MigrationBuilder"
Cohesion: 0.33
Nodes (4): Migration, MigrationBuilder, InitialCreate, ModelBuilder

### Community 101 - "SignalRLoggingBehaviour Handle CancellationToken"
Cohesion: 0.29
Nodes (5): SignalRLoggingBehaviour, CancellationToken, ILogger, RequestHandlerDelegate, Task

### Community 102 - "ValidationBehaviour Handle CancellationToken"
Cohesion: 0.29
Nodes (5): ValidationBehaviour, CancellationToken, IEnumerable, RequestHandlerDelegate, Task

### Community 103 - "Todo Entity Domain Models"
Cohesion: 0.48
Nodes (5): CreateTodoItemCommand, CreateTodoItemCommandHandler, CancellationToken, Guid, Task

### Community 104 - "Todo Entity Domain Models"
Cohesion: 0.38
Nodes (5): UpdateTodoItemDetailCommand, UpdateTodoItemDetailCommandHandler, CancellationToken, Guid, Task

### Community 105 - "FlagOrderAsUnpaid FlagOrderAsUnpaidCommand FlagOrderAsUnpaidCommandHandler"
Cohesion: 0.48
Nodes (5): FlagOrderAsUnpaidCommand, FlagOrderAsUnpaidCommandHandler, CancellationToken, Guid, Task

### Community 106 - "Identity and Account Services"
Cohesion: 0.43
Nodes (5): ChangePasswordCommand, ChangePasswordCommandHandler, ChangePasswordCommandValidator, CancellationToken, Task

### Community 108 - "IWebHostEnvironment LocalFileStorageService DeleteImage"
Cohesion: 0.33
Nodes (4): IWebHostEnvironment, LocalFileStorageService, ILogger, Task

### Community 109 - "System Architecture and Docker Setup"
Cohesion: 0.33
Nodes (6): Npgsql.EntityFrameworkCore.PostgreSQL, Infrastructure, Aspire.Npgsql.EntityFrameworkCore.PostgreSQL, Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore, Microsoft.AspNetCore.Identity.EntityFrameworkCore, Microsoft.EntityFrameworkCore

### Community 110 - "Mapping LookupDto Profile"
Cohesion: 0.33
Nodes (5): Profile, LookupDto, Mapping, Mapping, Mapping

### Community 111 - "http external protocol"
Cohesion: 0.33
Nodes (6): http, external, protocol, scheme, targetPort, transport

### Community 112 - "tcp bindings protocol"
Cohesion: 0.33
Nodes (6): tcp, bindings, protocol, scheme, targetPort, transport

### Community 113 - "NUnit Infrastructure IntegrationTests"
Cohesion: 0.33
Nodes (6): Infrastructure.IntegrationTests, coverlet.collector, Microsoft.NET.Test.Sdk, NUnit, NUnit3TestAdapter, NUnit.Analyzers

### Community 114 - "WebApplicationExtensions Assembly MapEndpoints"
Cohesion: 0.40
Nodes (3): Assembly, WebApplicationExtensions, WebApplication

### Community 115 - "Roles Domain Constants"
Cohesion: 0.40
Nodes (3): CafePosBackend.Domain.Constants, Roles, string

### Community 116 - "Order Processing and Order Items"
Cohesion: 0.40
Nodes (4): CafePosBackend.Application.Orders, Mapping, OrderItemDto, Guid

### Community 117 - "Product ProductDto Application"
Cohesion: 0.40
Nodes (4): CafePosBackend.Application.Product, Mapping, ProductDto, Guid

### Community 118 - "Category Management and DTOs"
Cohesion: 0.40
Nodes (4): CafePosBackend.Application.Categories.Commands.CreateCategory, Mapping, ProductDto, Guid

### Community 119 - "otlp http protocol"
Cohesion: 0.40
Nodes (5): otlp-http, protocol, scheme, targetPort, transport

### Community 120 - "aspnetcore https cjs"
Cohesion: 0.40
Nodes (4): certFilePath, fs, keyFilePath, path

### Community 121 - "AdminTables STATUS tsx"
Cohesion: 0.40
Nodes (4): AdminTables(), STATUS_COLORS, STATUS_TEXT, TableStatus

### Community 122 - "Product Image Latte"
Cohesion: 0.40
Nodes (5): Cappuccino Product Image, Espresso Product Image, Iced Latte Product Image, Latte Product Image, Mojito Product Image

## Knowledge Gaps
- **292 isolated node(s):** `Aspire.Hosting.AppHost`, `Aspire.Hosting.Docker`, `Aspire.Hosting.JavaScript`, `Aspire.Hosting.PostgreSQL`, `MessagePack` (+287 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CafePosBackend.Application.Common.Interfaces` connect `Web DependencyInjection Services` to `Auditable Entities and Interceptors`, `SignalR Hubs and Order Notifications`, `Product Catalog and Pagination`, `Dining Table State and Service`, `Category Management and DTOs`, `Todo Entity Domain Models`, `Identity and Account Services`, `PayOrder DiscountType PaymentMethod`, `Todo Entity Domain Models`, `DependencyInjection Extensions Microsoft`, `UpdateProduct IFileStorageService Application`, `Order Processing and Order Items`, `Identity and Account Services`, `Application FunctionalTests TestBase`, `Order Processing and Order Items`, `Order Processing and Order Items`, `Todo Entity Domain Models`, `Todo Entity Domain Models`, `TodosVm GetTodos GetTodosQuery`, `Todo Entity Domain Models`, `AuthorizationBehaviour AuthorizeAttribute Attribute`, `Identity and Account Services`, `Product Catalog and Pagination`, `GetUnpaidOrders GetUnpaidOrdersQuery GetUnpaidOrdersQueryHandler`, `Order Processing and Order Items`, `Todo Entity Domain Models`, `Todo Entity Domain Models`, `Application Common Behaviours`, `DeleteProduct Application Product`, `IUser List IHttpContextAccessor`, `Category Management and DTOs`, `PerformanceBehaviour Handle CancellationToken`, `Order Processing and Order Items`, `Product Catalog and Pagination`, `Identity and Account Services`, `UserByPhoneNumber UserByPhoneNumberQuery UserIdByPhoneNumberQueryHandler`, `Identity and Account Services`, `SignalRLoggingBehaviour Handle CancellationToken`, `Todo Entity Domain Models`, `Todo Entity Domain Models`, `FlagOrderAsUnpaid FlagOrderAsUnpaidCommand FlagOrderAsUnpaidCommandHandler`, `Identity and Account Services`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `CafePosBackend.Application.FunctionalTests.Infrastructure` connect `Application FunctionalTests TestBase` to `Roles Domain Constants`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `CafePosBackend.Shared` connect `Web Acceptance and Counter Tests` to `Application FunctionalTests TestBase`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `Aspire.Hosting.AppHost`, `Aspire.Hosting.Docker`, `Aspire.Hosting.JavaScript` to the rest of the system?**
  _292 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TodoList Functional Test Suite` be split into smaller, more focused modules?**
  _Cohesion score 0.06095481670929241 - nodes in this community are weakly interconnected._
- **Should `Web Acceptance and Counter Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.053109713487071976 - nodes in this community are weakly interconnected._
- **Should `Auditable Entities and Interceptors` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._