using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GamerShop.Controllers;
using System.Web.Mvc;

namespace GamerShop.Tests.Controllers
{
    [TestClass]
    public class ProdctControllerTest
    {
        [TestMethod]
        public void IndexActionReturnsView()
        {
            var productsController = new ProductsController();
            var result = productsController.Index() as ViewResult;
            Assert.AreEqual("Index", result.ViewName);
        }
    }
}
