import React from "react";
import { Link } from "react-router-dom";

export default function ImgCardDetails({ slug, title, bage, imageUrl }) {
  const href = slug ? `/category/${slug}` : "/";

  return (
    <Link to={href} className="img-card-link">
      <div className="img-card-content card-base">
        <img src={imageUrl} alt={title} className="img-card card-image" />
        <div className="img-card-info card-content">
          <span className="img-card-title">{title}</span>
          <span className="badge">{bage}</span>
        </div>
      </div>
    </Link>
  );
}
