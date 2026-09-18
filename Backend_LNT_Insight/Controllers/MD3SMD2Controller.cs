using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.IO;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]

    public class MD3SMD2Controller : ControllerBase
    {
        private readonly string _connectionString;
        private readonly bool _useLocalMockData;
        private readonly IWebHostEnvironment _env;

        public MD3SMD2Controller(IConfiguration configuration, IWebHostEnvironment env)
        {
            _useLocalMockData = configuration.GetValue<bool>("UseLocalMockData", false);
            _env = env;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' is missing!");
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        private IActionResult GetMockData(string fileName)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "SSMS", "Data", "DataCompaniesController", fileName);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = $"Mock data file '{fileName}' not found." });
            }
            var jsonString = System.IO.File.ReadAllText(filePath);
            return Content(jsonString, "application/json");
        }

        // function for get list company
        [HttpGet]
        public async Task<IActionResult> GetCompanies()
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetCompanies.json");
            }
            using var db = CreateConnection();
            // string sql = "SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation]";
            string sql = "USP_FXPRO_Insight_GetCompanies";
            var result = (await db.QueryAsync<dynamic>(sql)).ToList();
            return Ok(result);
        }

        // function for get all site of company
        [HttpGet("{companyID}/si")]
        public async Task<IActionResult> GetSites(string companyID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSites.json");
            }

            using var db = CreateConnection();
            string sql = "USP_FXPRO_Insight_GetSites";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyID })).ToList();
            return Ok(result);
        }

        // function for get all section of company and site
        [HttpGet("{companyID}/si/{siteID}/se")]
        public async Task<IActionResult> GetSections(string companyID, string siteID, [FromQuery] string departmentID = "DEP05")
        {
            if(_useLocalMockData)
            {
                return GetMockData("GetSections.json");
            }
            using var db = CreateConnection();
            string sql = "USP_FXPRO_Insight_GetSections";
            var result = (await db.QueryAsync<dynamic>(sql, new {CompanyID = companyID, SiteID = siteID, DepartmentID = departmentID})).ToList();
            return Ok(result);
        }
    }
}