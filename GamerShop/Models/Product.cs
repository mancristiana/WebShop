using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GamerShop.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public string ImgUrl { get; set; }

        [Required]
        [Range(0, 99999)]
        [DataType(DataType.Currency)]
        public decimal Price { get; set; }
        
        [Display(Name = "Left in stock")]
        public int StockCount { get; set; }
    }
}