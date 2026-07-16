import React from "react";
import PropTypes from "prop-types";
import { base_path, API_BASE } from "../../environment";

const ImageWithBasePath = (props) => {
  // Get base prefix from environment
  let prefix = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) 
    ? import.meta.env.BASE_URL 
    : (process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : base_path);
  
  // Fix for GitHub pages when accessed without trailing slash (e.g. /FoodieGo instead of /FoodieGo/)
  // which causes "./assets" to resolve to the root domain.
  if ((prefix === "./" || prefix === "/") && window.location.pathname.toLowerCase().startsWith("/foodiego")) {
    prefix = "/FoodieGo/";
  }

  let fullSrc = props.src || "";

  if (fullSrc.startsWith("http://") || fullSrc.startsWith("https://") || fullSrc.startsWith("data:")) {
    // Keep external or data URL exactly as is
  } else if (fullSrc.startsWith("/media/")) {
    fullSrc = `${API_BASE}${fullSrc}`;
  } else {
    // Strip leading slash if present to safely append to prefix
    if (fullSrc.startsWith("/")) {
      fullSrc = fullSrc.substring(1);
    }
    // Ensure prefix ends with slash
    const safePrefix = prefix.endsWith('/') ? prefix : prefix + '/';
    fullSrc = `${safePrefix}${fullSrc}`;
  }

  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={typeof props.alt === "boolean" ? props.alt.toString() : (props.alt || "")}
      width={props.width}
      id={props.id}
      onError={(e) => {
        e.target.onerror = null;
        const safePrefix = prefix.endsWith('/') ? prefix : prefix + '/';
        e.target.src = `${safePrefix}assets/img/products/product1.jpg`;
      }}
    />
  );
};

ImageWithBasePath.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string.isRequired,
  alt: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  height: PropTypes.number,
  width: PropTypes.number,
  id: PropTypes.string,
};

export default ImageWithBasePath;
