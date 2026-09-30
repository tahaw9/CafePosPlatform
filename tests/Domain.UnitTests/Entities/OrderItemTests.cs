using System;
using System.Collections.Generic;
using CafePosBackend.Domain.Entities;
using CafePosBackend.Domain.ValueObjects;
using NUnit.Framework;
using Shouldly;

namespace CafePosBackend.Domain.UnitTests.Entities;

public class OrderItemTests
{
    [Test]
    public void OrderItem_WithoutExtras_ShouldCalculateLineTotalCorrectly()
    {
        var item = new OrderItem
        {
            UnitPrice = 45000,
            Quantity = 3
        };

        item.ExtrasUnitPrice.ShouldBe(0);
        item.TotalUnitPrice.ShouldBe(45000);
        item.LineTotal.ShouldBe(135000);
    }

    [Test]
    public void OrderItem_WithExtras_ShouldCalculateCompositePriceAndLineTotalCorrectly()
    {
        var item = new OrderItem
        {
            UnitPrice = 50000,
            Quantity = 2,
            Extras = new List<OrderItemExtra>
            {
                new(Guid.NewGuid(), "سیروپ کارامل", 12000),
                new(Guid.NewGuid(), "شات اضافه اسپرسو", 15000)
            }
        };

        item.ExtrasUnitPrice.ShouldBe(27000);
        item.TotalUnitPrice.ShouldBe(77000);
        item.LineTotal.ShouldBe(154000);
    }

    [Test]
    public void OrderItemExtra_WithIdenticalValues_ShouldBeEqual()
    {
        var id = Guid.NewGuid();
        var extra1 = new OrderItemExtra(id, "شیر بادام", 20000);
        var extra2 = new OrderItemExtra(id, "شیر بادام", 20000);
        var extra3 = new OrderItemExtra(id, "شیر سویا", 20000);

        (extra1 == extra2).ShouldBeTrue();
        extra1.Equals(extra2).ShouldBeTrue();
        extra1.GetHashCode().ShouldBe(extra2.GetHashCode());

        (extra1 == extra3).ShouldBeFalse();
    }
}
