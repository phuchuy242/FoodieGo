import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { all_routes } from "../../Router/all_routes";
import { ArrowLeft, ChevronUp, Info } from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import axios from "axios";
import { API_BASE } from "../../environment";
import Swal from "sweetalert2";

const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const data = useSelector((state) => state.toggle_header);

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState({ value: "Phần", label: "Phần (Mặc định)" });
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
        const headers = { "ngrok-skip-browser-warning": "true" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await axios.get(`${API_BASE}/api/v1/admin/menu/categories/`, { headers });
        const list = res.data?.data?.results || res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const opts = list.map((c) => ({ value: c.id, label: c.name }));
          setCategoriesList(opts);
          if (opts.length > 0) setSelectedCategory(opts[0]);
        }
      } catch (err) {
        console.error("Failed to fetch categories in AddProduct:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      Swal.fire({ title: "Thiếu thông tin", text: "Vui lòng nhập Tên sản phẩm!", icon: "warning" });
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = { "ngrok-skip-browser-warning": "true" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        name: productName.trim(),
        sku: sku.trim() || `SP_${Date.now()}`,
        category_id: selectedCategory ? selectedCategory.value : null,
        price: Number(price) || 0,
        unit: selectedUnit ? selectedUnit.value : "Phần",
        description: description.trim(),
        stock_quantity: Number(quantity) || 100,
        image_url: imageUrl.trim() || "assets/img/products/product1.jpg",
        is_active: true
      };

      await axios.post(`${API_BASE}/api/v1/admin/menu/products/`, payload, { headers });
      Swal.fire({ title: "Thành công", text: "Đã tạo sản phẩm mới thành công!", icon: "success" });
      navigate(route.productlist);
    } catch (err) {
      console.error("Error creating product:", err);
      Swal.fire({ title: "Lỗi", text: err?.response?.data?.message || "Không thể tạo sản phẩm!", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Create Product</h4>
              <h6>Tạo mới món ăn / sản phẩm (Đã tối ưu thời gian nhập)</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <ArrowLeft className="me-2" />
                  Back to Product
                </Link>
              </div>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Collapse"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={() => {
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header bg-light d-flex align-items-center">
              <Info className="add-info me-2 text-primary" style={{ width: "20px", height: "20px" }} />
              <h5 className="card-title mb-0 font-weight-bold">Thông tin bắt buộc & cần thiết</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6 col-sm-12 mb-3">
                  <label className="form-label font-weight-bold">
                    Tên sản phẩm / Món ăn <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên món ăn..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-lg-6 col-sm-12 mb-3">
                  <label className="form-label font-weight-bold">
                    Danh mục món ăn <span className="text-danger">*</span>
                  </label>
                  <Select
                    classNamePrefix="react-select"
                    options={categoriesList}
                    value={selectedCategory}
                    onChange={(option) => setSelectedCategory(option)}
                    placeholder="Chọn danh mục..."
                  />
                </div>

                <div className="col-lg-4 col-sm-6 mb-3">
                  <label className="form-label font-weight-bold">Mã SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Để trống sẽ tự động tạo"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>

                <div className="col-lg-4 col-sm-6 mb-3">
                  <label className="form-label font-weight-bold">Đơn vị tính</label>
                  <Select
                    classNamePrefix="react-select"
                    options={[
                      { value: "Phần", label: "Phần" },
                      { value: "Ly", label: "Ly" },
                      { value: "Đĩa", label: "Đĩa" },
                      { value: "Cái", label: "Cái" },
                      { value: "Hộp", label: "Hộp" },
                    ]}
                    value={selectedUnit}
                    onChange={(option) => setSelectedUnit(option)}
                  />
                </div>

                <div className="col-lg-4 col-sm-6 mb-3">
                  <label className="form-label font-weight-bold">Số lượng tồn kho ban đầu</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="col-lg-6 col-sm-12 mb-3">
                  <label className="form-label font-weight-bold">Giá bán cơ bản (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0 (Nếu giá nằm ở biến thể thì để 0 hoặc để trống)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="col-lg-6 col-sm-12 mb-3">
                  <label className="form-label font-weight-bold">Link hình ảnh (Image URL)</label>
                  <div className="d-flex align-items-center">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="https://... hoặc /media/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    {imageUrl && (
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          minWidth: "42px",
                          overflow: "hidden",
                          borderRadius: "6px",
                          border: "1px solid #ddd"
                        }}
                      >
                        <ImageWithBasePath
                          src={imageUrl}
                          alt="prev"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-12 mb-3">
                  <label className="form-label font-weight-bold">Mô tả sản phẩm</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Mô tả ngắn gọn về món ăn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="btn-addproduct mb-4 d-flex justify-content-end">
            <Link to={route.productlist} className="btn btn-cancel me-2">
              Hủy
            </Link>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
