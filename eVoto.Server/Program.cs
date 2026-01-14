using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Encodings.Web;
using VotingSystem;
using VotingSystem.Voting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
	options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var votingEndpoint = builder.Configuration["GrpcEndpoints:Voting"] ?? throw new InvalidOperationException("GrpcEndpoints:Voting is not configured");
var voterEndpoint = builder.Configuration["GrpcEndpoints:VoterRegistration"] ?? votingEndpoint;

AllowHttp2InsecureIfNeeded(votingEndpoint);
AllowHttp2InsecureIfNeeded(voterEndpoint);

builder.Services.AddGrpcClient<VotingService.VotingServiceClient>(options =>
{
	options.Address = new Uri(votingEndpoint);
}).ConfigurePrimaryHttpMessageHandler(() => CreateHttpHandler(votingEndpoint));

builder.Services.AddGrpcClient<VoterRegistrationService.VoterRegistrationServiceClient>(options =>
{
	options.Address = new Uri(voterEndpoint);
}).ConfigurePrimaryHttpMessageHandler(() => CreateHttpHandler(voterEndpoint));

var app = builder.Build();

app.Use(async (context, next) =>
{
	context.Response.OnStarting(() =>
	{
		var contentType = context.Response.ContentType;
		if (!string.IsNullOrWhiteSpace(contentType) &&
			(contentType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
			 contentType.Contains("json", StringComparison.OrdinalIgnoreCase)) &&
			!contentType.Contains("charset=", StringComparison.OrdinalIgnoreCase))
		{
			context.Response.ContentType = $"{contentType}; charset=utf-8";
		}
		return Task.CompletedTask;
	});

	await next();
});

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();	

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

static void AllowHttp2InsecureIfNeeded(string? endpoint)
{
	if (string.IsNullOrWhiteSpace(endpoint))
	{
		return;
	}

	if (Uri.TryCreate(endpoint, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttp)
	{
		AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
	}
}

static HttpClientHandler CreateHttpHandler(string? endpoint)
{
	var handler = new HttpClientHandler();

	if (!string.IsNullOrWhiteSpace(endpoint) && Uri.TryCreate(endpoint, UriKind.Absolute, out var uri) && uri.Host.Equals("ken01.utad.pt", StringComparison.OrdinalIgnoreCase))
	{
		handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
	}

	return handler;
}
