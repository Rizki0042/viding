import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const where = {};

  if (category && category !== "Semua produk") {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { category: { contains: search } },
    ];
  }

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        price: true,
        oldPrice: true,
        image: true,
        tone: true,
        badge: true,
        stock: true,
      },
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Katalog belum siap. Jalankan setup database terlebih dahulu." },
      { status: 503 },
    );
  }
}
