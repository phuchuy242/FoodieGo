import { DatePicker } from 'antd';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE } from '../../../environment';
import dayjs from 'dayjs';

const EditCoupons = () => {
    const discountTypes = [
        { value: 'percentage', label: 'Percentage (%)' },
        { value: 'fixed', label: 'Fixed Amount (đ)' }
    ];

    const [voucherId, setVoucherId] = useState(null);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState(discountTypes[0]);
    const [discountValue, setDiscountValue] = useState('');
    const [maxUsage, setMaxUsage] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleSelectVoucher = (e) => {
            const voucher = e.detail;
            if (voucher) {
                setVoucherId(voucher.id);
                setCode(voucher.code || '');
                setDescription(voucher.description || '');
                
                const type = discountTypes.find(t => t.value === voucher.discount_type) || discountTypes[0];
                setDiscountType(type);
                
                setDiscountValue(voucher.discount_value || '');
                setMaxUsage(voucher.max_usage || '');
                setMinOrderAmount(voucher.min_order_amount || '');
                setStartDate(voucher.start_date ? new Date(voucher.start_date) : new Date());
                setEndDate(voucher.end_date ? new Date(voucher.end_date) : new Date());
                setIsActive(voucher.is_active);
            }
        };

        window.addEventListener('selectVoucherForEdit', handleSelectVoucher);
        return () => window.removeEventListener('selectVoucherForEdit', handleSelectVoucher);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!voucherId) return;

        if (!code.trim() || !discountValue) {
            Swal.fire({ title: 'Cảnh báo', text: 'Vui lòng nhập Mã giảm giá và Giá trị giảm', icon: 'warning' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
            const headers = { 'ngrok-skip-browser-warning': 'true' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const payload = {
                code: code.trim(),
                description: description.trim(),
                discount_type: discountType.value,
                discount_value: parseFloat(discountValue),
                max_usage: maxUsage ? parseInt(maxUsage) : null,
                min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                is_active: isActive
            };

            await axios.put(`${API_BASE}/api/v1/admin/vouchers/${voucherId}/`, payload, { headers });

            Swal.fire({ title: 'Thành công', text: 'Cập nhật mã giảm giá thành công!', icon: 'success' });
            
            // Close modal
            const closeBtn = document.querySelector('#edit-units .close');
            if (closeBtn) closeBtn.click();
            
            // Trigger refresh
            window.dispatchEvent(new Event('refreshVouchers'));
            
        } catch (err) {
            console.error('Error updating voucher', err);
            const msg = err.response?.data?.code?.[0] || err.response?.data?.msg || 'Đã có lỗi xảy ra';
            Swal.fire({ title: 'Lỗi', text: msg, icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="modal fade" id="edit-units">
                <div className="modal-dialog modal-dialog-centered custom-modal-two">
                    <div className="modal-content">
                        <div className="page-wrapper-new p-0">
                            <div className="content">
                                <div className="modal-header border-0 custom-modal-header">
                                    <div className="page-title">
                                        <h4>Edit Coupon (Cập nhật mã giảm giá)</h4>
                                    </div>
                                    <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body custom-modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Mã Code <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: TET2024" />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Tên / Mô tả</label>
                                                    <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Giảm giá Tết" />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Loại giảm giá <span className="text-danger">*</span></label>
                                                    <Select
                                                        className="select"
                                                        options={discountTypes}
                                                        value={discountType}
                                                        onChange={setDiscountType}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Giá trị giảm <span className="text-danger">*</span></label>
                                                    <input type="number" className="form-control" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType.value === 'percentage' ? "VD: 10 (%)" : "VD: 50000 (VND)"} />
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Giới hạn số lần dùng</label>
                                                    <input type="number" className="form-control" value={maxUsage} onChange={(e) => setMaxUsage(e.target.value)} />
                                                    <span className="unlimited-text text-muted" style={{ fontSize: '12px' }}>Để trống nếu không giới hạn</span>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Đơn hàng tối thiểu</label>
                                                    <input type="number" className="form-control" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} placeholder="VD: 150000" />
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Ngày bắt đầu</label>
                                                    <div className="input-groupicon calender-input">
                                                        <DatePicker
                                                            onChange={(date) => setStartDate(date ? date.toDate() : new Date())}
                                                            className="form-control filterdatepicker"
                                                            format="DD-MM-YYYY HH:mm"
                                                            showTime
                                                            value={dayjs(startDate)}
                                                            allowClear={false}
                                                            getPopupContainer={(trigger) => trigger.parentNode}
                                                            popupStyle={{ zIndex: 9999 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Ngày kết thúc</label>
                                                    <div className="input-groupicon calender-input">
                                                        <DatePicker
                                                            onChange={(date) => setEndDate(date ? date.toDate() : new Date())}
                                                            className="form-control filterdatepicker"
                                                            format="DD-MM-YYYY HH:mm"
                                                            showTime
                                                            value={dayjs(endDate)}
                                                            allowClear={false}
                                                            getPopupContainer={(trigger) => trigger.parentNode}
                                                            popupStyle={{ zIndex: 9999 }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="input-blocks m-0 mt-3">
                                                <div className="status-toggle modal-status d-flex justify-content-between align-items-center">
                                                    <span className="status-label">Trạng thái (Kích hoạt)</span>
                                                    <input
                                                        type="checkbox"
                                                        id="edit_voucher_status"
                                                        className="check"
                                                        checked={isActive}
                                                        onChange={(e) => setIsActive(e.target.checked)}
                                                    />
                                                    <label htmlFor="edit_voucher_status" className="checktoggle" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer-btn mt-4">
                                            <button type="button" className="btn btn-cancel me-2" data-bs-dismiss="modal">Hủy</button>
                                            <button type="submit" className="btn btn-submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCoupons;
