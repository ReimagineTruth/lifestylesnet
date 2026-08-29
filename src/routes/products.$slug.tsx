import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { useState } from "react";

import { Check, ShoppingBag } from "lucide-react";

import { toast } from "sonner";

import {

  getDefaultVariant,

  getProduct,

  peso,

  pesoExact,

  products,

  variantCartLabel,

  type ProductVariant,

} from "@/lib/products";

import { useCart } from "@/lib/cart";

import { tl } from "@/lib/tagalog";
import { fetchProduct } from "@/lib/products.server";



export const Route = createFileRoute("/products/$slug")({

  loader: async ({ params }) => {
    const product = (await fetchProduct({ data: params.slug })) ?? getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },

  head: ({ loaderData }) => {

    if (!loaderData) {

      return {

        meta: [{ title: "Product not found | Lifestyles Philippines" }, { name: "robots", content: "noindex" }],

      };

    }

    const { product } = loaderData;

    const title = `${product.name} — ${product.tagline} | Lifestyles Philippines`;

    return {

      meta: [

        { title },

        { name: "description", content: product.short },

        { property: "og:title", content: title },

        { property: "og:description", content: product.short },

      ],

    };

  },

  component: ProductDetail,

});



function ProductDetail() {

  const { product } = Route.useLoaderData();

  const { add } = useCart();

  const [selected, setSelected] = useState<ProductVariant>(getDefaultVariant(product));

  const [qty, setQty] = useState(1);



  const related = products.filter((p) => p.slug !== product.slug);



  return (

    <div className="container-page py-10">

      <nav className="text-sm text-muted-foreground">

        <Link to="/products" className="hover:text-foreground">

          Products

        </Link>

        <span className="px-2">/</span>

        <span className="text-foreground">{product.name}</span>

      </nav>



      <div className="mt-8 grid gap-12 lg:grid-cols-2">

        <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-8">

          <img

            src={product.image}

            alt={`${product.name} bottle`}

            width={1024}

            height={1024}

            className="aspect-square w-full object-contain"

          />

        </div>



        <div>

          <h1 className="text-4xl font-semibold">{product.name}</h1>

          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <p className="mt-6 text-3xl font-semibold">{peso(selected.price)}</p>

          <p className="mt-1 text-sm text-muted-foreground">

            {selected.size} · Code {selected.code} · {selected.points} pts · In stock

          </p>



          <div className="mt-6">

            <p className="text-sm font-semibold">Choose bundle</p>

            <div className="mt-3 space-y-2">

              {product.variants.map((variant) => (

                <label

                  key={variant.id}

                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm transition-colors ${

                    selected.id === variant.id

                      ? "border-brand bg-brand-soft"

                      : "border-border hover:bg-muted/50"

                  }`}

                >

                  <span className="flex items-center gap-3">

                    <input

                      type="radio"

                      name="variant"

                      checked={selected.id === variant.id}

                      onChange={() => setSelected(variant)}

                      className="accent-brand"

                    />

                    <span>

                      <span className="font-medium">{variant.label}</span>

                      <span className="mt-0.5 block text-xs text-muted-foreground">

                        {variant.size}

                      </span>

                    </span>

                  </span>

                  <span className="shrink-0 font-semibold">{pesoExact(variant.price)}</span>

                </label>

              ))}

            </div>

          </div>



          <div className="mt-8 flex flex-wrap items-center gap-3">

            <div className="flex items-center rounded-md border border-border">

              <button

                type="button"

                aria-label="Decrease quantity"

                onClick={() => setQty((q) => Math.max(1, q - 1))}

                className="px-4 py-2 text-lg"

              >

                −

              </button>

              <span className="w-10 text-center text-sm font-medium">{qty}</span>

              <button

                type="button"

                aria-label="Increase quantity"

                onClick={() => setQty((q) => q + 1)}

                className="px-4 py-2 text-lg"

              >

                +

              </button>

            </div>

            <button

              type="button"

              onClick={() => {

                add(selected.id, qty);

                toast.success(tl.toast.addedToCart(variantCartLabel(product, selected)));

              }}

              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"

            >

              <ShoppingBag className="h-4 w-4" /> Add to cart

            </button>

            <Link

              to="/cart"

              className="rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"

            >

              View cart

            </Link>

          </div>



          <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">

            {product.description.map((para) => (

              <p key={para}>{para}</p>

            ))}

          </div>



          <ul className="mt-8 space-y-3">

            {product.benefits.map((b) => (

              <li key={b} className="flex items-start gap-3 text-sm">

                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />

                <span>{b}</span>

              </li>

            ))}

          </ul>



          <dl className="mt-10 space-y-6 border-t border-border pt-8 text-sm">

            <div>

              <dt className="font-semibold">Ingredients</dt>

              <dd className="mt-1 text-muted-foreground">{product.ingredients}</dd>

            </div>

            <div>

              <dt className="font-semibold">Directions</dt>

              <dd className="mt-1 text-muted-foreground">{product.directions}</dd>

            </div>

          </dl>

          <p className="mt-8 text-xs text-muted-foreground">No approved therapeutic claims.</p>

        </div>

      </div>



      <section className="mt-24">

        <h2 className="text-2xl font-semibold">You may also like</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">

          {related.map((p) => (

            <Link

              key={p.slug}

              to="/products/$slug"

              params={{ slug: p.slug }}

              className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-lg"

            >

              <img

                src={p.image}

                alt={p.name}

                loading="lazy"

                width={1024}

                height={1024}

                className="aspect-square w-full rounded-lg object-cover"

              />

              <h3 className="mt-4 font-semibold">{p.name}</h3>

              <p className="text-sm text-muted-foreground">{p.tagline}</p>

            </Link>

          ))}

        </div>

      </section>

    </div>

  );

}


