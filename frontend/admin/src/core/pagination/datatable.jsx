/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React,{useState} from "react";
import { Table } from "antd";
import { onShowSizeChange } from "./pagination";

const Datatable = ({ props, columns, dataSource }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  return (
    <Table
      key={props}
      className="table datanew dataTable no-footer"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={dataSource}

      rowKey={(record) => record.id}
    />
  );
};

export default Datatable;
