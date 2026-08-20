using Microsoft.EntityFrameworkCore;

namespace Backend_LNT_Insight.DataConfig
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    }
}
