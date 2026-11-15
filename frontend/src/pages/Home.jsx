import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">THE RICHU COLLECTION</div>
        <h1>Style that speaks. Confidence that lasts.</h1>
        <p>Discover modern menswear essentials, thoughtfully selected for every occasion.</p>
        <Link className="button" to="/login">Explore RICHU</Link>
      </section>
      <section className="container">
        <div className="eyebrow">OUR IDENTITY</div>
        <h2>Modern essentials for men.</h2>
        <p className="muted">Your RICHU storefront starter is ready. Connect product APIs to populate the catalogue.</p>
      </section>
    </>
  );
}
