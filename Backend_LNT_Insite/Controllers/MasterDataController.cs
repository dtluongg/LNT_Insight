using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MasterDataController : ControllerBase
    {
        private readonly string _connectionString;

        public MasterDataController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' is missing!");
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);


        [HttpGet("modules")]
        public async Task<IActionResult> GetModules()
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_MD_GetModules", commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        [HttpGet("subModules/{moduleMasterID}")]
        public async Task<IActionResult> GetSubModules(string moduleMasterID)
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_MD_GetSubModule", new { ModuleMasterID = moduleMasterID}, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_MD_GetUsers", commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
    }
}
