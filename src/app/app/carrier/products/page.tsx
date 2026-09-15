"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PERIL_LABEL } from "@/lib/labels";
import { PageTitle } from "@/components/app/ui";
import { Button, Field, inputClass } from "@/components/ui/forms";

type Product = {
  id: string;
  name: string;
  peril: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  states: string;
  triggerDescription: string;
  payoutSchedule: unknown;
  active: boolean;
};

export default function CarrierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    api<{ products: Product[] }>("/carrier-products")
      .then((data) => setProducts(data.products))
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      await api("/carrier-products", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          peril: form.get("peril"),
          propertyType: form.get("propertyType"),
          states: form.get("states"),
          triggerDescription: form.get("triggerDescription"),
          payoutSchedule: form.get("payoutSchedule"),
        }),
      });
      setMessage("Product listed.");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product");
    }
  }

  async function toggleActive(product: Product) {
    try {
      await api(`/carrier-products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !product.active }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update product");
    }
  }

  return (
    <div>
      <PageTitle
        kicker="Carrier"
        title="Your parametric products"
        body="List and manage the products FiSure can match against incoming property submissions — no FiSure staff involvement required."
      />
      {error ? <p className="mb-4 text-sm text-sand">{error}</p> : null}
      {message ? <p className="mb-4 text-sm text-muted">{message}</p> : null}

      <div className="mb-8">
        <Button type="button" variant="ghost" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "List a new product"}
        </Button>
        {showForm ? (
          <form onSubmit={createProduct} className="mt-4 grid max-w-lg gap-3">
            <Field label="Product name">
              <input name="name" required className={inputClass()} />
            </Field>
            <Field label="Peril">
              <select name="peril" className={inputClass()} defaultValue="FL_HURRICANE">
                <option value="FL_HURRICANE">Florida hurricane</option>
                <option value="FL_FLOOD">Florida flood</option>
                <option value="CA_WILDFIRE">California wildfire</option>
                <option value="CA_EARTHQUAKE">California earthquake</option>
              </select>
            </Field>
            <Field label="Property type">
              <select name="propertyType" className={inputClass()} defaultValue="RESIDENTIAL">
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </Field>
            <Field label="States" hint="e.g. FL or CA">
              <input name="states" required className={inputClass()} />
            </Field>
            <Field label="Trigger description">
              <input name="triggerDescription" required className={inputClass()} />
            </Field>
            <Field
              label="Payout schedule (JSON, optional)"
              hint='e.g. {"bands":[{"pct":40},{"pct":70},{"pct":100}]}'
            >
              <textarea name="payoutSchedule" rows={3} className={inputClass()} />
            </Field>
            <Button type="submit">Create product</Button>
          </form>
        ) : null}
      </div>

      <div className="grid gap-px bg-line">
        {products.map((product) => (
          <div key={product.id} className="flex flex-wrap items-start justify-between gap-4 bg-background p-5">
            <div>
              <p className="font-serif text-xl">{product.name}</p>
              <p className="mt-1 text-sm text-muted">
                {PERIL_LABEL[product.peril] ?? product.peril} · {product.states} ·{" "}
                {product.propertyType === "COMMERCIAL" ? "Commercial" : "Residential"}
              </p>
              <p className="mt-1 text-sm text-muted">{product.triggerDescription}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
                {product.active ? "Active" : "Inactive"}
              </span>
              <Button type="button" variant="ghost" onClick={() => toggleActive(product)}>
                {product.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
        {products.length === 0 ? (
          <p className="bg-background p-5 text-sm text-muted">No products listed yet.</p>
        ) : null}
      </div>
    </div>
  );
}
