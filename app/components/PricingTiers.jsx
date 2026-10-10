import { PLAN_TIERS } from "../planCatalog";

// 4-tier pricing comparison used by both the standalone pricing page and the
// in-app pricing wall. Presentational only: every plan CTA is a real top-frame
// link (`target="_top"`) to Shopify's hosted managed-pricing page, where the
// actual price/cycle live and are picked. A direct anchor is used (rather than a
// form POST + reauthorize-header redirect) because a user click is a reliable
// user-activation that can navigate the top frame out of the embedded iframe —
// the POST-based redirect intermittently failed during initial setup and looped
// the merchant back to the app index.
//
// NOTE: we intentionally do NOT show prices here. Prices are owned by the
// Partner Dashboard plans and can be changed there without a code deploy;
// rendering them in-app would risk showing a stale amount. The merchant sees the
// real price on Shopify's pricing page after clicking through.
//
// Design: every card is light. The recommendation is carried by a violet RING
// plus a halo and a ribbon that sits in the card's own header row — not by
// inverting the card to ink, and not by lifting it out of the grid. Both of
// those shift the recommended card's baseline away from its neighbours, which
// is what previously let the badge collide with the heading.
export default function PricingTiers({ pricingUrl }) {
  return (
    <div style={s.page}>
      <div style={s.inner}>
        <header style={s.head}>
          <span style={s.tag}>
            <i style={s.tagMark} aria-hidden="true" />
            Pixenova
          </span>
          <h1 style={s.heading}>One plan per catalog size.</h1>
          <div style={s.rule} aria-hidden="true" />
          <p style={s.subheading}>
            Shrink your images, lift your page speed, and rank higher. Start free and
            move up whenever your catalog does.
          </p>
        </header>

        <div style={s.grid}>
          {PLAN_TIERS.map((tier) => {
            const hot = Boolean(tier.popular);
            return (
              <div key={tier.name} style={hot ? s.cardHot : s.card}>
                <span style={hot ? s.railHot : s.rail} aria-hidden="true" />
                <div style={s.cardBody}>
                  <div style={s.tierRow}>
                    <p style={s.tierName}>{tier.name}</p>
                    {hot && <span style={s.ribbon}>Recommended</span>}
                  </div>
                  <p style={s.tagline}>{tier.tagline}</p>

                  <div style={hot ? s.quotaBoxHot : s.quotaBox}>
                    <span style={s.quotaMark} aria-hidden="true" />
                    <span style={s.quotaText}>
                      <span style={s.quotaNum}>{tier.images}</span>
                      <span style={s.quotaUnit}>images / month</span>
                    </span>
                  </div>

                  <div style={s.featureList}>
                    {tier.features.map((f, i) => (
                      <div key={i} style={s.featureRow}>
                        <span style={s.mark} aria-hidden="true" />
                        <span style={s.featureText}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={pricingUrl}
                    target="_top"
                    style={{
                      ...(hot ? s.ctaHot : s.cta),
                      display: "block",
                      textAlign: "center",
                      textDecoration: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {tier.price === 0 ? "Start free" : "Choose plan"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p style={s.disclaimer}>Secure billing through Shopify · Change or cancel anytime</p>
      </div>
    </div>
  );
}

/* Palette mirrors app/styles/pixenova.css. Kept as literals because this
   component renders on the public pricing page too, where the app stylesheet's
   custom properties are available but inline styles cannot read them in a
   server-rendered first paint. */
const INK = "#1b0b33";
const VIOLET = "#7c3aed";
const VIOLET_DEEP = "#5b21b6";
const MUTED = "#6b5a85";
const LINE = "#e4d8f5";
const GRAD = "linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)";
const HEX = "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";
const CHEVRON = "polygon(0 0, 100% 50%, 0 100%)";
const NOTCH = "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)";

const s = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(55% 50% at 90% 2%, rgba(217,70,239,0.15) 0%, rgba(217,70,239,0) 62%), radial-gradient(65% 55% at 4% 98%, rgba(124,58,237,0.11) 0%, rgba(124,58,237,0) 60%), linear-gradient(180deg, #faf6ff 0%, #f3ebff 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "52px 24px 60px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
    boxSizing: "border-box",
  },
  inner: { width: "100%", maxWidth: 1120 },
  head: { maxWidth: 680, marginBottom: 34 },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: VIOLET_DEEP,
    background: "#ffffff",
    border: `1px solid ${LINE}`,
    borderRadius: 7,
    padding: "6px 12px 6px 10px",
    marginBottom: 18,
  },
  tagMark: { width: 9, height: 10, background: GRAD, clipPath: HEX, flexShrink: 0 },
  heading: {
    fontSize: 38,
    fontWeight: 750,
    color: INK,
    margin: "0 0 14px 0",
    letterSpacing: "-0.034em",
    lineHeight: 1.08,
  },
  // The gradient rule under the headline, matching the splash and the hero.
  rule: {
    width: 108,
    height: 3,
    borderRadius: 2,
    background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 45%, #d946ef 100%)",
    marginBottom: 16,
  },
  subheading: { fontSize: 15, lineHeight: 1.62, color: MUTED, margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(234px, 1fr))",
    gap: 16,
    width: "100%",
    alignItems: "stretch",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    borderRadius: 10,
    border: `1px solid ${LINE}`,
    clipPath: NOTCH,
    boxShadow: "0 1px 2px rgba(27,11,51,0.05)",
  },
  // Recommended: a violet ring plus a halo, same geometry as its neighbours.
  cardHot: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    borderRadius: 10,
    border: `2px solid ${VIOLET}`,
    clipPath: NOTCH,
    boxShadow:
      "0 0 0 4px rgba(124,58,237,0.12), 0 22px 44px -24px rgba(91,33,182,0.5)",
  },
  // Leading accent bar, the same signature the in-app stat tiles carry.
  rail: {
    position: "absolute",
    top: 14,
    bottom: 14,
    left: 0,
    width: 3,
    borderRadius: "0 2px 2px 0",
    background: "linear-gradient(180deg, #cbb6f5 0%, #a855f7 100%)",
  },
  railHot: {
    position: "absolute",
    top: 14,
    bottom: 14,
    left: 0,
    width: 3,
    borderRadius: "0 2px 2px 0",
    background: "linear-gradient(180deg, #a855f7 0%, #7c3aed 55%, #6d28d9 100%)",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "22px 20px 20px 22px",
    flex: 1,
  },
  tierRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 22,
  },
  tierName: {
    fontSize: 17,
    fontWeight: 750,
    color: INK,
    margin: 0,
    letterSpacing: "-0.015em",
  },
  ribbon: {
    fontSize: 9.5,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#ffffff",
    background: GRAD,
    borderRadius: "2px 6px 6px 2px",
    padding: "4px 9px",
    whiteSpace: "nowrap",
  },
  tagline: { fontSize: 12.5, color: MUTED, margin: "-6px 0 0 0" },
  quotaBox: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "12px 14px",
    borderRadius: "2px 10px 10px 2px",
    background: "#faf6ff",
    border: `1px solid ${LINE}`,
    borderLeft: "3px solid #cbb6f5",
  },
  quotaBoxHot: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "12px 14px",
    borderRadius: "2px 10px 10px 2px",
    background: "#f3ebff",
    border: `1px solid ${LINE}`,
    borderLeft: `3px solid ${VIOLET}`,
  },
  // Hexagon mark — the icon shape used throughout the app.
  quotaMark: {
    width: 14,
    height: 16,
    background: GRAD,
    clipPath: HEX,
    flexShrink: 0,
  },
  quotaText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  quotaNum: {
    fontSize: 22,
    fontWeight: 750,
    color: VIOLET_DEEP,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    fontVariantNumeric: "tabular-nums",
  },
  quotaUnit: { fontSize: 11.5, color: MUTED, fontWeight: 650 },
  featureList: { display: "flex", flexDirection: "column", gap: 9, flex: 1 },
  featureRow: { display: "flex", alignItems: "flex-start", gap: 9 },
  // A chevron instead of a check glyph or a rotated diamond.
  mark: {
    width: 7,
    height: 9,
    marginTop: 5,
    background: VIOLET,
    clipPath: CHEVRON,
    flexShrink: 0,
  },
  featureText: { fontSize: 12.5, color: "#4a3a63", lineHeight: "18px" },
  cta: {
    width: "100%",
    padding: "11px 12px",
    background: "#ffffff",
    color: VIOLET_DEEP,
    border: `1px solid ${LINE}`,
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 750,
  },
  ctaHot: {
    width: "100%",
    padding: "11px 12px",
    background: GRAD,
    color: "#ffffff",
    border: `1px solid ${VIOLET}`,
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 750,
    boxShadow: "0 8px 20px -10px rgba(124,58,237,0.7)",
  },
  disclaimer: { fontSize: 12, color: MUTED, marginTop: 30 },
};
