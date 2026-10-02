using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text.Json;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
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
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_GetModules", commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        [HttpGet("subModules/{moduleMasterID}")]
        public async Task<IActionResult> GetSubModules(string moduleMasterID)
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_GetSubModules", new { ModuleMasterID = moduleMasterID}, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_GetInfoUser", commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        // [HttpGet("company/{companyID}site/{siteID}")]
        // public async Task<IActionResult> GetProductionVsPlan(string companyID, string siteID)
        // {
        //     using var db = CreateConnection();
        //     var result = (await db.QueryAsync<dynamic>("USP_ProductionVsPlan", new { CompanyID = companyID, SiteID = siteID}, commandType: CommandType.StoredProcedure)).ToList();
        //     return Ok(result);
        // }

        [HttpGet("user_working")]
        public async Task<IActionResult> GetUserWorking()
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_GetAllUserWorking", commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }


        [HttpPost("manage_user")]
        public async Task<IActionResult> UpdateUserModuleAccess([FromBody] JsonElement rawJson){
            string fullJson = rawJson.GetRawText();
            using var db = CreateConnection();
            // var parameters = new DynamicParameters();
            // parameters.Add("@JsonUpdateUserModuleAccess", fullJson);
            var result = (await db.ExecuteAsync(
                sql: "[dbo].[USP_FXPRO_Insight_UpdateUserModuleAccess]",
                new {JsonUpdateUserModuleAccess = fullJson},
                commandType: CommandType.StoredProcedure
                // param: parameters
            ));
            return Ok(new { Success = true});
        }

        [HttpGet("manage_user/{userID}")]
        public async Task<IActionResult> GetUserModuleAccess(string userID){
            using var db = CreateConnection();
            var result = (await db.QueryAsync(
                sql: "[dbo].[USP_FXPRO_Insight_GetUserModuleAccess]",
                new {UserID = userID},
                commandType: CommandType.StoredProcedure
                // param: parameters
            ));
            var rawRows = result.ToList();
            // use C# LINQ to unbox and group agrregate data

            var companyIDs = rawRows.Select(r => new {CompanyID = ((string)r.CompanyID)?.Trim()}).Distinct().ToList();
            var modules = rawRows.Select(r => new {
                ModuleMasterID = ((string)r.ModuleMasterID)?.Trim(),
                ModuleMasterSubID = (int)r.ModuleMasterSubID
            }).Distinct().ToList();

            var resultRespone = new {
                UserID = userID,
                CompanyIDs = companyIDs,
                Modules = modules
            };
            return Ok(resultRespone);
        }


        [HttpGet("manage_user/{userID}/{companyID}")]
        public async Task<IActionResult> GetUserCompanyModuleAccess(string userID, string companyID){
            using var db = CreateConnection();
            var result = (await db.QueryAsync(
                sql: "[dbo].[USP_FXPRO_Insight_GetUserCompanyModuleAccess]",
                new {UserID = userID, CompanyID = companyID},
                commandType: CommandType.StoredProcedure
                // param: parameters
            ));
            var rawRows = result.ToList();
            // use C# LINQ to unbox and group agrregate data

            var companyIDs = rawRows.Select(r => new {CompanyID = (string)r.CompanyID}).Distinct().ToList();
            var modules = rawRows.Select(r => new {
                ModuleMasterID = (string)r.ModuleMasterID,
                ModuleMasterSubID = (int)r.ModuleMasterSubID
            }).Distinct().ToList();

            var resultRespone = new {
                UserID = userID,
                CompanyIDs = companyIDs,
                Modules = modules
            };
            return Ok(resultRespone);
        }
    }
}
