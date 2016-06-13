using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GamerShop.Models;
using System.Data.Entity;

namespace GamerShop.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        public List<Product> GetAll()
        {
            return db.Products.ToList();
        }
        
        public List<Product> FilterBy(string searchText = "")
        {
            return db.Products.Where(s => s.Title.Contains(searchText)).ToList();
        }

        public Product Find(int id)
        {
            return db.Products.Find(id);
        }

        public void AddOrUpdate(Product product)
        {
            if(product.Id == 0)
            {
                db.Products.Add(product);
            } 
            else
            {
                db.Entry(product).State = EntityState.Modified;
            }
            db.SaveChanges();
        }

        public void Delete(Product product)
        {
            db.Products.Remove(product);
            db.SaveChanges();
        }
    }
}