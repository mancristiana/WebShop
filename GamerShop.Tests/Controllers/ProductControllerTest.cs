using System;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GamerShop.Controllers;
using System.Web.Mvc;
using GamerShop.Repositories;
using GamerShop.Controllers;
using GamerShop.Models;

namespace GamerShop.Tests.Controllers
{
    [TestClass]
    public class ProdctControllerTest
    {
        //[TestMethod]
        //public void IndexActionReturnsView()
        //{
        //    var productsController = new ProductsController();
        //    var result = productsController.Index() as ViewResult;
        //    Assert.AreEqual("Index", result.ViewName);
        //}

        [TestMethod]
        public void Test_ProductsController_Index_CallsFilterBy()
        {
            // Arrange
            Mock<IProductRepository> mockProductRepo = new Mock<IProductRepository>();
            ProductsController controller = new ProductsController(mockProductRepo.Object);
            string queryString = "Biscuit";

            // Act
            controller.Index(queryString);

            // Assert
            mockProductRepo.Verify(mock => mock.FilterBy(queryString));
        }

        [TestMethod]
        public void Test_ProductsController_Index_CallsFilterBy_withNoQueryString()
        {
            // Arrange
            Mock<IProductRepository> mockProductRepo = new Mock<IProductRepository>();
            ProductsController controller = new ProductsController(mockProductRepo.Object);

            // Act
            controller.Index();

            // Assert
            mockProductRepo.Verify(mock => mock.FilterBy(""));
        }

        [TestMethod]
        public void Test_ProductsController_Details_CallsFind()
        {
            // Arrange
            Mock<IProductRepository> mockProductRepo = new Mock<IProductRepository>();
            ProductsController controller = new ProductsController(mockProductRepo.Object);
            var id = 1;

            // Act
            controller.Details(id);

            // Assert
            mockProductRepo.Verify(mock => mock.Find(id));
        }

        [TestMethod]
        public void Test_ProductsController_Create_CallsAddOrUpdate()
        {
            // Arrange
            Mock<IProductRepository> mockProductRepo = new Mock<IProductRepository>();
            ProductsController controller = new ProductsController(mockProductRepo.Object);

            Product p = new Product
            {
                Title = "Blueberry Cookie",
                Description = "100 grams of delicious crunchyness!!!",
                ImgUrl = "Content/img/products/12.jpg",
                Price = 20,
                StockCount = 253
            };

            // Act
            controller.Create(p);

            // Assert
            mockProductRepo.Verify(mock => mock.AddOrUpdate(p));
        }
    }
}
