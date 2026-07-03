import React from 'react'
import { Link } from 'react-router-dom'
import Select from 'react-select'

const EditSubcategories = () => {
    const categories = [
        { value: 'Choose Category', label: 'Choose Category' },
        { value: 'Category', label: 'Category' },
    ];

    return (
        <div>
            {/* Edit Category */}
            <div className="modal fade" id="edit-category">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Sub Category</h4>
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
                                        <div className="mb-3">
                                            <label className="form-label">Parent Category</label>
                                            <Select
                                            className="select"
                                            options={categories}
                                            placeholder="Newest"
                                        />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Category Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="Computers"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Category Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                defaultValue="CT001"
                                            />
                                        </div>
                                        <div className="mb-3 input-blocks">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                defaultValue={"Type Description"}
                                            />
                                        </div>
                                        <div className="mb-0">
                                            <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                <span className="status-label">Status</span>
                                                <input
                                                    type="checkbox"
                                                    id="user3"
                                                    className="check"
                                                    defaultChecked="true"
                                                />
                                                <label htmlFor="user3" className="checktoggle" />
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
                                            <Link to="#" className="btn btn-submit">
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
            {/* /Edit Category */}
        </div>
    )
}

export default EditSubcategories