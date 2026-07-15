import React from "react";
import PropTypes from "prop-types";
import { base_path, API_BASE } from "../../environment";

const ImageWithBasePath = (props) => {
  const prefix = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : base_path;
  let fullSrc = props.src || "";

  if (fullSrc.startsWith("http://") || fullSrc.startsWith("https://") || fullSrc.startsWith("data:")) {
    // Keep external or data URL exactly as is
  } else if (fullSrc.startsWith("/media/")) {
    fullSrc = `${API_BASE}${fullSrc}`;
  } else if (fullSrc.startsWith("/")) {
    fullSrc = `${process.env.PUBLIC_URL || ""}${fullSrc}`;
  } else {
    fullSrc = `${prefix}${fullSrc}`;
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
        e.target.src = `${prefix}assets/img/products/product1.jpg`;
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
