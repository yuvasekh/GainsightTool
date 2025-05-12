"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Table, Input, Select, Button, Spin, Tag, DatePicker, message, Modal, Typography } from "antd"
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import { fetchFieldNames } from "./api/api"

const { Option } = Select
const { Text, Title } = Typography

const FieldsListing = () => {
  const { objectName } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [fields, setFields] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [fieldTypeFilter, setFieldTypeFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [selectedFieldTypes, setSelectedFieldTypes] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [dependencyCheckResults, setDependencyCheckResults] = useState([])
  const [isDependencyCheckModalVisible, setIsDependencyCheckModalVisible] = useState(false)
  const [isDependencyCheckLoading, setIsDependencyCheckLoading] = useState(false)

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true)
      try {
        const response = await fetchFieldNames(objectName)
        const apiData = response.data
        console.log(apiData, "yuvaapiData")
        const mappedFields = apiData[0]?.fields.map((field) => ({
          key: field.fieldName,
          name: field.label || field.fieldName,
          description: "--",
          type: field.dataType || "--",
          fieldType: field.meta?.fieldGroupType || "--",
          mapping: "--",
          lookup: field.meta?.hasLookup ? "Has Lookup" : "--",
        }))
        console.log(mappedFields, "mappedFields")
        setFields(mappedFields)
      } catch (error) {
        console.error("Failed to fetch fields", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFields()
  }, [objectName])

  // Function to check dependencies for a single field
  const checkFieldDependencies = async (fieldName) => {
    // Replace this with your actual API call to check dependencies
    // For example:
    // const response = await axios.get(`/api/objects/${objectName}/fields/${fieldName}/dependencies`);
    // return response.data;

    // For now, we'll simulate an API response with mock data
    // In a real implementation, this would be replaced with an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate some fields having dependencies and others not
        const hasDependencies = Math.random() > 0.7
        if (hasDependencies) {
          resolve({
            fieldName,
            canDelete: false,
            dependencies: [
              { type: "Form", name: `${objectName} Edit Form` },
              { type: "View", name: `${objectName} Detail View` },
            ],
          })
        } else {
          resolve({
            fieldName,
            canDelete: true,
            dependencies: [],
          })
        }
      }, 300) // Simulate network delay
    })
  }

  // Function to check dependencies for a single field and then delete if possible
  const checkAndDeleteField = async (fieldName) => {
    setIsDependencyCheckLoading(true)
    try {
      const result = await checkFieldDependencies(fieldName)

      if (result.canDelete) {
        // If no dependencies, proceed with deletion
        await deleteField(fieldName)
        message.success(`Field "${fieldName}" deleted successfully`)
      } else {
        // If dependencies exist, show them to the user
        setDependencyCheckResults([result])
        setIsDependencyCheckModalVisible(true)
      }
    } catch (error) {
      console.error("Failed to check dependencies", error)
      message.error("Failed to check dependencies")
    } finally {
      setIsDependencyCheckLoading(false)
    }
  }

  // Function to check dependencies for multiple fields
  const checkMultipleFieldDependencies = async (fieldNames) => {
    setIsDependencyCheckLoading(true)
    try {
      // Check dependencies for all selected fields
      const results = await Promise.all(fieldNames.map((fieldName) => checkFieldDependencies(fieldName)))

      // Filter fields that can be deleted
      const fieldsToDelete = results.filter((result) => result.canDelete).map((result) => result.fieldName)

      // Filter fields that cannot be deleted due to dependencies
      const fieldsWithDependencies = results.filter((result) => !result.canDelete)

      if (fieldsWithDependencies.length > 0) {
        // If any fields have dependencies, show them to the user
        setDependencyCheckResults(results)
        setIsDependencyCheckModalVisible(true)
      }

      if (fieldsToDelete.length > 0) {
        // Delete fields that have no dependencies
        await deleteMultipleFields(fieldsToDelete)

        if (fieldsWithDependencies.length === 0) {
          message.success(`${fieldsToDelete.length} fields deleted successfully`)
        } else {
          message.success(
            `${fieldsToDelete.length} fields deleted successfully. ${fieldsWithDependencies.length} fields could not be deleted due to dependencies.`,
          )
        }
      } else if (fieldsWithDependencies.length > 0) {
        message.warning("No fields could be deleted due to dependencies")
      }

      return { fieldsToDelete, fieldsWithDependencies }
    } catch (error) {
      console.error("Failed to check dependencies", error)
      message.error("Failed to check dependencies")
      return { fieldsToDelete: [], fieldsWithDependencies: [] }
    } finally {
      setIsDependencyCheckLoading(false)
    }
  }

  const deleteField = async (fieldName) => {
    try {
      // Replace this with your actual API call to delete the field
      // await axios.delete(`/api/objects/${objectName}/fields/${fieldName}`);

      // For now, we'll just filter out the deleted field from the state
      setFields(fields.filter((field) => field.key !== fieldName))
      return true
    } catch (error) {
      console.error("Failed to delete field", error)
      message.error("Failed to delete field")
      return false
    }
  }

  const deleteMultipleFields = async (fieldNames) => {
    try {
      // Replace this with your actual API call to delete multiple fields
      // For example:
      // await Promise.all(fieldNames.map(key =>
      //   axios.delete(`/api/objects/${objectName}/fields/${key}`)
      // ));

      // For now, we'll just filter out the deleted fields from the state
      setFields(fields.filter((field) => !fieldNames.includes(field.key)))
      setSelectedRowKeys(selectedRowKeys.filter((key) => !fieldNames.includes(key))) // Update selection
      return true
    } catch (error) {
      console.error("Failed to delete fields", error)
      message.error("Failed to delete fields")
      return false
    }
  }

  // Handle bulk delete with dependency checking
  const handleBulkDelete = async () => {
    await checkMultipleFieldDependencies(selectedRowKeys)
  }

  // Filter fields based on search and field type
  const filteredFields = fields.filter((field) => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedFieldTypes.length === 0 || selectedFieldTypes.includes(field.fieldType)
    return matchesSearch && matchesType
  })

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
  }

  // Define AntD Table Columns
  const columns = [
    {
      title: "Field Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="text-gray-800 font-medium">{text}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Data Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <Tag color="geekblue" className="rounded-full">
          {text}
        </Tag>
      ),
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: "Field Type",
      dataIndex: "fieldType",
      key: "fieldType",
      filters: [
        { text: "SYSTEM", value: "SYSTEM" },
        { text: "CUSTOM", value: "CUSTOM" },
        { text: "STANDARD", value: "STANDARD" },
      ],
      onFilter: (value, record) => record.fieldType === value,
      render: (type) => (
        <Tag color={type === "SYSTEM" ? "volcano" : type === "CUSTOM" ? "green" : "default"} className="rounded-full">
          {type}
        </Tag>
      ),
    },
    {
      title: "Mapping",
      dataIndex: "mapping",
      key: "mapping",
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Lookup",
      dataIndex: "lookup",
      key: "lookup",
      render: (text) =>
        text === "Has Lookup" ? (
          <Tag color="cyan" className="rounded-full">
            Has Lookup
          </Tag>
        ) : (
          <span className="text-gray-400">--</span>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          className="text-red-500 hover:text-red-700"
          onClick={() => checkAndDeleteField(record.key)}
          loading={isDependencyCheckLoading && selectedRowKeys.length === 1 && selectedRowKeys[0] === record.key}
        />
      ),
    },
  ]

  return (
    <div className="min-h-screen w-[79vw] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/objects")}
            className="flex items-center text-gray-600 hover:text-gray-800 border-gray-300 h-10"
          >
            Back to Objects
          </Button>
          <div className="flex gap-2">
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                className="h-10"
                onClick={handleBulkDelete}
                loading={isDependencyCheckLoading && selectedRowKeys.length > 1}
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/editfields")}
              className="h-10 bg-blue-600 hover:bg-blue-700 border-none"
            >
              Create Field
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">{objectName} Field Management</h1>
          <p className="text-gray-500 mt-2">Manage and configure fields for your {objectName} object</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search field name..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />

            <Select
              placeholder="Filter by field type"
              allowClear
              mode="multiple"
              value={selectedFieldTypes}
              onChange={(values) => setSelectedFieldTypes(values)}
              className="min-w-[200px] h-10"
            >
              <Option value="STANDARD">Standard</Option>
              <Option value="SYSTEM">System</Option>
              <Option value="CUSTOM">Custom</Option>
            </Select>

            <DatePicker.RangePicker
              onChange={(dates) => setDateRange(dates)}
              className="h-10"
              placeholder={["Start date", "End date"]}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredFields}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                className: "px-6 py-4",
              }}
              className="ant-table-striped"
              rowClassName={(record, index) => (index % 2 === 0 ? "bg-gray-50" : "")}
            />
          )}
        </div>

        {/* Dependency Check Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-gray-800">
              <ExclamationCircleOutlined className="text-amber-500 text-xl" />
              <span>Field Dependencies Check</span>
            </div>
          }
          open={isDependencyCheckModalVisible}
          onCancel={() => setIsDependencyCheckModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDependencyCheckModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={700}
          className="dependency-check-modal"
        >
          <div className="py-4">
            {/* Summary statistics */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-gray-700">{dependencyCheckResults.length}</div>
                  <div className="text-sm text-gray-500">Fields Checked</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600">
                    {dependencyCheckResults.filter((r) => r.canDelete).length}
                  </div>
                  <div className="text-sm text-gray-500">Can Be Deleted</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-red-600">
                    {dependencyCheckResults.filter((r) => !r.canDelete).length}
                  </div>
                  <div className="text-sm text-gray-500">Have Dependencies</div>
                </div>
              </div>
            </div>

            {/* Fields with dependencies */}
            {dependencyCheckResults.filter((r) => !r.canDelete).length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ExclamationCircleOutlined className="text-red-500 text-lg" />
                  <Title level={5} className="m-0 text-red-600">
                    Fields with Dependencies
                  </Title>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg overflow-hidden">
                  {dependencyCheckResults
                    .filter((result) => !result.canDelete)
                    .map((result, index) => (
                      <div key={result.fieldName} className={`p-4 ${index !== 0 ? "border-t border-red-100" : ""}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color="red" className="m-0 font-medium">
                            {result.fieldName}
                          </Tag>
                          <Text type="danger" className="text-sm">
                            Cannot be deleted due to {result.dependencies.length} dependencies
                          </Text>
                        </div>
                        <div className="ml-6 mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            {result.dependencies.map((dep, i) => (
                              <div
                                key={i}
                                className="bg-white p-2 rounded border border-red-200 flex items-center gap-2"
                              >
                                {dep.type === "Form" ? (
                                  <i className="text-amber-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                      <polyline points="14 2 14 8 20 8"></polyline>
                                      <line x1="16" y1="13" x2="8" y2="13"></line>
                                      <line x1="16" y1="17" x2="8" y2="17"></line>
                                      <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                  </i>
                                ) : (
                                  <i className="text-blue-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </i>
                                )}
                                <div>
                                  <div className="text-xs text-gray-500">{dep.type}</div>
                                  <div className="text-sm font-medium text-gray-700">{dep.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Fields that can be deleted */}
            {dependencyCheckResults.filter((r) => r.canDelete).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                  <Title level={5} className="m-0 text-green-600">
                    Fields Ready for Deletion
                  </Title>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {dependencyCheckResults
                      .filter((result) => result.canDelete)
                      .map((result) => (
                        <Tag
                          key={result.fieldName}
                          color="green"
                          icon={<CheckCircleOutlined />}
                          className="py-1 px-3 text-sm"
                        >
                          {result.fieldName}
                        </Tag>
                      ))}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <InfoCircleOutlined className="mr-1" />
                    These fields have no dependencies and can be safely deleted.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default FieldsListing
