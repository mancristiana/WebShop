namespace GamerShop.Migrations
{
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Models;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<GamerShop.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(GamerShop.Models.ApplicationDbContext context)
        {
            var userStore = new UserStore<ApplicationUser>(context);
            var userManager = new UserManager<ApplicationUser>(userStore);

            if (!context.Users.Any(t => t.UserName == "admin@snacks.com"))
            {
                var user = new ApplicationUser { UserName = "admin@snacks.com", Email = "admin@snacks.com" };
                userManager.Create(user, "Pa55word!");

                context.Roles.AddOrUpdate(r => r.Name, new IdentityRole { Name = "Admin" });
                context.SaveChanges();

                userManager.AddToRole(user.Id, "Admin");
            }

            context.Products.AddOrUpdate(p => p.Id,
                new Product { Id = 1, Title = "One Energy", Description = "Juicy refreshment", ImgUrl = "/Content/img/products/1.jpg", Price = 18, StockCount = 3 },
                new Product { Id = 2, Title = "Mario Soda", Description = " N'/Content/img/products/2.jpg", Price = 40, StockCount = 540 },
                new Product { Id = 3, Title = "Mana Drink", Description = "Alternative drink with the unique look of a magic potion. Comes in two types: Mana and Potion", ImgUrl = "/Content/img/products/3.jpg", Price = 10, StockCount = 2346 },
                new Product { Id = 4, Title = "Spaz Juice", Description = "All the energy you need to bother everyone else! For an energetic freak that will annoy everyone!", ImgUrl = "/Content/img/products/4.jpg", Price = 15, StockCount = 131 },
                new Product { Id = 5, Title = "Aloe Vera King", Description = "The yummiest drink comes in various types and flavors! Choose your own favorite! ", ImgUrl = "/Content/img/products/5.jpg", Price = 12, StockCount = 155 },
                new Product { Id = 6, Title = "1 UP Drink", Description = "Level up energy drink! Satisfy your thirst with this wonderful drink. Comes in various flavours such as Grape, Strawberry and Lemon!", ImgUrl = "/Content/img/products/6.jpg", Price = 12, StockCount = 4313 },
                new Product { Id = 7, Title = "Health Potion", Description = "Health Potion is a soda with a delightful melon strawberry taste! Contains 250 ml. Try out this Fantasy themed drink that spices up your afternoon. Best at parties, conventions or just to share with awesome friends!", ImgUrl = "/Content/img/products/7.jpg", Price = 15, StockCount = 545 },
                new Product { Id = 8, Title = "Choco Biscuits", Description = "Wonderful cocoa biscuits with dark chocolate bits and crunchyness you cannot forget! Warning! Very Addictive! The package contains 10 biscuits. Total 100 grams.", ImgUrl = "/Content/img/products/8.jpg", Price = 34, StockCount = 13 },
                new Product { Id = 9, Title = "Double Biscuits", Description = "Delightful taste of biscuitty pleasure! Crunchyness you get addicted to! The package is made with lots of love by CookieMonster and it contains 15 biscuits. You can choose between 2 flavours: vanilla and chocolate!", ImgUrl = "/Content/img/products/9.jpg", Price = 20, StockCount = 434 },
                new Product { Id = 10, Title = "Homemade Chocolate", Description = "The package contains 30 pieces amounting to 100 grams. Warning! Very Addictive! Take this deliciousness right to your home! Order now!", ImgUrl = "/Content/img/products/10.jpg", Price = 20, StockCount = 1232 },
                new Product { Id = 11, Title = "Skull Drink", Description = "This energy drink comes in 4 flavours: lemon, blueberry, cherry and licorice. The recipient is 350ml.", ImgUrl = "/Content/img/products/11.jpg", Price = 15, StockCount = 2344 },
                new Product { Id = 12, Title = "Pacman Drink", Description = "Alternative energy drink with the unique look of the classic retro Pacman game. Contains 350ml. Packman Drink is perfect at parties, conventions or just sharing with awesome friends! Order now this awesome drink!", ImgUrl = "/Content/img/products/12.jpg", Price = 20, StockCount = 12415 },
                new Product { Id = 13, Title = "Munchy Cookies", Description = "These heart shaped delicious cookies are carefully created with great attention to detail! The decorations can be customized! Contact CookieMonster for special orders! Meanwhile feel free to order the default awesome package of Munchy Cookies! The package contains 40 pieces amounting to 500 grams. Warning! Very Addictive! Take this deliciousness right to your home! Order now!", ImgUrl = "/Content/img/products/13.jpg", Price = 40, StockCount = 213 },
                new Product { Id = 14, Title = "Macaron", Description = "These colorful delicious snacks are carefully created with great attention to detail! The package contains 30 macarons of 15 different flavours. Contact CookieMonster for special orders! Meanwhile feel free to order the default awesome package of Macarons! The package amounts to 300 grams. Warning! Very Addictive! Take this deliciousness right to your home! Order now!", ImgUrl = "/Content/img/products/14.jpg", Price = 100, StockCount = 2645 },
                new Product { Id = 15, Title = "Custom Chocolate Bites", Description = "These various shaped delicious chocolates are carefully created with great attention to detail! The decorations can be customized! Contact Cookie Monster for special orders! Meanwhile feel free to order the default awesome package of Chocolate Bites! The package contains 30 pieces amounting to 200 grams. Warning! Very Addictive! Take this deliciousness right to your home! Order now!", ImgUrl = "/Content/img/products/15.jpg", Price = 50, StockCount = 124 }
                );

          
        }
    }
}
