import { PlusCircle } from 'feather-icons-react/build/IconComponents'
import React from 'react'
import { Link } from 'react-router-dom'

const AddBrand = () => {
    return (
        <>
            {/* Add Brand */}
            <div className="modal fade" id="add-brand">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Create Brand</h4>
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
                                            <input type="text" className="form-control" />
                                        </div>
                                        <label className="form-label">Logo</label>
                                        <div className="profile-pic-upload mb-3">
                                            <div className="profile-pic brand-pic">
                                                <span>
                                                    <PlusCircle className="plus-down-add"/>
                                                    Add Image
                                                </span>
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
                                                    id="user2"
                                                    className="check"
                                                    defaultChecked="true"
                                                />
                                                <label htmlFor="user2" className="checktoggle" />
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
                                                Create Brand
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* /Add Brand */}
        </>

    )
}

export default AddBrand
