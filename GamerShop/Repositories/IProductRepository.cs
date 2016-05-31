using GamerShop.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GamerShop.Repositories
{
    interface IProductRepository
    {
        List<Product> GetAll();
        Product Find(int id);
        void Insert(Product product);
        void Update(Product product);
        void Delete(int id);
        List<Product> FilterBy(string searchText);

    }
}
