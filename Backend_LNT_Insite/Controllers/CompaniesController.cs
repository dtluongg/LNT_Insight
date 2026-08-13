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
    public class CompaniesController : ControllerBase
    {
        private readonly string _connectionString;

        public CompaniesController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' is missing!");
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        [HttpGet]
        public async Task<IActionResult> GetCompanies()
        {
            using var db = CreateConnection();
            string sql = "SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation] WHERE CompanyTypeCode = 'MUF' AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql)).ToList();
            return Ok(result);
        }

        [HttpGet("{companyId}/sites")]
        public async Task<IActionResult> GetSites(string companyId)
        {
            using var db = CreateConnection();
            string sql = "SELECT SiteID, SiteCode, SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation] WHERE CompanyID = @CompanyID AND ManufacturingSiteFlag = 1 AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyId })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyId}/sites/{siteId}/sections")]
        public async Task<IActionResult> GetSections(string companyId, string siteId, [FromQuery] string departmentId = "DEP05")
        {
            using var db = CreateConnection();
            string sql = "SELECT SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] WHERE CompanyID = @CompanyID AND SiteID = @SiteID AND DepartmentID = @DepartmentID AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyId, SiteID = siteId, DepartmentID = departmentId })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyId}/sites/{siteId}/production-vs-plan")]
        public async Task<IActionResult> GetProductionVsPlan(string companyId, string siteId)
        {
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_ProductionVsPlan", new { CompanyID = companyId, SiteID = siteId }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
    }
}