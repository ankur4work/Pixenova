import { useNavigate, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getBillingStateCached } from "../billing.server";
import { getUsage } from "../usage.server";
import { entitled } from "../plans.server";
import db from "../db.server";
import {
  Page,
  Layout,
  Card,
  Button,
  Badge,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import UsageMeter from "../components/UsageMeter";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let plan = null;
  try {
    plan = (await getBillingStateCached(admin, session.shop)).plan;
  } catch (e) {
    if (e instanceof Response) throw e; // let re-auth propagate
  }

  let usage = { imagesUsed: 0 };
  let autoOptimize = false;
  try {
    usage = await getUsage(session.shop);
    const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
    autoOptimize = settings?.autoOptimize ?? false;
  } catch { /* usage/settings tables not ready — defaults */ }

  return {
    plan: {
      name: plan?.name || "Free",
      tier: plan?.tier || "free",
      monthlyImages: plan?.monthlyImages ?? 100,
      altText: entitled(plan, "altText"),
      pageSpeed: entitled(plan, "pageSpeed"),
      autoOptimizeAllowed: entitled(plan, "autoOptimize"),
    },
    usage,
    autoOptimize,
  };
};

export default function Index() {
  const navigate = useNavigate();
  const { plan, usage, autoOptimize } = useLoaderData();

  const quota = plan.monthlyImages || 0;
  const used = usage?.imagesUsed || 0;
  const remaining = Math.max(0, quota - used);
  const fmt = (n) => Number(n).toLocaleString();

  const autoStatus = !plan.autoOptimizeAllowed
    ? { label: "Growth & up", tone: "attention" }
    : autoOptimize
      ? { label: "On", tone: "success" }
      : { label: "Off", tone: undefined };

  // Tool tiles — a 2-up grid of self-contained cards, each with its own status
  // chip and action, so availability is readable without opening the page.
  const tools = [
    {
      icon: "⊖",
      title: "Image Optimizer",
      desc: "Compress & convert product images to WebP — up to 70% smaller, originals replaced safely.",
      cta: "Open optimizer",
      onClick: () => navigate("/app/productoptimization"),
      available: true,
      chip: { label: "Included", tone: "on" },
    },
    {
      icon: "✎",
      title: "AI Alt Text",
      desc: "Generate SEO alt text for every image with AI vision, then bulk-apply in one click.",
      cta: plan.altText ? "Generate alt text" : "Upgrade to Starter",
      onClick: () => navigate(plan.altText ? "/app/alttextsuggestions" : "/app/billing"),
      available: plan.altText,
      chip: plan.altText
        ? { label: "Included", tone: "on" }
        : { label: "Starter & up", tone: "attention" },
    },
    {
      icon: "⚙",
      title: "Auto-optimize new products",
      desc: "Set & forget — every newly created product gets optimized automatically in the background.",
      cta: plan.autoOptimizeAllowed ? "Manage" : "Upgrade to Growth",
      onClick: () => navigate(plan.autoOptimizeAllowed ? "/app/productoptimization" : "/app/billing"),
      available: plan.autoOptimizeAllowed,
      chip: !plan.autoOptimizeAllowed
        ? { label: "Growth & up", tone: "attention" }
        : autoOptimize
          ? { label: "On", tone: "on" }
          : { label: "Off", tone: "off" },
    },
    {
      icon: "◐",
      title: "Page Speed Reports",
      desc: "Track Core Web Vitals (LCP, CLS, TBT) and see before/after gains per product page.",
      cta: plan.pageSpeed ? "View reports" : "Upgrade to Growth",
      onClick: () => navigate(plan.pageSpeed ? "/app/pagespeedimpactreports" : "/app/billing"),
      available: plan.pageSpeed,
      chip: plan.pageSpeed
        ? { label: "Included", tone: "on" }
        : { label: "Growth & up", tone: "attention" },
    },
  ];

  // Numeric metrics get the big tabular figure; word values get a pill so long
  // labels like "Growth & up" can't wrap into an overlapping headline.
  const metrics = [
    { label: "Current plan", value: plan.name, pill: "brand" },
    { label: "Images used", value: fmt(used) },
    { label: "Images left", value: fmt(remaining) },
    { label: "Auto-optimize", value: autoStatus.label, pill: autoStatus.tone || "subdued" },
  ];

  return (
    <Page>
      {/* Hero — light lavender panel, nova glow top-right, gradient underline.
          Composition is a single vertical stack with the actions on their own
          row underneath, rather than copy-left / button-right: at narrow
          embedded widths the side-by-side arrangement squeezed the headline
          into three lines while the button kept its full width. */}
      <div className="px-hero">
        <BlockStack gap="400">
          <span className="px-hero-tag">Pixenova</span>
          <div className="px-hero-copy">
            <h1>Shrink every image. Keep every pixel.</h1>
            <p>Convert your catalog to WebP, write SEO alt text with AI vision, and watch the measured page-speed gains — all from one place.</p>
          </div>
          <InlineStack gap="300" blockAlign="center" wrap>
            <Button variant="primary" size="large" onClick={() => navigate("/app/productoptimization")}>
              Optimize images
            </Button>
            <Button size="large" onClick={() => navigate("/app/imageoptimizationdashboard")}>
              View analytics
            </Button>
          </InlineStack>
        </BlockStack>
      </div>

      <Layout>
        {/* Reading tiles — leading accent bar + a faint ordinal */}
        <Layout.Section>
          <div className="px-metrics">
            {metrics.map((m, i) => (
              <div key={m.label} className="px-metric">
                <span className="px-metric-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="px-metric-label">{m.label}</p>
                {m.pill ? (
                  <span className={`px-metric-pill px-metric-pill--${m.pill}`} title={m.value}>
                    {m.value}
                  </span>
                ) : (
                  <p className="px-metric-value">{m.value}</p>
                )}
              </div>
            ))}
          </div>
        </Layout.Section>

        {/* Monthly usage */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Text variant="headingSm" as="h2">Monthly image usage</Text>
                  <Badge tone={plan.tier === "free" ? undefined : "success"}>{`${plan.name} plan`}</Badge>
                </InlineStack>
                <Button variant="plain" onClick={() => navigate("/app/billing")}>Manage plan</Button>
              </InlineStack>
              <UsageMeter used={used} quota={quota} />
              <Text variant="bodySm" as="p" tone="subdued">
                {`${fmt(used)} of ${fmt(quota)} images this month · ${fmt(remaining)} remaining`}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Tool tiles */}
        <Layout.Section>
          <div className="px-tools">
            {tools.map((t) => (
              <div key={t.title} className={t.available ? "px-tool" : "px-tool is-locked"}>
                <div className="px-tool-head">
                  <span className="px-tool-icon" aria-hidden="true">{t.icon}</span>
                  <div>
                    <p className="px-tool-title">{t.title}</p>
                    <p className="px-tool-desc" style={{ marginTop: 6 }}>{t.desc}</p>
                  </div>
                </div>
                <div className="px-tool-foot">
                  <span className={`px-tool-chip px-tool-chip--${t.chip.tone}`}>{t.chip.label}</span>
                  <Button variant={t.available ? "primary" : "secondary"} onClick={t.onClick}>
                    {t.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
