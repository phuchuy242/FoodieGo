import { X } from 'feather-icons-react/build/IconComponents'
import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../img/imagewithbasebath'

const EditBrand = () => {
    return (
        <div>
            {/* Edit Brand */}
            <div className="modal fade" id="edit-brand">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Brand</h4>
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
                                <div className="modal-body custom-modal-body new-employee-field">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Brand</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="Boat"
                                            />
                                        </div>
                                        <label className="form-label">Logo</label>
                                        <div className="profile-pic-upload mb-3">
                                            <div className="profile-pic brand-pic">
                                                <span>
                                                    <ImageWithBasePath src="assets/img/brand/brand-icon-02.png" alt="" />
                                                </span>
                                                <Link  to="#" className="remove-photo">
                                                    <X className="x-square-add"/>
                                                </Link>
                                            </div>
                                            <div className="image-upload mb-0">
                                                <input type="file" />
                                                <div className="image-uploads">
                                                    <h4>Change Image</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id="user4"
                                                    className="check"
                                                    defaultChecked="true"
                                                />
                                                <label htmlFor="user4" className="checktoggle" />
                                            </div>
                                        </div>
                                        <div className="modal-footer-btn">
                                            <button
                                                type="button"
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal"
                                            >
                                                Cancel
                                            </button>
                                            <Link  to="#" className="btn btn-submit">
                                                Save Changes
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Brand */}
        </div>
    )
}

export default EditBrand
