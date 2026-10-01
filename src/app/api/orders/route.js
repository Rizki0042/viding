import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi pesanan tidak valid." }, { status: 400 });
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (!customerName || customerName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !address || address.length > 500) {
    return NextResponse.json({ error: "Periksa kembali nama, email, dan alamat." }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    return NextResponse.json({ error: "Keranjang pesanan tidak valid." }, { status: 400 });
  }

  const quantities = new Map();
  for (const item of body.items) {
    if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return NextResponse.json({ error: "Jumlah produk tidak valid." }, { status: 400 });
    }
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }

  try {
    const order = await prisma.$transaction(async (transaction) => {
      const orderLines = [];
      let total = 0;

      for (const [productId, quantity] of quantities) {
        const product = await transaction.product.findUnique({ where: { id: productId } });
        if (!product) {
          const error = new Error("Salah satu produk sudah tidak tersedia.");
          error.status = 404;
          throw error;
        }
        const stockUpdate = await transaction.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (stockUpdate.count !== 1) {
          const error = new Error(`Stok ${product.name} tidak mencukupi.`);
          error.status = 409;
          throw error;
        }
        total += product.price * quantity;
        orderLines.push({ productId, quantity, unitPrice: product.price });
      }

      return transaction.order.create({
        data: {
          customerName,
          email,
          address,
          total,
          items: { create: orderLines },
        },
        select: { id: true, total: true, createdAt: true },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error.status) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Pesanan gagal disimpan. Coba lagi sebentar." }, { status: 500 });
  }
}
