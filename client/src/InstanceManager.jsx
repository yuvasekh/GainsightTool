"use client"

import { useState } from "react"
import {
  Tabs,
  Card,
  Select,
  Button,
  Table,
  Input,
  Upload,
  message,
  Divider,
  Space,
  Tooltip,
  Modal,
  Checkbox,
} from "antd"
import {
  PlusOutlined,
  SwapOutlined,
  DeleteOutlined,
  UploadOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  LockOutlined,
} from "@ant-design/icons"

const { TabPane } = Tabs
const { Option } = Select
const { confirm } = Modal

// Mock data for sources
const sources = [
  { id: 1, name: "Customer Database" },
  { id: 2, name: "Product Catalog" },
  { id: 3, name: "Order Management" },
  { id: 4, name: "User Profiles" },
]

// Mock data for fields
const sourceFields = [
  { id: 1, name: "customer_id", type: "number", source: "Customer Database" },
  { id: 2, name: "customer_name", type: "string", source: "Customer Database" },
  { id: 3, name: "email", type: "string", source: "Customer Database" },
  { id: 4, name: "product_id", type: "number", source: "Product Catalog" },
  { id: 5, name: "product_name", type: "string", source: "Product Catalog" },
  { id: 6, name: "price", type: "number", source: "Product Catalog" },
  { id: 7, name: "order_id", type: "number", source: "Order Management" },
  { id: 8, name: "order_date", type: "date", source: "Order Management" },
  { id: 9, name: "user_id", type: "number", source: "User Profiles" },
  { id: 10, name: "username", type: "string", source: "User Profiles" },
]

const FieldsMigration = () => {
  // State for authentication
  const [sourceUrl, setSourceUrl] = useState("")
  const [sourceToken, setSourceToken] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [targetToken, setTargetToken] = useState("")

  // State for Fields Adding
  const [sourceSelection, setSourceSelection] = useState(null)
  const [targetSelection, setTargetSelection] = useState(null)
  const [fieldMappings, setFieldMappings] = useState([{ id: 1, sourceField: "", targetField: "" }])
  const [sameSourceSelection, setSameSourceSelection] = useState(null)
  const [csvFields, setCsvFields] = useState([])
  const [csvMappings, setCsvMappings] = useState([{ id: 1, sourceField: "", targetField: "" }])

  // State for Rename Fields
  const [renameSourceSelection, setRenameSourceSelection] = useState(null)
  const [renameFields, setRenameFields] = useState([{ id: 1, currentName: "", newName: "", source: "" }])
  const [csvRenameFields, setCsvRenameFields] = useState([{ id: 1, currentName: "", newName: "", source: "" }])

  // State for Delete Fields
  const [deleteFields, setDeleteFields] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Handle CSV upload
  const handleCsvUpload = (info) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`)
      // Mock CSV field extraction
      const mockCsvFields = ["csv_id", "csv_name", "csv_email", "csv_date", "csv_amount"]
      setCsvFields(mockCsvFields)

      // Initialize mappings
      const initialMappings = mockCsvFields.map((field, index) => ({
        id: index + 1,
        sourceField: field,
        targetField: "",
      }))
      setCsvMappings(initialMappings)
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  // Add new field mapping
  const addFieldMapping = () => {
    const newId = fieldMappings.length > 0 ? Math.max(...fieldMappings.map((m) => m.id)) + 1 : 1
    setFieldMappings([...fieldMappings, { id: newId, sourceField: "", targetField: "" }])
  }

  // Remove field mapping
  const removeFieldMapping = (id) => {
    setFieldMappings(fieldMappings.filter((mapping) => mapping.id !== id))
  }

  // Add new field in same source
  const addSameSourceField = () => {
    const newId = fieldMappings.length > 0 ? Math.max(...fieldMappings.map((m) => m.id)) + 1 : 1
    setFieldMappings([...fieldMappings, { id: newId, sourceField: "", targetField: "" }])
  }

  // Add new rename field
  const addRenameField = () => {
    const newId = renameFields.length > 0 ? Math.max(...renameFields.map((f) => f.id)) + 1 : 1
    setRenameFields([...renameFields, { id: newId, currentName: "", newName: "", source: renameSourceSelection || "" }])
  }

  // Add new CSV rename field
  const addCsvRenameField = () => {
    const newId = csvRenameFields.length > 0 ? Math.max(...csvRenameFields.map((f) => f.id)) + 1 : 1
    setCsvRenameFields([...csvRenameFields, { id: newId, currentName: "", newName: "", source: "" }])
  }

  // Handle source change for delete fields
  const handleDeleteSourceChange = (value) => {
    const filteredFields = sourceFields
      .filter((field) => field.source === value)
      .map((field) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        source: field.source,
        selected: false,
      }))

    setDeleteFields(filteredFields)
    setSelectAll(false)
  }

  // Toggle select all for delete
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setDeleteFields(
      deleteFields.map((field) => ({
        ...field,
        selected: newSelectAll,
      })),
    )
  }

  // Toggle individual field selection
  const toggleFieldSelection = (id) => {
    setDeleteFields(deleteFields.map((field) => (field.id === id ? { ...field, selected: !field.selected } : field)))

    // Check if all are selected after this toggle
    const updatedFields = deleteFields.map((field) =>
      field.id === id ? { ...field, selected: !field.selected } : field,
    )
    const allSelected = updatedFields.every((field) => field.selected)
    setSelectAll(allSelected)
  }

  // Confirm deletion
  const confirmDelete = () => {
    const selectedCount = deleteFields.filter((field) => field.selected).length

    if (selectedCount === 0) {
      message.warning("Please select at least one field to delete")
      return
    }

    confirm({
      title: `Are you sure you want to delete ${selectedCount} field(s)?`,
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        // Handle deletion logic here
        message.success(`${selectedCount} field(s) deleted successfully`)
        // Reset selection
        setDeleteFields(deleteFields.filter((field) => !field.selected))
        setSelectAll(false)
      },
    })
  }

  // Delete fields table columns
  const deleteColumns = [
    {
      title: <Checkbox checked={selectAll} onChange={toggleSelectAll} />,
      dataIndex: "selected",
      key: "selected",
      width: 50,
      render: (_, record) => <Checkbox checked={record.selected} onChange={() => toggleFieldSelection(record.id)} />,
    },
    {
      title: "Field Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
  ]

  // Authentication form for source and target
  const renderAuthenticationFields = (type) => {
    if (type === "source") {
      return (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-4">Source Authentication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
              <Input
                prefix={<LinkOutlined className="text-gray-400" />}
                placeholder="https://source-instance.example.com"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Access Token</label>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter source access token"
                value={sourceToken}
                onChange={(e) => setSourceToken(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
        </div>
      )
    } else if (type === "target") {
      return (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-4">Target Authentication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <Input
                prefix={<LinkOutlined className="text-gray-400" />}
                placeholder="https://target-instance.example.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Access Token</label>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter target access token"
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
        </div>
      )
    } else if (type === "both") {
      return (
        <>
          {renderAuthenticationFields("source")}
          {renderAuthenticationFields("target")}
        </>
      )
    }
  }

  return (
    <div className="min-h-screen w-[79vw] flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-5xl shadow-lg rounded-xl border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Fields Migration</h1>
          <p className="text-gray-500 text-sm">
            Manage your field migrations: add, rename, or delete fields across different sources
          </p>
        </div>

        <Tabs defaultActiveKey="1" type="card" className="mb-4">
          <TabPane tab="Fields Adding" key="1">
            <Tabs defaultActiveKey="different" type="line">
              <TabPane tab="Different Sources" key="different">
                <div className="space-y-6">
                  {renderAuthenticationFields("both")}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                      <Select
                        placeholder="Select source"
                        className="w-full"
                        onChange={(value) => setSourceSelection(value)}
                      >
                        {sources.map((source) => (
                          <Option key={source.id} value={source.name}>
                            {source.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                      <Select
                        placeholder="Select target"
                        className="w-full"
                        onChange={(value) => setTargetSelection(value)}
                      >
                        {sources.map((source) => (
                          <Option key={source.id} value={source.name}>
                            {source.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <Divider orientation="left">Field Mappings</Divider>

                  {fieldMappings.map((mapping, index) => (
                    <div key={mapping.id} className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <Select
                          placeholder="Select source field"
                          className="w-full"
                          value={mapping.sourceField || undefined}
                          onChange={(value) => {
                            const updatedMappings = [...fieldMappings]
                            updatedMappings[index].sourceField = value
                            setFieldMappings(updatedMappings)
                          }}
                          disabled={!sourceSelection}
                        >
                          {sourceFields
                            .filter((field) => field.source === sourceSelection)
                            .map((field) => (
                              <Option key={field.id} value={field.name}>
                                {field.name} ({field.type})
                              </Option>
                            ))}
                        </Select>
                      </div>

                      <ArrowRightOutlined className="text-gray-400" />

                      <div className="flex-1">
                        <Select
                          placeholder="Select target field"
                          className="w-full"
                          value={mapping.targetField || undefined}
                          onChange={(value) => {
                            const updatedMappings = [...fieldMappings]
                            updatedMappings[index].targetField = value
                            setFieldMappings(updatedMappings)
                          }}
                          disabled={!targetSelection}
                        >
                          {sourceFields
                            .filter((field) => field.source === targetSelection)
                            .map((field) => (
                              <Option key={field.id} value={field.name}>
                                {field.name} ({field.type})
                              </Option>
                            ))}
                        </Select>
                      </div>

                      {fieldMappings.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFieldMapping(mapping.id)}
                          className="text-red-500"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addFieldMapping}
                      disabled={!sourceSelection || !targetSelection}
                    >
                      Add Field Mapping
                    </Button>

                    <Button
                      type="primary"
                      disabled={
                        !sourceUrl ||
                        !sourceToken ||
                        !targetUrl ||
                        !targetToken ||
                        !fieldMappings.every((m) => m.sourceField && m.targetField)
                      }
                    >
                      Apply Mappings
                    </Button>
                  </div>
                </div>
              </TabPane>

              <TabPane tab="Same Source" key="same">
                <div className="space-y-6">
                  {renderAuthenticationFields("source")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <Select
                      placeholder="Select source"
                      className="w-full"
                      onChange={(value) => setSameSourceSelection(value)}
                    >
                      {sources.map((source) => (
                        <Option key={source.id} value={source.name}>
                          {source.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Divider orientation="left">New Fields</Divider>

                  {fieldMappings.map((mapping, index) => (
                    <div key={mapping.id} className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <Input
                          placeholder="New field name"
                          value={mapping.sourceField}
                          onChange={(e) => {
                            const updatedMappings = [...fieldMappings]
                            updatedMappings[index].sourceField = e.target.value
                            setFieldMappings(updatedMappings)
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <Select
                          placeholder="Field type"
                          className="w-full"
                          value={mapping.targetField || undefined}
                          onChange={(value) => {
                            const updatedMappings = [...fieldMappings]
                            updatedMappings[index].targetField = value
                            setFieldMappings(updatedMappings)
                          }}
                        >
                          <Option value="string">String</Option>
                          <Option value="number">Number</Option>
                          <Option value="boolean">Boolean</Option>
                          <Option value="date">Date</Option>
                          <Option value="object">Object</Option>
                          <Option value="array">Array</Option>
                        </Select>
                      </div>

                      {fieldMappings.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFieldMapping(mapping.id)}
                          className="text-red-500"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addSameSourceField}
                      disabled={!sameSourceSelection}
                    >
                      Add New Field
                    </Button>

                    <Button
                      type="primary"
                      disabled={
                        !sourceUrl ||
                        !sourceToken ||
                        !sameSourceSelection ||
                        !fieldMappings.every((m) => m.sourceField && m.targetField)
                      }
                    >
                      Add Fields
                    </Button>
                  </div>
                </div>
              </TabPane>

              <TabPane tab="CSV Fields" key="csv">
                <div className="space-y-6">
                  {renderAuthenticationFields("target")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                    <Upload
                      name="file"
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                      onChange={handleCsvUpload}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </div>

                  {csvFields.length > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Source</label>
                        <Select
                          placeholder="Select target source"
                          className="w-full"
                          onChange={(value) => setTargetSelection(value)}
                        >
                          {sources.map((source) => (
                            <Option key={source.id} value={source.name}>
                              {source.name}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <Divider orientation="left">CSV Field Mappings</Divider>

                      {csvMappings.map((mapping, index) => (
                        <div key={mapping.id} className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <Input value={mapping.sourceField} disabled />
                          </div>

                          <ArrowRightOutlined className="text-gray-400" />

                          <div className="flex-1">
                            <Select
                              placeholder="Select target field or create new"
                              className="w-full"
                              value={mapping.targetField || undefined}
                              onChange={(value) => {
                                const updatedMappings = [...csvMappings]
                                updatedMappings[index].targetField = value
                                setCsvMappings(updatedMappings)
                              }}
                              disabled={!targetSelection}
                              showSearch
                              allowClear
                            >
                              <Option value={`new_${mapping.sourceField}`}>Create as new field</Option>
                              {sourceFields
                                .filter((field) => field.source === targetSelection)
                                .map((field) => (
                                  <Option key={field.id} value={field.name}>
                                    {field.name} ({field.type})
                                  </Option>
                                ))}
                            </Select>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          disabled={
                            !targetUrl || !targetToken || !targetSelection || !csvMappings.every((m) => m.targetField)
                          }
                        >
                          Import Fields
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane tab="Rename Fields" key="2">
            <Tabs defaultActiveKey="same" type="line">
              <TabPane tab="Same Source" key="same">
                <div className="space-y-6">
                  {renderAuthenticationFields("source")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <Select
                      placeholder="Select source"
                      className="w-full"
                      onChange={(value) => {
                        setRenameSourceSelection(value)
                        setRenameFields([{ id: 1, currentName: "", newName: "", source: value }])
                      }}
                    >
                      {sources.map((source) => (
                        <Option key={source.id} value={source.name}>
                          {source.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Divider orientation="left">Rename Fields</Divider>

                  {renameFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <Select
                          placeholder="Select field to rename"
                          className="w-full"
                          value={field.currentName || undefined}
                          onChange={(value) => {
                            const updatedFields = [...renameFields]
                            updatedFields[index].currentName = value
                            setRenameFields(updatedFields)
                          }}
                          disabled={!renameSourceSelection}
                        >
                          {sourceFields
                            .filter((f) => f.source === renameSourceSelection)
                            .map((f) => (
                              <Option key={f.id} value={f.name}>
                                {f.name} ({f.type})
                              </Option>
                            ))}
                        </Select>
                      </div>

                      <SwapOutlined className="text-gray-400" />

                      <div className="flex-1">
                        <Input
                          placeholder="New field name"
                          value={field.newName}
                          onChange={(e) => {
                            const updatedFields = [...renameFields]
                            updatedFields[index].newName = e.target.value
                            setRenameFields(updatedFields)
                          }}
                        />
                      </div>

                      {renameFields.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setRenameFields(renameFields.filter((f) => f.id !== field.id))
                          }}
                          className="text-red-500"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addRenameField}
                      disabled={!renameSourceSelection}
                    >
                      Add Field to Rename
                    </Button>

                    <Button
                      type="primary"
                      disabled={!sourceUrl || !sourceToken || !renameFields.every((f) => f.currentName && f.newName)}
                    >
                      Apply Renames
                    </Button>
                  </div>
                </div>
              </TabPane>

              <TabPane tab="CSV Fields" key="csv">
                <div className="space-y-6">
                  {renderAuthenticationFields("source")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File with Rename Mappings
                    </label>
                    <Upload
                      name="file"
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                      onChange={handleCsvUpload}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                    <div className="mt-2 text-xs text-gray-500">
                      <InfoCircleOutlined className="mr-1" />
                      CSV should have columns: source, current_field_name, new_field_name
                    </div>
                  </div>

                  <Divider orientation="left">Manual Rename Entries</Divider>

                  {csvRenameFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-3 gap-4 mb-4">
                      <Select
                        placeholder="Select source"
                        value={field.source || undefined}
                        onChange={(value) => {
                          const updatedFields = [...csvRenameFields]
                          updatedFields[index].source = value
                          setCsvRenameFields(updatedFields)
                        }}
                      >
                        {sources.map((source) => (
                          <Option key={source.id} value={source.name}>
                            {source.name}
                          </Option>
                        ))}
                      </Select>

                      <Input
                        placeholder="Current field name"
                        value={field.currentName}
                        onChange={(e) => {
                          const updatedFields = [...csvRenameFields]
                          updatedFields[index].currentName = e.target.value
                          setCsvRenameFields(updatedFields)
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="New field name"
                          value={field.newName}
                          onChange={(e) => {
                            const updatedFields = [...csvRenameFields]
                            updatedFields[index].newName = e.target.value
                            setCsvRenameFields(updatedFields)
                          }}
                        />

                        {csvRenameFields.length > 1 && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setCsvRenameFields(csvRenameFields.filter((f) => f.id !== field.id))
                            }}
                            className="text-red-500"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button type="dashed" icon={<PlusOutlined />} onClick={addCsvRenameField}>
                      Add Manual Entry
                    </Button>

                    <Button
                      type="primary"
                      disabled={
                        !sourceUrl ||
                        !sourceToken ||
                        !csvRenameFields.every((f) => f.source && f.currentName && f.newName)
                      }
                    >
                      Apply Renames
                    </Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane tab="Deletion Fields" key="3">
            <div className="space-y-6">
              {renderAuthenticationFields("source")}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <Select placeholder="Select source" className="w-full" onChange={handleDeleteSourceChange}>
                  {sources.map((source) => (
                    <Option key={source.id} value={source.name}>
                      {source.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {deleteFields.length > 0 && (
                <>
                  <Divider orientation="left">
                    <Space>
                      Fields to Delete
                      <Tooltip title="Select fields to delete. This operation cannot be undone.">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  </Divider>

                  <Table
                    rowKey="id"
                    columns={deleteColumns}
                    dataSource={deleteFields}
                    pagination={false}
                    size="middle"
                    className="border rounded-lg"
                  />

                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={confirmDelete}
                      disabled={
                        !sourceUrl || !sourceToken || deleteFields.length === 0 || !deleteFields.some((f) => f.selected)
                      }
                    >
                      Delete Selected Fields
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default FieldsMigration
