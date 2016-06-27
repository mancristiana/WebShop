using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GamerShop.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int Quantity { get; set; }

        public virtual Product Product { get; set; }
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        public int CartId { get; set; }

        //[Range(0, 99999)]
        //[DataType(DataType.Currency)]
        //public decimal PriceTimesQuantity {
        //    get
        //    {
        //        return Product.Price * Quantity; 
        //    }
        //}

    }
}