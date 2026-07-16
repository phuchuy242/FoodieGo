import React from 'react'
import { Link } from 'react-router-dom'

const EditRole = () => {
    return (
        <div>
            {/* Edit Role */}
            <div className="modal fade" id="edit-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Chỉnh sửa vai trò</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <form>
                                        <div className="mb-0">
                                            <label className="form-label">Tên vai trò</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="Nhân viên bán hàng"
                                            />
                                        </div>
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                            >
                                                Hủy
                                            </button>
                                            <Link to="#" className="btn btn-submit">
                                                Lưu thay đổi
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Edit Role */}
        </div>
    )
}

export default EditRole
