using Backend_LNT_Insight.DataConfig;
using Backend_LNT_Insight.Helpers;
using Backend_LNT_Insight.Services.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Configure CORS policy from appsettings
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();


builder.Services.AddScoped<IAuthService, AuthServiceImplement>();


builder.Services.AddScoped<ProtectByJWT>();


builder.Services.Configure<JWTSettings>(
    builder.Configuration.GetSection("JWTConfig"));

// Configure JWT Authentication
//var jwtSettings = builder.Configuration.GetSection("Jwt");
//var keyString = jwtSettings.GetValue<string>("Key") ?? "DefaultSecretKeyForLNTBOOSTProjectThatIsLongEnough123456";
//var key = Encoding.UTF8.GetBytes(keyString);
var jwtSettings = builder.Configuration
    .GetSection("JWTConfig")
    .Get<JWTSettings>()
    ?? throw new InvalidOperationException("JWT configuration is missing.");
var key = Encoding.UTF8.GetBytes(jwtSettings.Key);


// configure accept jwt:
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.RequireHttpsMetadata = false; // https moi dc truyen token, tuy nhien, dev nen cho la false de dc test.
    options.SaveToken = true; // after authen success, save token to HttpContext
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        //ValidIssuer = jwtSettings.GetValue<string>("Issuer") ?? "LNTBOOST_EMS",
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        //ValidAudience = jwtSettings.GetValue<string>("Audience") ?? "LNTBOOST_EMS_Users",
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowAll");

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseAuthentication(); // 1. Xác thực người dùng qua JWT

app.UseAuthorization();  // 2. Phân quyền truy cập các endpoint

app.MapControllers();

app.Run();
