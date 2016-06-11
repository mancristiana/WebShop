using System.Web;
using System.Web.Optimization;

namespace PersonalSite
{
    public class JsSOABundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include("~/Scripts/jquery-{version}.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css", "~/Content/Sticky/jquery.sticky-1.0.0.css"));

            bundles.Add(new ScriptBundle("~/bundles/masonry").Include("~/Scripts/Masonry/jquery.masonry-{version}.js"));
            bundles.Add(new ScriptBundle("~/bundles/sticky").Include("~/Scripts/Sticky/jquery.sticky-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jsSOA").IncludeDirectory("~/Scripts/jsSOA", "*.js", true));
        }
    }
}