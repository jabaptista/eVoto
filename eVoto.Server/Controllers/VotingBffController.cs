using Microsoft.AspNetCore.Mvc;
using VotingSystem;
using VotingSystem.Voting;

namespace eVoto.Server.Controllers;

[ApiController]
[Route("api/bff/voting")]
public class VotingBffController : ControllerBase
{
    private readonly VoterRegistrationService.VoterRegistrationServiceClient _registrationClient;
    private readonly VotingService.VotingServiceClient _votingClient;
    private readonly ILogger<VotingBffController> _logger;

    private static readonly IReadOnlyDictionary<int, CandidateMetadata> CandidateCatalog = new Dictionary<int, CandidateMetadata>
    {
        [1] = new("Partido do Progresso", "https://picsum.photos/id/64/200/200"),
        [2] = new("Partido Conservador", "https://picsum.photos/id/91/200/200"),
        [3] = new("Bloco Verde", "https://picsum.photos/id/65/200/200"),
        [4] = new("Liberal", "https://picsum.photos/id/55/200/200"),
    };

    public VotingBffController(
        VoterRegistrationService.VoterRegistrationServiceClient registrationClient,
        VotingService.VotingServiceClient votingClient,
        ILogger<VotingBffController> logger)
    {
        _registrationClient = registrationClient;
        _votingClient = votingClient;
        _logger = logger;
    }

    [HttpPost("credential")]
    public async Task<ActionResult<ServiceResponse<string>>> IssueCredential([FromBody] IssueCredentialRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.CitizenCardNumber))
        {
            return Ok(ServiceResponse<string>.Fail("Número de Cartão de Cidadão é obrigatório."));
        }

        try
        {
            var grpcResponse = await _registrationClient.IssueVotingCredentialAsync(new VoterRequest
            {
                CitizenCardNumber = request.CitizenCardNumber
            });

            if (!grpcResponse.IsEligible || string.IsNullOrWhiteSpace(grpcResponse.VotingCredential))
            {
                return Ok(ServiceResponse<string>.Fail("Eleitor não elegível."));
            }

            return Ok(ServiceResponse<string>.Ok(grpcResponse.VotingCredential));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to issue credential");
            return StatusCode(StatusCodes.Status502BadGateway, ServiceResponse<string>.Fail("Falha ao contactar o serviço de registo."));
        }
    }

    [HttpGet("candidates")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<CandidateDto>>>> GetCandidates()
    {
        try
        {
            var grpcResponse = await _votingClient.GetCandidatesAsync(new GetCandidatesRequest());
            var candidates = grpcResponse.Candidates.Select(MapCandidate).ToList();
            return Ok(ServiceResponse<IEnumerable<CandidateDto>>.Ok(candidates));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch candidates");
            return StatusCode(StatusCodes.Status502BadGateway, ServiceResponse<IEnumerable<CandidateDto>>.Fail("Falha ao contactar o serviço de votação."));
        }
    }

    [HttpPost("vote")]
    public async Task<ActionResult<ServiceResponse<bool>>> SubmitVote([FromBody] SubmitVoteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Credential))
        {
            return Ok(ServiceResponse<bool>.Fail("Credencial inválida."));
        }

        try
        {
            var grpcResponse = await _votingClient.VoteAsync(new VoteRequest
            {
                VotingCredential = request.Credential,
                CandidateId = request.CandidateId
            });

            if (!grpcResponse.Success)
            {
                return Ok(ServiceResponse<bool>.Fail(string.IsNullOrWhiteSpace(grpcResponse.Message) ? "Voto rejeitado." : grpcResponse.Message));
            }

            return Ok(ServiceResponse<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit vote");
            return StatusCode(StatusCodes.Status502BadGateway, ServiceResponse<bool>.Fail("Falha ao contactar o serviço de votação."));
        }
    }

    [HttpGet("results")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<VoteResultDto>>>> GetResults()
    {
        try
        {
            var grpcResponse = await _votingClient.GetResultsAsync(new GetResultsRequest());
            var totalVotes = grpcResponse.Results.Sum(r => (long)r.Votes);
            var results = grpcResponse.Results.Select(r => MapResult(r, totalVotes)).ToList();
            return Ok(ServiceResponse<IEnumerable<VoteResultDto>>.Ok(results));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch results");
            return StatusCode(StatusCodes.Status502BadGateway, ServiceResponse<IEnumerable<VoteResultDto>>.Fail("Falha ao contactar o serviço de votação."));
        }
    }

    private static CandidateDto MapCandidate(Candidate candidate)
    {
        var metadata = CandidateCatalog.TryGetValue(candidate.Id, out var entry)
            ? entry
            : new CandidateMetadata("Independente", string.Empty);

        return new CandidateDto(
            candidate.Id,
            candidate.Name ?? string.Empty,
            metadata.Party,
            metadata.Image);
    }

    private static VoteResultDto MapResult(CandidateResult result, long totalVotes)
    {
        var candidate = MapCandidate(new Candidate { Id = result.Id, Name = result.Name });
        var percentage = totalVotes == 0 ? 0 : Math.Round((double)result.Votes / totalVotes * 100, 2);

        return new VoteResultDto(
            result.Id,
            candidate.Name,
            result.Votes,
            percentage);
    }

    private sealed record CandidateMetadata(string Party, string Image);

    public sealed record IssueCredentialRequest(string CitizenCardNumber);

    public sealed record SubmitVoteRequest(string Credential, int CandidateId);

    public sealed record CandidateDto(int Id, string Name, string Party, string Image);

    public sealed record VoteResultDto(int CandidateId, string CandidateName, int Votes, double Percentage);

    public sealed record ServiceResponse<T>(bool Success, T? Data, string? Error)
    {
        public static ServiceResponse<T> Ok(T data) => new(true, data, null);
        public static ServiceResponse<T> Fail(string error) => new(false, default, error);
    }
}
    