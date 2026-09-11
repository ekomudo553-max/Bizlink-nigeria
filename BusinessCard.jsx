import Link from "next/link";

export default function BusinessCard({ business }) {
  return (
    <article className="card">
      {business.image_url ? (
        <img className="business-img" src={business.image_url} alt={business.name} />
      ) : null}
      <div className="row">
        <h3>{business.name}</h3>
        {business.is_featured ? <span className="pill">Featured</span> : null}
      </div>
      <p className="muted">{business.category?.name || "Local business"}</p>
      <p>{business.description || "Discover this local business on BizLink."}</p>
      <Link className="btn secondary" href={`/businesses/${business.id}`}>View business</Link>
    </article>
  );
}
