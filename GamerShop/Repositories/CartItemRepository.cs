using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GamerShop.Models;
using System.Data.Entity;
using System.Web.Mvc;

namespace GamerShop.Repositories
{
    public class CartItemRepository : ICartItemRepository
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        public void AddOrUpdate(CartItem cartItem)
        {
            if (cartItem.Id == 0)
            {
                db.CartItems.Add(cartItem);
            }
            else
            {
                db.Entry(cartItem).State = EntityState.Modified;
            }
            db.SaveChanges();
        }

        public void AddToCart(int productId, int quantity)
        {
            var p = db.Products.Find(productId);
            var cartItem = new CartItem { CartId = 1, Product = p, ProductId = productId, Quantity = quantity };
            AddOrUpdate(cartItem);
        }

        public void Delete(CartItem cartItem)
        {
            db.CartItems.Remove(cartItem);
            db.SaveChanges();
        }

        public CartItem Find(int id)
        {
            return db.CartItems.Find(id);
        }

        public List<CartItem> GetAll()
        {
            var cartItems = from c in db.CartItems
                            where c.CartId.Equals(1)
                            select c;
            return cartItems.ToList();
        }

        public SelectList GetSelectList(CartItem cartItem)
        {
            return new SelectList(db.Products, "Id", "Title", cartItem.ProductId);
        }
    }
}