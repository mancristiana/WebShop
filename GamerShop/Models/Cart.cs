using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace GamerShop.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }
        public bool IsCurrent { get; set; }

        [Required]
        public int UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public virtual ICollection<CartItem> CartItems { get; set; }
    }
}