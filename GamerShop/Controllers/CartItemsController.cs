using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using GamerShop.Models;
using GamerShop.Repositories;

namespace GamerShop.Controllers
{
    public class CartItemsController : Controller
    {
        //private ApplicationDbContext db = new ApplicationDbContext();
        private ICartItemRepository repo;

        public CartItemsController(ICartItemRepository repo)
        {
            this.repo = repo;
        }


        public ActionResult Index()
        {
            return View(repo.GetAll());
        }

        [HttpPost]
        public ActionResult AddToCart(int productId)
        {
            repo.AddToCart(productId, 1);
            return RedirectToAction("Index");
        }

        // GET: CartItems/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            CartItem cartItem = repo.Find((int)id);
            if (cartItem == null)
            {
                return HttpNotFound();
            }
            return View(cartItem);
        }

        // GET: CartItems/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            CartItem cartItem = repo.Find((int)id);
            if (cartItem == null)
            {
                return HttpNotFound();
            }
            ViewBag.ProductId = repo.GetSelectList(cartItem);
            return View(cartItem);
        }

        // POST: CartItems/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "Id,Quantity,ProductId,CartId")] CartItem cartItem)
        {
            if (ModelState.IsValid)
            {
                repo.AddOrUpdate(cartItem);
                return RedirectToAction("Index");
            }
            ViewBag.ProductId = repo.GetSelectList(cartItem);
            return View(cartItem);
        }

        // GET: CartItems/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            CartItem cartItem = repo.Find((int)id);
            if (cartItem == null)
            {
                return HttpNotFound();
            }
            return View(cartItem);
        }

        // POST: CartItems/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            CartItem cartItem = repo.Find((int)id);
            repo.Delete(cartItem);           
            return RedirectToAction("Index");
        }

    }
}
