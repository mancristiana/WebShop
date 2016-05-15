using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(GamerShop.Startup))]
namespace GamerShop
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
