import React from "react";
import PropTypes from "prop-types";
import { base_path } from "../../environment";

const ImageWithBasePath = (props) => {
  // Ưu tiên dùng PUBLIC_URL để chắc chắn ảnh load được khi build
  const prefix = process.env.PUBLIC_URL ? process.env.PUBLIC_URL + "/" : base_path;
  const fullSrc = props.src.startsWith("/")
    ? `${process.env.PUBLIC_URL}${props.src}`
    : `${prefix}${props.src}`;

  return (
    <img
      className={props.className}
      src={fullSrc}
      height={props.height}
      alt={props.alt}
      width={props.width}
      id={props.id}
    />
  );
};

ImageWithBasePath.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  id: PropTypes.string,
};

export default ImageWithBasePath;
