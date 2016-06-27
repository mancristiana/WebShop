﻿using System;
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
        public string ProductId { get; set; }

        public virtual Cart Cart { get; set; }
        [Required]
        public int CartId { get; set; }
    }
}