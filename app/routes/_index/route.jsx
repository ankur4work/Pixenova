import { redirect, Form, Link, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <span className={styles.tag}>Pixenova</span>
        <h1 className={styles.heading}>Shrink every image. Keep every pixel.</h1>
        <p className={styles.text}>
          Pixenova is an image optimization &amp; SEO suite for Shopify. It converts your
          whole catalog to WebP, writes SEO alt text with AI vision, and measures the
          page-speed it buys you — in real file sizes, not estimates.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span className={styles.hint}>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Smart compression</strong>
            <span>
              Cut image weight by up to 70% with automatic WebP conversion — originals
              replaced safely, image order preserved.
            </span>
          </li>
          <li>
            <strong>AI alt text</strong>
            <span>
              One AI-written caption per product, applied across every image, so your
              catalog is accessible and search-friendly.
            </span>
          </li>
          <li>
            <strong>Measured reporting</strong>
            <span>
              Real before/after file sizes plus live Core Web Vitals tests from Google
              PageSpeed Insights.
            </span>
          </li>
        </ul>
        <nav className={styles.footer}>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/support">Support</Link>
        </nav>
      </div>
    </div>
  );
}
