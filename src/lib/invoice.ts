import { formatMoney } from "./brand";
import type { AdminOrder } from "./admin-schemas";

/** Builds a clean, printable invoice document for one order. */
export function invoiceHtml(order: AdminOrder, storeName: string, supportPhone: string) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td class="n">${i.qty}</td><td class="n">${formatMoney(
          i.price,
        )}</td><td class="n">${formatMoney(i.price * i.qty)}</td></tr>`,
    )
    .join("");

  const line = (label: string, value: string, strong = false) =>
    `<tr class="${strong ? "strong" : ""}"><td colspan="3" class="r">${label}</td><td class="n">${value}</td></tr>`;

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>Invoice ${escapeHtml(order.code)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#1c1917;margin:0;padding:40px;background:#fff}
  .wrap{max-width:720px;margin:0 auto}
  h1{font-size:26px;margin:0}
  .muted{color:#78716c;font-size:13px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;border-bottom:2px solid #e7e5e4;padding-bottom:18px}
  .grid{display:flex;gap:32px;flex-wrap:wrap;margin:22px 0}
  .grid div{min-width:200px}
  h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#78716c;margin:0 0 6px}
  table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
  th,td{padding:9px 8px;border-bottom:1px solid #f0eeec;text-align:left}
  th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#78716c}
  .n{text-align:right;white-space:nowrap}
  .r{text-align:right;color:#78716c}
  .strong td{font-weight:700;color:#1c1917;font-size:16px;border-bottom:none}
  footer{margin-top:28px;border-top:1px solid #e7e5e4;padding-top:14px;font-size:12px;color:#78716c}
  @media print{body{padding:0}}
</style></head><body><div class="wrap">
  <div class="head">
    <div><h1>${escapeHtml(storeName)}</h1><p class="muted">Cash on delivery · ${escapeHtml(supportPhone)}</p></div>
    <div style="text-align:right"><h1>Invoice</h1><p class="muted">${escapeHtml(order.code)}<br/>${new Date(
      order.placed_at,
    ).toLocaleString()}</p></div>
  </div>
  <div class="grid">
    <div><h2>Billed to</h2><p class="muted">${escapeHtml(order.customer_name)}<br/>${escapeHtml(
      order.phone,
    )}${order.email ? `<br/>${escapeHtml(order.email)}` : ""}</p></div>
    <div><h2>Delivery address</h2><p class="muted">${escapeHtml(order.address)}${
      order.landmark ? `<br/>${escapeHtml(order.landmark)}` : ""
    }${order.pincode ? `<br/>${escapeHtml(order.pincode)}` : ""}</p></div>
    <div><h2>Status</h2><p class="muted">${escapeHtml(order.status.replace(/_/g, " "))}</p></div>
  </div>
  <table>
    <thead><tr><th>Item</th><th class="n">Qty</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot>
      ${line("Subtotal", formatMoney(order.subtotal))}
      ${order.discount > 0 ? line("Discount", `− ${formatMoney(order.discount)}`) : ""}
      ${line("Delivery", formatMoney(order.delivery_fee))}
      ${line("Taxes", formatMoney(order.tax))}
      ${line("Total payable", formatMoney(order.total), true)}
    </tfoot>
  </table>
  ${order.admin_notes ? `<p class="muted"><strong>Note:</strong> ${escapeHtml(order.admin_notes)}</p>` : ""}
  <footer>Thank you for ordering from ${escapeHtml(storeName)}. This is a computer-generated invoice.</footer>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
}

/** Opens the invoice in a new tab and triggers the browser's print / save-as-PDF dialog. */
export function printInvoice(order: AdminOrder, storeName: string, supportPhone: string) {
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return false;
  w.document.write(invoiceHtml(order, storeName, supportPhone));
  w.document.close();
  return true;
}

function escapeHtml(s: string) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}