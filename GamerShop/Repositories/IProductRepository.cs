using GamerShop.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GamerShop.Repositories
{
    public interface IProductRepository
    {
        List<Product> GetAll();
        Product Find(int id);
        void AddOrUpdate(Product product);
        void Delete(Product product);
        List<Product> FilterBy(string searchText);

    }
}
