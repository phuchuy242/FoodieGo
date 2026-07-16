import {
  ChevronUp,
  Edit,
  PlusCircle,
  RotateCcw,
  Sliders,
  Trash2,
} from "feather-icons-react/build/IconComponents";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import Brand from "../../core/modals/inventory/brand";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { all_routes } from "../../Router/all_routes";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Table from "../../core/pagination/datatable";
import { setToogleHeader } from "../../core/redux/action";
import { Download } from "react-feather";
import axios from "axios";
import { API_BASE } from "../../environment";

const ProductList = () => {
  const reduxDataSource = useSelector((state) => state.product_list) || [];
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const headers = { "ngrok-skip-browser-warning": "true" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${API_BASE}/api/v1/admin/menu/products/`, { headers });
      const list = res.data?.data?.results || res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        const formatted = list.map((p) => ({
          key: p.id,
          id: p.id,
          product: p.name || "",
          productImage: p.image_url || p.image || "assets/img/products/product1.jpg",
          sku: p.sku || `SP00${p.id}`,
          category: p.category_name || (typeof p.category === "object" && p.category ? p.category.name : `Category #${p.category_id || p.category || ""}`) || "Khác",
          price: typeof p.price === "number" ? `${p.price.toLocaleString("vi-VN")} đ` : (p.price ? `${Number(p.price).toLocaleString("vi-VN")} đ` : "0 đ"),
          unit: p.unit || "Phần",
          qty: p.stock_quantity !== undefined ? p.stock_quantity : (p.is_available ? "Còn hàng" : "Hết hàng"),
          variants_count: p.variants_count || (p.variants ? p.variants.filter(v => v.is_active).length : 0),
          variants: p.variants || [],
          createdby: p.created_by || "Admin",
          img: "assets/img/profiles/avatar-01.jpg",
          raw_record: p
        }));
        setDataSource(formatted);
      } else {
        setDataSource(reduxDataSource);
      }
    } catch (err) {
      console.error("Error fetching products, falling back to Redux:", err);
      setDataSource(reduxDataSource);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const route = all_routes;
  const [selectedSort, setSelectedSort] = useState({ value: "default", label: "Sắp xếp" });
  const sortOptions = [
    { value: "default", label: "Mặc định" },
    { value: "idAsc", label: "ID Tăng dần (#1 -> #9)" },
    { value: "idDesc", label: "ID Giảm dần (#9 -> #1)" },
    { value: "nameAsc", label: "Tên A -> Z" },
    { value: "nameDesc", label: "Tên Z -> A" },
  ];

  const MySwal = withReactContent(Swal);

  const showConfirmationAlert = (id) => {
    MySwal.fire({
      title: "Bạn có chắc chắn?",
      text: "Sản phẩm này sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Có, xóa ngay!",
      cancelButtonText: "Hủy bỏ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
          const headers = { "ngrok-skip-browser-warning": "true" };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          await axios.delete(`${API_BASE}/api/v1/admin/menu/products/${id}/`, { headers });
          MySwal.fire({
            title: "Đã xóa!",
            text: "Sản phẩm đã được xóa thành công.",
            icon: "success",
            customClass: { confirmButton: "btn btn-success" }
          });
          fetchProducts();
        } catch (err) {
          MySwal.fire({ title: "Lỗi", text: "Không thể xóa sản phẩm này!", icon: "error" });
        }
      }
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text) => <span className="badge bg-secondary font-weight-bold">#{text}</span>,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "Hình ảnh",
      dataIndex: "productImage",
      render: (text, record) => (
        <div
          style={{
            width: "48px",
            height: "48px",
            minWidth: "48px",
            minHeight: "48px",
            maxWidth: "48px",
            maxHeight: "48px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc"
          }}
        >
          <ImageWithBasePath
            alt="Img"
            src={record.productImage}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product",
      render: (text) => (
        <span className="font-weight-bold text-dark">{text}</span>
      ),
      sorter: (a, b) => (a.product || "").localeCompare(b.product || ""),
    },
    {
      title: "Mã SKU",
      dataIndex: "sku",
      sorter: (a, b) => (a.sku || "").localeCompare(b.sku || ""),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      sorter: (a, b) => (a.category || "").localeCompare(b.category || ""),
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      sorter: (a, b) => (a.unit || "").localeCompare(b.unit || ""),
    },
    {
      title: "SL / Trạng thái",
      dataIndex: "qty",
      render: (text) => <span className="badge bg-light text-dark font-weight-bold">{text}</span>,
      sorter: (a, b) => (String(a.qty) || "").localeCompare(String(b.qty) || ""),
    },
    {
      title: "Biến thể (Variants)",
      dataIndex: "variants_count",
      render: (count, record) => (
        <Link to={route.variantattributes || "/inventory/variant-attributes"} title={`Xem ${count} biến thể của món này`}>
          <span className={`badge ${count > 0 ? 'bg-success' : 'bg-secondary'} font-weight-bold`}>
            {count > 0 ? `${count} Size` : 'Chưa có'}
          </span>
        </Link>
      ),
      sorter: (a, b) => (a.variants_count || 0) - (b.variants_count || 0),
    },
    {
      title: "Người tạo",
      dataIndex: "createdby",
      render: (text, record) => (
        <span className="userimgname">
          <Link to="#" className="product-img">
            <ImageWithBasePath alt="" src={record.img} />
          </Link>
          <Link to="#">{text}</Link>
        </span>
      ),
      sorter: (a, b) => (a.createdby || "").localeCompare(b.createdby || ""),
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to={route.editproduct}
              onClick={() => {
                localStorage.setItem("selected_product_edit", JSON.stringify(record.raw_record || record));
              }}
            >
              <Edit className="feather-edit" />
            </Link>
            <Link
              className="confirm-text p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                showConfirmationAlert(record.id);
              }}
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  const renderTooltip = (props) => (
    <Tooltip id="pdf-tooltip" {...props}>
      Xuất PDF
    </Tooltip>
  );
  const renderExcelTooltip = (props) => (
    <Tooltip id="excel-tooltip" {...props}>
      Xuất Excel
    </Tooltip>
  );
  const renderPrinterTooltip = (props) => (
    <Tooltip id="printer-tooltip" {...props}>
      In
    </Tooltip>
  );
  const renderRefreshTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Làm mới
    </Tooltip>
  );
  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Thu gọn
    </Tooltip>
  );

  const filteredData = dataSource.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (item.product && item.product.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (!selectedSort || selectedSort.value === "default") return 0;
    if (selectedSort.value === "idAsc") return (a.id || 0) - (b.id || 0);
    if (selectedSort.value === "idDesc") return (b.id || 0) - (a.id || 0);
    if (selectedSort.value === "nameAsc") return (a.product || "").localeCompare(b.product || "");
    if (selectedSort.value === "nameDesc") return (b.product || "").localeCompare(a.product || "");
    return 0;
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Danh sách sản phẩm</h4>
              <h6>Quản lý sản phẩm ({filteredData.length} mục)</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <Link to="#">
                  <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                  <ImageWithBasePath
                    src="assets/img/icons/excel.svg"
                    alt="img"
                  />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top">
                  <i data-feather="printer" className="feather-printer" />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                <Link to="#" data-bs-toggle="tooltip" data-bs-placement="top" onClick={(e) => { e.preventDefault(); fetchProducts(); }}>
                  <RotateCcw />
                </Link>
              </OverlayTrigger>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  to="#"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
          <div className="page-btn">
            <Link to={route.addproduct} className="btn btn-added">
              <PlusCircle className="me-2 iconsize" />
              Thêm sản phẩm mới
            </Link>
          </div>

        </div>
        {/* /product list */}
        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="form-control form-control-sm formsearch"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Link to="#" className="btn btn-searchset" onClick={(e) => e.preventDefault()}>
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="form-sort">
                <Sliders className="info-img" />
                <Select
                  classNamePrefix="react-select"
                  options={sortOptions}
                  value={selectedSort}
                  onChange={(opt) => setSelectedSort(opt)}
                  placeholder="Sắp xếp"
                />
              </div>
            </div>
            <div className="table-responsive">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải danh sách sản phẩm từ API...</p>
                </div>
              ) : (
                <Table columns={columns} dataSource={filteredData} />
              )}
            </div>
          </div>
        </div>
        {/* /product list */}
        <Brand />
      </div>
    </div>
  );
};

export default ProductList;
