using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using GamerShop.Models;

namespace GamerShop.Controllers
{
    public class CartsController : Controller
    {
        private ApplicationDbContext db = new ApplicationDbContext();

        // GET: Carts
        public ActionResult Index()
        {
            var carts = db.Carts.Include(c => c.User);
            return View(carts.ToList());
        }

        // GET: Carts/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            Cart cart = db.Carts.Find(id);
            if (cart == null)
            {
                return HttpNotFound();
            }
            return View(cart);
        }
    }
}
