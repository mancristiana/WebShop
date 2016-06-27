using GamerShop.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace GamerShop.Repositories
{
    public interface ICartItemRepository
    {
        List<CartItem> GetAll();
        void AddToCart(int productId, int quantity);
        CartItem Find(int id);
        void AddOrUpdate(CartItem cartItem);
        void Delete(CartItem cartItem);
        SelectList GetSelectList(CartItem cartItem); 
    }
}
