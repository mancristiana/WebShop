using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GamerShop.Models;

namespace GamerShop.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        public void Delete(int id)
        {

            throw new NotImplementedException();
        }

        public List<Product> FilterBy(string searchText)
        {
            throw new NotImplementedException();
        }

        public Product Find(int id)
        {
            throw new NotImplementedException();
        }

        public List<Product> GetAll()
        {
            throw new NotImplementedException();
        }

        public void Insert(Product product)
        {
            throw new NotImplementedException();
        }

        public void Update(Product product)
        {
            throw new NotImplementedException();
        }
    }
}