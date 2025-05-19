"use client"

import { useState, useEffect, useCallback } from "react"
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
  Modal,
  Checkbox,
  Badge,
  Tag,
  Typography,
  Alert,
  Steps,
  Spin,
  Empty,
  Skeleton,
  Drawer,
} from "antd"
import {
  PlusOutlined,
  SwapOutlined,
  DeleteOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  LockOutlined,
  SyncOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  RightOutlined,
  CloudSyncOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import { fetchObjects, fetchFieldNames, createMigration } from "./api/api"
import { Pagination } from "@/components/ui/pagination"

const { TabPane } = Tabs
const { Option } = Select
const { confirm } = Modal
const { Title, Text, Paragraph } = Typography
const { Step } = Steps

// Type color mapping
const typeColors = {
  string: "#1890ff",
  number: "#52c41a",
  boolean: "#faad14",
  date: "#722ed1",
  object: "#eb2f96",
  array: "#fa541c",
}

const FieldsMigration = () => {
  // State for authentication
  const [sourceUrl, setSourceUrl] = useState("")
  const [sourceToken, setSourceToken] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [targetToken, setTargetToken] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)

  // State for objects (tables/entities)
  const [sourceObjects, setSourceObjects] = useState([])
  const [targetObjects, setTargetObjects] = useState([])
  const [isLoadingSourceObjects, setIsLoadingSourceObjects] = useState(false)
  const [isLoadingTargetObjects, setIsLoadingTargetObjects] = useState(false)
  const [sourceObjectError, setSourceObjectError] = useState(null)
  const [targetObjectError, setTargetObjectError] = useState(null)
  const [connectionType, setConnectionType] = useState(null)

  // State for Fields Adding
  const [sourceObjectSelection, setSourceObjectSelection] = useState(null)
  const [targetObjectSelection, setTargetObjectSelection] = useState(null)
  const [sourceObjectFields, setSourceObjectFields] = useState([])
  const [targetObjectFields, setTargetObjectFields] = useState([])
  const [isLoadingSourceFields, setIsLoadingSourceFields] = useState(false)
  const [isLoadingTargetFields, setIsLoadingTargetFields] = useState(false)
  const [fieldMappings, setFieldMappings] = useState([{ id: 1, sourceField: "", targetField: "" }])
  const [sameSourceSelection, setSameSourceSelection] = useState(null)
  const [csvFields, setCsvFields] = useState([])
  const [csvMappings, setCsvMappings] = useState([{ id: 1, sourceField: "", targetField: "" }])
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [showResultDrawer, setShowResultDrawer] = useState(false)

  // State for multi-select fields
  const [selectedSourceFields, setSelectedSourceFields] = useState([])
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [bulkMappingTarget, setBulkMappingTarget] = useState(null)

  // Enhanced multi-select state
  const [showFieldSelectionModal, setShowFieldSelectionModal] = useState(false)
  const [selectedFieldsForMigration, setSelectedFieldsForMigration] = useState([])

  // State for Rename Fields
  const [renameSourceObjectSelection, setRenameSourceObjectSelection] = useState(null)
  const [renameSourceFields, setRenameSourceFields] = useState([])
  const [isLoadingRenameFields, setIsLoadingRenameFields] = useState(false)
  const [renameFields, setRenameFields] = useState([{ id: 1, currentName: "", newName: "", source: "" }])
  const [csvRenameFields, setCsvRenameFields] = useState([{ id: 1, currentName: "", newName: "", source: "" }])
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameResult, setRenameResult] = useState(null)

  // State for Delete Fields
  const [deleteObjectSelection, setDeleteObjectSelection] = useState(null)
  const [deleteFields, setDeleteFields] = useState([])
  const [isLoadingDeleteFields, setIsLoadingDeleteFields] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteResult, setDeleteResult] = useState(null)

  // State for field search and pagination
  const [sourceFieldsSearch, setSourceFieldsSearch] = useState("")
  const [targetFieldsSearch, setTargetFieldsSearch] = useState("")
  const [sourceFieldsPage, setSourceFieldsPage] = useState(1)
  const [targetFieldsPage, setTargetFieldsPage] = useState(1)
  const [fieldsPerPage, setFieldsPerPage] = useState(20)

  // State for active tab
  const [activeTabKey, setActiveTabKey] = useState("1")

  // Fetch source objects when source credentials are provided
  const fetchSourceObjectsData = useCallback(async () => {
    if (sourceUrl && sourceToken) {
      setIsLoadingSourceObjects(true)
      setSourceObjectError(null)
      try {
        const objects = await fetchObjects(sourceUrl, sourceToken)
        setSourceObjects(objects)
      } catch (error) {
        console.error("Error fetching source objects:", error)
        setSourceObjectError(error.message)
        message.error(`Failed to fetch source objects: ${error.message}`)
      } finally {
        setIsLoadingSourceObjects(false)
      }
    }
  }, [sourceUrl, sourceToken])

  // Fetch target objects when target credentials are provided
  const fetchTargetObjectsData = async (targetUrl, targetToken, source) => {
    if (targetUrl && targetToken) {
      source === "target" ? setIsLoadingTargetObjects(true) : setIsLoadingSourceObjects(true)
      setTargetObjectError(null)
      try {
        const objects = await fetchObjects(targetUrl, targetToken)
        source === "target" ? setTargetObjects(objects) : setSourceObjects(objects)
      } catch (error) {
        console.error("Error fetching target objects:", error)
        setTargetObjectError(error.message)
        message.error(`Failed to fetch target objects: ${error.message}`)
      } finally {
        setIsLoadingTargetObjects(false)
        source === "target" ? setIsLoadingTargetObjects(false) : setIsLoadingSourceObjects(false)
      }
    }
  }

  // Fetch source fields when source object is selected
  const fetchSourceFieldsData = useCallback(async () => {
    if (sourceUrl && sourceToken && sourceObjectSelection) {
      setIsLoadingSourceFields(true)
      try {
        const fields = await fetchFieldNames(sourceUrl, sourceToken, sourceObjectSelection)
        setSourceObjectFields(fields)
      } catch (error) {
        console.error("Error fetching source fields:", error)
        message.error(`Failed to fetch source fields: ${error.message}`)
      } finally {
        setIsLoadingSourceFields(false)
      }
    }
  }, [sourceUrl, sourceToken, sourceObjectSelection])

  // Fetch target fields when target object is selected
  const fetchTargetFieldsData = useCallback(async () => {
    if (targetUrl && targetToken && targetObjectSelection) {
      setIsLoadingTargetFields(true)
      try {
        const fields = await fetchFieldNames(targetUrl, targetToken, targetObjectSelection)
        setTargetObjectFields(fields)
      } catch (error) {
        console.error("Error fetching target fields:", error)
        message.error(`Failed to fetch target fields: ${error.message}`)
      } finally {
        setIsLoadingTargetFields(false)
      }
    }
  }, [targetUrl, targetToken, targetObjectSelection])

  // Fetch fields for rename when source object is selected
  const fetchRenameFieldsData = useCallback(async () => {
    if (sourceUrl && sourceToken && renameSourceObjectSelection) {
      setIsLoadingRenameFields(true)
      try {
        const fields = await fetchFieldNames(sourceUrl, sourceToken, renameSourceObjectSelection)
        setRenameSourceFields(fields)
      } catch (error) {
        console.error("Error fetching fields for rename:", error)
        message.error(`Failed to fetch fields: ${error.message}`)
      } finally {
        setIsLoadingRenameFields(false)
      }
    }
  }, [sourceUrl, sourceToken, renameSourceObjectSelection])

  // Fetch fields for delete when source object is selected
  const fetchDeleteFieldsData = useCallback(async () => {
    if (sourceUrl && sourceToken && deleteObjectSelection) {
      setIsLoadingDeleteFields(true)
      try {
        const fields = await fetchFieldNames(sourceUrl, sourceToken, deleteObjectSelection)
        // Ensure each field has a unique id and selected property
        setDeleteFields(
          fields.map((field, index) => ({
            ...field,
            id: field.id || index + 1,
            selected: false,
          })),
        )
        setSelectAll(false)
        setSourceFieldsSearch("")
      } catch (error) {
        console.error("Error fetching fields for delete:", error)
        message.error(`Failed to fetch fields: ${error.message}`)
      } finally {
        setIsLoadingDeleteFields(false)
      }
    }
  }, [sourceUrl, sourceToken, deleteObjectSelection])

  // Effect hooks for fetching data
  useEffect(() => {
    fetchSourceObjectsData()
  }, [fetchSourceObjectsData])

  useEffect(() => {
    fetchSourceFieldsData()
  }, [fetchSourceFieldsData])

  useEffect(() => {
    fetchTargetFieldsData()
  }, [fetchTargetFieldsData])

  useEffect(() => {
    fetchRenameFieldsData()
  }, [fetchRenameFieldsData])

  useEffect(() => {
    fetchDeleteFieldsData()
  }, [fetchDeleteFieldsData])

  // Reset selected fields when multi-select mode changes
  useEffect(() => {
    if (!isMultiSelectMode) {
      setSelectedSourceFields([])
      setBulkMappingTarget(null)
    }
  }, [isMultiSelectMode])

  // Reset form state when switching tabs
  const handleTabChange = (key) => {
    setActiveTabKey(key)

    // Reset state based on the tab
    if (key === "1") {
      // Fields Adding tab
      setFieldMappings([{ id: 1, sourceField: "", targetField: "" }])
      setSelectedFieldsForMigration([])
      setSourceObjectSelection(null)
      setTargetObjectSelection(null)
      setSameSourceSelection(null)
      setSourceFieldsSearch("")
      setTargetFieldsSearch("")
    } else if (key === "2") {
      // Rename Fields tab
      setRenameFields([{ id: 1, currentName: "", newName: "", source: "" }])
      setRenameSourceObjectSelection(null)
      setSourceFieldsSearch("")
    } else if (key === "3") {
      // Deletion Fields tab
      setDeleteFields([])
      setSelectAll(false)
      setDeleteObjectSelection(null)
      setSourceFieldsSearch("")
    }
  }

  // Test connection
  const testConnection = async (type) => {
    setConnectionType(type)
    setConnectionStatus(null)

    try {
      if (type === "source" && sourceUrl && sourceToken) {
        // Simulate API call to test connection
        await new Promise((resolve) => setTimeout(resolve, 1500))
        fetchTargetObjectsData(sourceUrl, sourceToken, "source")
        setIsTestingConnection(true)
        setConnectionStatus({ type, success: true })
        message.success("Source connection successful!")
      } else if (type === "target" && targetUrl && targetToken) {
        // Simulate API call to test connection
        fetchTargetObjectsData(targetUrl, targetToken, "target")
        setIsTestingConnection(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setConnectionStatus({ type, success: true })
        message.success("Target connection successful!")
      } else {
        setConnectionStatus({ type, success: false })
        message.error(`${type === "source" ? "Source" : "Target"} connection failed. Please check your credentials.`)
      }
    } catch (error) {
      setConnectionStatus({ type, success: false })
      message.error(`Connection test failed: ${error.message}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

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

  // Toggle multi-select mode
  const toggleMultiSelectMode = (checked) => {
    setIsMultiSelectMode(checked)
    if (!checked) {
      setSelectedSourceFields([])
      setBulkMappingTarget(null)
    }
  }

  // Handle source field selection for multi-select
  const handleSourceFieldSelection = (field) => {
    const fieldId = field.id
    if (selectedSourceFields.includes(fieldId)) {
      setSelectedSourceFields(selectedSourceFields.filter((id) => id !== fieldId))
    } else {
      setSelectedSourceFields([...selectedSourceFields, fieldId])
    }
  }

  // Handle field selection in the modal
  const handleFieldSelectionChange = (fieldId) => {
    if (selectedFieldsForMigration.includes(fieldId)) {
      setSelectedFieldsForMigration(selectedFieldsForMigration.filter((id) => id !== fieldId))
    } else {
      setSelectedFieldsForMigration([...selectedFieldsForMigration, fieldId])
    }
  }

  // Handle select all fields in the modal
  const handleSelectAllFields = (checked) => {
    if (checked) {
      setSelectedFieldsForMigration(sourceObjectFields.map((field) => field.id))
    } else {
      setSelectedFieldsForMigration([])
    }
  }

  // Apply selected fields from modal to create mappings
  const applySelectedFields = () => {
    if (selectedFieldsForMigration.length === 0) {
      message.warning("Please select at least one field to migrate")
      return
    }

    // Close the modal
    setShowFieldSelectionModal(false)

    message.success(`${selectedFieldsForMigration.length} fields selected for migration`)
  }

  // Apply bulk mapping
  const applyBulkMapping = () => {
    if (!bulkMappingTarget || selectedSourceFields.length === 0) {
      message.warning("Please select target field type and at least one source field")
      return
    }

    // Create mappings for selected fields
    const newMappings = selectedSourceFields
      .map((fieldId, index) => {
        const sourceField = sourceObjectFields.find((f) => f.id === fieldId)
        return {
          id: Date.now() + index,
          sourceField: sourceField ? sourceField.name : "",
          targetField: bulkMappingTarget,
        }
      })
      .filter((mapping) => mapping.sourceField) // Filter out any mappings with empty source fields

    // Add to existing mappings
    setFieldMappings([...fieldMappings, ...newMappings])

    // Reset selections
    setSelectedSourceFields([])
    setBulkMappingTarget(null)
    message.success(`${newMappings.length} field mappings added`)
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
    setRenameFields([
      ...renameFields,
      { id: newId, currentName: "", newName: "", source: renameSourceObjectSelection || "" },
    ])
  }

  // Add new CSV rename field
  const addCsvRenameField = () => {
    const newId = csvRenameFields.length > 0 ? Math.max(...csvRenameFields.map((f) => f.id)) + 1 : 1
    setCsvRenameFields([...csvRenameFields, { id: newId, currentName: "", newName: "", source: "" }])
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
    const updatedFields = deleteFields.map((field) =>
      field.id === id ? { ...field, selected: !field.selected } : field,
    )

    setDeleteFields(updatedFields)

    // Check if all are selected after this toggle
    const allSelected = updatedFields.every((field) => field.selected)
    setSelectAll(allSelected)
  }

  // Log selected fields for migration
  const logSelectedFieldsForMigration = () => {
    console.log("=== Selected Fields for Migration ===")
    const selectedFields = selectedFieldsForMigration
      .map((fieldId) => {
        const field = sourceObjectFields.find((f) => f.id === fieldId)
        return field ? { id: field.id, name: field.name, type: field.type } : null
      })
      .filter(Boolean)

    console.log({
      sourceObject: sourceObjectSelection,
      targetObject: targetObjectSelection,
      selectedFields,
      totalSelected: selectedFields.length,
      
    })


    return {
      sourceObject: sourceObjectSelection,
      targetObject: targetObjectSelection,
      selectedFields,
      totalSelected: selectedFields.length,
      
    }
  }

  // Log fields for deletion
  const logSelectedFieldsForDeletion = () => {
    console.log("=== Selected Fields for Deletion ===")
    const selectedFields = deleteFields
      .filter((field) => field.selected)
      .map((field) => ({ id: field.id, name: field.name, type: field.type }))

    console.log({
      sourceObject: deleteObjectSelection,
      selectedFields,
      totalSelected: selectedFields.length,
    })

    return selectedFields
  }

  // Log fields for renaming
  const logSelectedFieldsForRename = () => {
    console.log("=== Selected Fields for Rename ===")
    const renamedFields = renameFields
      .map((field) => ({
        currentName: field.currentName,
        newName: field.newName,
        source: field.source || renameSourceObjectSelection,
      }))
      .filter((field) => field.currentName && field.newName)

    console.log({
      sourceObject: renameSourceObjectSelection,
      renamedFields,
      totalRenamed: renamedFields.length,
    })

    return renamedFields
  }

  // Apply field migration without mapping
  const applyFieldMigration = async () => {
    if (!sourceUrl || !sourceToken || !targetUrl || !targetToken || !sourceObjectSelection || !targetObjectSelection) {
      message.error("Please provide all required information")
      return
    }

    if (selectedFieldsForMigration.length === 0) {
      message.error("Please select at least one field to migrate")
      return
    }

    // Log the selected fields before migration
const fieldsToMigrate = {
    ...logSelectedFieldsForMigration(),
    ...(sourceUrl && sourceToken && targetUrl && targetToken
        ? { sourceUrl, sourceToken, targetUrl, targetToken }
        : {}),
};
    setIsMigrating(true)
    setMigrationResult(null)

    try {
      console.log(fieldsToMigrate)
      await createMigration(fieldsToMigrate)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = {
        success: true,
        message: "Fields migrated successfully!",
        details: {
          sourceObject: sourceObjectSelection,
          targetObject: targetObjectSelection,
          migratedFields: fieldsToMigrate.length,
          timestamp: new Date().toISOString(),
        },
      }

      setMigrationResult(result)
      message.success(result.message)
      setShowResultDrawer(true)
    } catch (error) {
      console.error("Error migrating fields:", error)
      message.error(`Failed to migrate fields: ${error.message}`)
    } finally {
      setIsMigrating(false)
    }
  }

  // Confirm and execute field deletion
  const confirmDelete = () => {
    const selectedCount = deleteFields.filter((field) => field.selected).length

    if (selectedCount === 0) {
      message.warning("Please select at least one field to delete")
      return
    }

    // Log the selected fields before confirmation
    const fieldsToDelete = logSelectedFieldsForDeletion()

    confirm({
      title: `Are you sure you want to delete ${selectedCount} field(s)?`,
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setIsDeleting(true)
        setDeleteResult(null)

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500))

          const result = {
            success: true,
            message: `Successfully deleted ${fieldsToDelete.length} fields from ${deleteObjectSelection}`,
          }

          setDeleteResult(result)
          message.success(result.message)

          // Update the fields list
          setDeleteFields(deleteFields.filter((field) => !field.selected))
          setSelectAll(false)
        } catch (error) {
          console.error("Error deleting fields:", error)
          message.error(`Failed to delete fields: ${error.message}`)
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  // Apply field renames
  const applyFieldRenames = async () => {
    if (!sourceUrl || !sourceToken || !renameSourceObjectSelection) {
      message.error("Please provide all required information")
      return
    }

    if (!renameFields.every((f) => f.currentName && f.newName)) {
      message.error("Please complete all field renames")
      return
    }

    // Log the rename fields before applying
    const fieldsToRename = logSelectedFieldsForRename()

    setIsRenaming(true)
    setRenameResult(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const result = {
        success: true,
        message: `Successfully renamed ${fieldsToRename.length} fields in ${renameSourceObjectSelection}`,
      }

      setRenameResult(result)
      message.success(result.message)
    } catch (error) {
      console.error("Error applying field renames:", error)
      message.error(`Failed to apply field renames: ${error.message}`)
    } finally {
      setIsRenaming(false)
    }
  }

  // Handle multi-select delete
  const handleMultiSelectDelete = () => {
    const selectedFieldIds = deleteFields.filter((field) => field.selected).map((field) => field.id)

    if (selectedFieldIds.length === 0) {
      message.warning("Please select at least one field to delete")
      return
    }

    // Log the selected fields before deletion
    const fieldsToDelete = logSelectedFieldsForDeletion()

    confirm({
      title: `Are you sure you want to delete ${selectedFieldIds.length} field(s)?`,
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      onOk: async () => {
        setIsDeleting(true)

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500))

          // Remove selected fields from the list
          setDeleteFields(deleteFields.filter((field) => !field.selected))
          setSelectAll(false)

          message.success(`Successfully deleted ${fieldsToDelete.length} fields`)
        } catch (error) {
          message.error(`Failed to delete fields: ${error.message}`)
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  // Add a form submission handler for the field selection section
  const handleFieldSelectionSubmit = (e) => {
    e.preventDefault()
    applyFieldMigration()
  }

  // Add a form submission handler for the delete fields section
  const handleDeleteFieldsSubmit = (e) => {
    e.preventDefault()
    confirmDelete()
  }

  // Add a form submission handler for the rename fields section
  const handleRenameFieldsSubmit = (e) => {
    e.preventDefault()
    applyFieldRenames()
  }

  // Apply field mappings (original functionality)
  const applyFieldMappings = async () => {
    if (!sourceUrl || !sourceToken || !targetUrl || !targetToken || !sourceObjectSelection || !targetObjectSelection) {
      message.error("Please provide all required information")
      return
    }

    if (!fieldMappings.every((m) => m.sourceField && m.targetField)) {
      message.error("Please complete all field mappings")
      return
    }

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = {
        success: true,
        message: "Field mappings applied successfully!",
        details: {
          sourceObject: sourceObjectSelection,
          targetObject: targetObjectSelection,
          migratedFields: fieldMappings.length,
          timestamp: new Date().toISOString(),
        },
      }

      setMigrationResult(result)
      message.success(result.message)
      setShowResultDrawer(true)
    } catch (error) {
      console.error("Error applying field mappings:", error)
      message.error(`Failed to apply field mappings: ${error.message}`)
    } finally {
      setIsMigrating(false)
    }
  }

  // Filter source fields based on search
  const filteredSourceFields = deleteObjectSelection
    ? deleteFields.filter((field) => field.name.toLowerCase().includes(sourceFieldsSearch.toLowerCase()))
    : []

  // Filter target fields based on search
  const filteredTargetFields = targetObjectFields.filter((field) =>
    field.name.toLowerCase().includes(targetFieldsSearch.toLowerCase()),
  )

  // Paginate source fields
  const paginatedSourceFields = filteredSourceFields.slice(
    (sourceFieldsPage - 1) * fieldsPerPage,
    sourceFieldsPage * fieldsPerPage,
  )

  // Paginate target fields
  const paginatedTargetFields = filteredTargetFields.slice(
    (targetFieldsPage - 1) * fieldsPerPage,
    targetFieldsPage * fieldsPerPage,
  )

  // Delete fields table columns
  const deleteColumnsConfig = [
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
      render: (name) => <span className="font-medium text-gray-800">{name}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={typeColors[type] || "#108ee9"} style={{ borderRadius: "12px" }}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Required",
      dataIndex: "isRequired",
      key: "isRequired",
      render: (isRequired) =>
        isRequired ? <Badge status="error" text="Required" /> : <Badge status="default" text="Optional" />,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
  ]

  // Field selection modal columns
  const fieldSelectionColumns = [
    {
      title: (
        <Checkbox
          checked={selectedFieldsForMigration.length === sourceObjectFields.length && sourceObjectFields.length > 0}
          onChange={(e) => handleSelectAllFields(e.target.checked)}
        />
      ),
      dataIndex: "selected",
      key: "selected",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedFieldsForMigration.includes(record.id)}
          onChange={() => handleFieldSelectionChange(record.id)}
        />
      ),
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
      render: (type) => (
        <Tag color={typeColors[type] || "#108ee9"} style={{ borderRadius: "12px" }}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Required",
      dataIndex: "isRequired",
      key: "isRequired",
      render: (isRequired) =>
        isRequired ? <Badge status="error" text="Required" /> : <Badge status="default" text="Optional" />,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
  ]

  // Authentication form for source and target
  const renderAuthenticationFields = (type) => {
    if (type === "source") {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-sm border border-blue-100">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="m-0 text-blue-800">
              <DatabaseOutlined className="mr-2" /> Source Authentication
            </Title>
            {connectionStatus?.type === "source" && (
              <Badge
                status={connectionStatus.success ? "success" : "error"}
                text={connectionStatus.success ? "Connected" : "Connection Failed"}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
              <Input
                prefix={<LinkOutlined className="text-blue-400" />}
                placeholder="https://source-instance.example.com"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Access Token</label>
              <Input.Password
                prefix={<LockOutlined className="text-blue-400" />}
                placeholder="Enter source access token"
                value={sourceToken}
                onChange={(e) => setSourceToken(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              ghost
              onClick={() => testConnection("source")}
              loading={isTestingConnection && connectionStatus?.type === "source"}
              icon={<SyncOutlined />}
              className="bg-white"
            >
              Test Connection
            </Button>
          </div>

          {isLoadingSourceObjects && (
            <div className="mt-4">
              <Spin size="small" /> <Text className="ml-2">Loading available objects...</Text>
            </div>
          )}

          {sourceObjectError && <Alert message={sourceObjectError} type="error" showIcon className="mt-4" />}

          {sourceObjects.length > 0 && (
            <div className="mt-4">
              <Text type="success">
                <CheckCircleOutlined /> {sourceObjects.length} objects available
              </Text>
            </div>
          )}
        </div>
      )
    } else if (type === "target") {
      return (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl mb-6 shadow-sm border border-green-100">
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="m-0 text-green-800">
              <DatabaseOutlined className="mr-2" /> Target Authentication
            </Title>
            {connectionStatus?.type === "target" && (
              <Badge
                status={connectionStatus.success ? "success" : "error"}
                text={connectionStatus.success ? "Connected" : "Connection Failed"}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <Input
                prefix={<LinkOutlined className="text-green-400" />}
                placeholder="https://target-instance.example.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Access Token</label>
              <Input.Password
                prefix={<LockOutlined className="text-green-400" />}
                placeholder="Enter target access token"
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              ghost
              onClick={() => testConnection("target")}
              loading={isTestingConnection && connectionStatus?.type === "target"}
              icon={<SyncOutlined />}
              className="bg-white text-green-600 border-green-600 hover:text-green-500 hover:border-green-500"
            >
              Test Connection
            </Button>
          </div>

          {isLoadingTargetObjects && (
            <div className="mt-4">
              <Spin size="small" /> <Text className="ml-2">Loading available objects...</Text>
            </div>
          )}

          {targetObjectError && <Alert message={targetObjectError} type="error" showIcon className="mt-4" />}

          {targetObjects.length > 0 && (
            <div className="mt-4">
              <Text type="success">
                <CheckCircleOutlined /> {targetObjects.length} objects available
              </Text>
            </div>
          )}
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

  // Render field selection modal
  const renderFieldSelectionModal = () => {
    // Filter source fields based on search
    const filteredModalFields = sourceObjectFields.filter((field) =>
      field.name.toLowerCase().includes(sourceFieldsSearch.toLowerCase()),
    )

    return (
      <Modal
        title={
          <div className="flex items-center">
            <DatabaseOutlined className="mr-2 text-blue-500" />
            <span>Select Fields to Migrate from {sourceObjectSelection}</span>
          </div>
        }
        open={showFieldSelectionModal}
        onCancel={() => setShowFieldSelectionModal(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setShowFieldSelectionModal(false)}>
            Cancel
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={applySelectedFields}
            disabled={selectedFieldsForMigration.length === 0}
          >
            Apply Selected Fields ({selectedFieldsForMigration.length})
          </Button>,
        ]}
      >
        <div className="mb-4">
          <Alert
            message="Field Selection"
            description="Select the fields you want to migrate to the target object. You can select multiple fields at once."
            type="info"
            showIcon
          />
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search fields"
            prefix={<SearchOutlined />}
            value={sourceFieldsSearch}
            onChange={(e) => {
              setSourceFieldsSearch(e.target.value)
            }}
            allowClear
          />
        </div>

        <div className="mb-2 flex justify-between items-center">
          <Checkbox
            checked={selectedFieldsForMigration.length === sourceObjectFields.length && sourceObjectFields.length > 0}
            onChange={(e) => handleSelectAllFields(e.target.checked)}
          >
            <Text strong>Select All Fields</Text>
          </Checkbox>

          <Text type="secondary">
            {selectedFieldsForMigration.length} of {sourceObjectFields.length} selected
          </Text>
        </div>

        {isLoadingSourceFields ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <Table
              rowKey="id"
              columns={fieldSelectionColumns}
              dataSource={filteredModalFields}
              pagination={false}
              size="middle"
              rowClassName={(record) => (selectedFieldsForMigration.includes(record.id) ? "bg-blue-50" : "")}
            />
          </div>
        )}
      </Modal>
    )
  }

  // Render result drawer
  const renderResultDrawer = () => {
    return (
      <Drawer
        title={
          <div className="flex items-center text-green-700">
            <CheckCircleOutlined className="mr-2" />
            Operation Completed Successfully
          </div>
        }
        placement="right"
        onClose={() => setShowResultDrawer(false)}
        open={showResultDrawer}
        width={500}
      >
        {migrationResult && (
          <div className="space-y-6">
            <Alert message={migrationResult.message} type="success" showIcon />

            <div>
              <Title level={5}>Migration Details</Title>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Paragraph>
                  <strong>Source Object:</strong> {migrationResult.details.sourceObject}
                </Paragraph>
                <Paragraph>
                  <strong>Target Object:</strong> {migrationResult.details.targetObject}
                </Paragraph>
                <Paragraph>
                  <strong>Fields Migrated:</strong> {migrationResult.details.migratedFields}
                </Paragraph>
                <Paragraph>
                  <strong>Timestamp:</strong> {new Date(migrationResult.details.timestamp).toLocaleString()}
                </Paragraph>
              </div>
            </div>
            <div className="flex justify-end">
              <Space>
                <Button onClick={() => setShowResultDrawer(false)}>Close</Button>
                <Button type="primary" icon={<EyeOutlined />}>
                  View in System
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    )
  }

  // Simplified field selection section without mapping
  const renderFieldSelectionSection = () => {
    return (
      <form
        onSubmit={handleFieldSelectionSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <Title level={5} className="m-0">
            <ThunderboltOutlined className="mr-2 text-blue-500" /> Field Selection
          </Title>
          <Button
            type="primary"
            onClick={() => setShowFieldSelectionModal(true)}
            icon={<SearchOutlined />}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            Select Fields to Migrate
          </Button>
        </div>

        {selectedFieldsForMigration.length > 0 ? (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Selected Fields ({selectedFieldsForMigration.length})</Text>
              <Button size="small" danger onClick={() => setSelectedFieldsForMigration([])} className="hover:bg-red-50">
                Clear All
              </Button>
            </div>
            <div className="border rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedFieldsForMigration.map((fieldId) => {
                  const field = sourceObjectFields.find((f) => f.id === fieldId)
                  return field ? (
                    <Tag
                      key={field.id}
                      color={typeColors[field.type] || "#108ee9"}
                      className="m-1 py-1 px-2"
                      closable
                      onClose={() => {
                        setSelectedFieldsForMigration(selectedFieldsForMigration.filter((id) => id !== field.id))
                      }}
                    >
                      {field.name}
                    </Tag>
                  ) : null
                })}
              </div>
            </div>
          </div>
        ) : (
          <Empty description="No fields selected for migration" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<CloudSyncOutlined />}
            loading={isMigrating}
            disabled={
              !sourceUrl ||
              !sourceToken ||
              !sourceObjectSelection ||
              !targetObjectSelection ||
              selectedFieldsForMigration.length === 0
            }
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md"
          >
            Migrate Selected Fields
          </Button>
        </div>
      </form>
    )
  }

  // Render delete fields section with improved multi-select
  const renderDeleteFieldsSection = () => {
    const selectedCount = deleteFields.filter((field) => field.selected).length

    return (
      <div className="space-y-6">
        <form onSubmit={handleDeleteFieldsSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Title level={5} className="m-0 flex items-center">
              <DeleteOutlined className="mr-2 text-red-500" />
              Field Selection for Deletion
            </Title>
            {selectedCount > 0 && (
              <Badge count={selectedCount} className="animate-pulse" style={{ backgroundColor: "#ff4d4f" }} />
            )}
          </div>

          <div className="mb-4">
            <Input
              placeholder="Search fields"
              prefix={<SearchOutlined />}
              value={sourceFieldsSearch}
              onChange={(e) => {
                setSourceFieldsSearch(e.target.value)
                setSourceFieldsPage(1)
              }}
              allowClear
              className="rounded-lg"
            />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <Checkbox checked={selectAll} onChange={toggleSelectAll} className="text-gray-700 font-medium">
              Select All Fields ({deleteFields.length})
            </Checkbox>

            {selectedCount > 0 && (
              <Button
                danger
                type="primary"
                size="small"
                onClick={handleMultiSelectDelete}
                icon={<DeleteOutlined />}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Selected ({selectedCount})
              </Button>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table
              rowKey="id"
              columns={deleteColumnsConfig}
              dataSource={filteredSourceFields}
              pagination={{
                current: sourceFieldsPage,
                pageSize: fieldsPerPage,
                total: filteredSourceFields.length,
                onChange: setSourceFieldsPage,
                showSizeChanger: false,
              }}
              size="middle"
              rowClassName={(record) => (record.selected ? "bg-red-50" : "")}
              loading={isLoadingDeleteFields}
              className="hover-highlight-table"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
              disabled={
                !sourceUrl || !sourceToken || deleteFields.length === 0 || !deleteFields.some((f) => f.selected)
              }
              size="large"
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md"
            >
              Delete Selected Fields
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-[79vw] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <Card className="w-full max-w-6xl shadow-xl rounded-xl border border-gray-200 overflow-hidden">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fields Migration
          </Title>
          <Text className="text-gray-500">
            Manage your field migrations: add, rename, or delete fields across different sources
          </Text>
        </div>

        <Tabs
          defaultActiveKey="1"
          activeKey={activeTabKey}
          onChange={handleTabChange}
          type="card"
          className="mb-4"
          tabBarStyle={{ marginBottom: 24 }}
          tabBarGutter={8}
        >
          <TabPane
            tab={
              <span className="px-1 py-1 flex items-center">
                <PlusOutlined className="mr-1" /> Fields Adding
              </span>
            }
            key="1"
          >
            <div className="mb-4 pb-2 border-b border-gray-200">
              <Title level={4} className="text-gray-700">
                Migration Type
              </Title>
              <Text type="secondary">Select how you want to migrate fields</Text>
            </div>
            <Tabs
              defaultActiveKey="different"
              type="line"
              tabBarGutter={24}
              className="migration-tabs"
              size="large"
              style={{ marginBottom: "24px" }}
            >
              <TabPane
                tab={
                  <span className="px-2 py-1 text-base">
                    <DatabaseOutlined className="mr-2" />
                    Different Sources
                  </span>
                }
                key="different"
              >
                <div className="space-y-6">
                  <Steps current={0} progressDot className="mb-8">
                    <Step title="Connect" description="Set up connections" />
                    <Step title="Select" description="Choose objects" />
                    <Step title="Select Fields" description="Choose fields" />
                    <Step title="Migrate" description="Apply changes" />
                  </Steps>

                  {renderAuthenticationFields("both")}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Object</label>
                      <Select
                        placeholder="Select source object"
                        className="w-full"
                        onChange={(value) => {
                          setSourceObjectSelection(value)
                          setSourceFieldsSearch("")
                          setSourceFieldsPage(1)
                          setSelectedFieldsForMigration([]) // Reset selected fields when changing source object
                        }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                          0
                        }
                        loading={isLoadingSourceObjects}
                        disabled={isLoadingSourceObjects || sourceObjects.length === 0}
                        value={sourceObjectSelection}
                      >
                        {sourceObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            <div className="flex flex-col">
                              <span>{object.name}</span>
                              {object.description && (
                                <Text type="secondary" className="text-xs">
                                  {object.description}
                                </Text>
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                      {isLoadingSourceFields && (
                        <div className="mt-2">
                          <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                        </div>
                      )}
                      {sourceObjectSelection && !isLoadingSourceFields && (
                        <div className="mt-2">
                          <Button
                            type="link"
                            onClick={() => setShowFieldSelectionModal(true)}
                            icon={<SearchOutlined />}
                          >
                            Select fields to migrate
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Object</label>
                      <Select
                        placeholder="Select target object"
                        className="w-full"
                        onChange={(value) => {
                          setTargetObjectSelection(value)
                          setTargetFieldsSearch("")
                          setTargetFieldsPage(1)
                        }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                          0
                        }
                        loading={isLoadingTargetObjects}
                        disabled={isLoadingTargetObjects || targetObjects.length === 0}
                        value={targetObjectSelection}
                      >
                        {targetObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            <div className="flex flex-col">
                              <span>{object.name}</span>
                              {object.description && (
                                <Text type="secondary" className="text-xs">
                                  {object.description}
                                </Text>
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                      {isLoadingTargetFields && (
                        <div className="mt-2">
                          <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {sourceObjectSelection && targetObjectSelection && renderFieldSelectionSection()}
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span className="px-2 py-1 text-base">
                    <SyncOutlined className="mr-2" />
                    Same Source
                  </span>
                }
                key="same"
              >
                <div className="space-y-6">
                  <Steps current={0} progressDot className="mb-8">
                    <Step title="Connect" description="Set up connection" />
                    <Step title="Select" description="Choose objects" />
                    <Step title="Select Fields" description="Choose fields" />
                    <Step title="Migrate" description="Apply changes" />
                  </Steps>

                  {renderAuthenticationFields("source")}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Object</label>
                      <Select
                        placeholder="Select source object"
                        className="w-full"
                        onChange={(value) => {
                          setSameSourceSelection(value)
                          setSourceObjectSelection(value)
                          setSourceFieldsSearch("")
                          setSourceFieldsPage(1)
                          setSelectedFieldsForMigration([]) // Reset selected fields when changing source object
                        }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                          0
                        }
                        loading={isLoadingSourceObjects}
                        disabled={isLoadingSourceObjects || sourceObjects.length === 0}
                        value={sameSourceSelection}
                      >
                        {sourceObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            <div className="flex flex-col">
                              <span>{object.name}</span>
                              {object.description && (
                                <Text type="secondary" className="text-xs">
                                  {object.description}
                                </Text>
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                      {isLoadingSourceFields && (
                        <div className="mt-2">
                          <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                        </div>
                      )}
                      {sameSourceSelection && !isLoadingSourceFields && (
                        <div className="mt-2">
                          <Button
                            type="link"
                            onClick={() => setShowFieldSelectionModal(true)}
                            icon={<SearchOutlined />}
                          >
                            Select fields to migrate
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Object</label>
                      <Select
                        placeholder="Select target object"
                        className="w-full"
                        onChange={(value) => {
                          setTargetObjectSelection(value)
                          setTargetFieldsSearch("")
                          setTargetFieldsPage(1)
                        }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        loading={isLoadingSourceObjects}
                        disabled={isLoadingSourceObjects || sourceObjects.length === 0}
                        value={targetObjectSelection}
                      >
                        {sourceObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            <div className="flex flex-col">
                              <span>{object.name}</span>
                              {object.description && (
                                <Text type="secondary" className="text-xs">
                                  {object.description}
                                </Text>
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                      {isLoadingTargetFields && (
                        <div className="mt-2">
                          <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                        </div>
                      )}
                    </div>
                  </div>

                  {sameSourceSelection && targetObjectSelection && renderFieldSelectionSection()}
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span className="px-2 py-1 text-base">
                    <FileTextOutlined className="mr-2" />
                    CSV Fields
                  </span>
                }
                key="csv"
              >
                <div className="space-y-6">
                  {renderAuthenticationFields("target")}

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                    <Upload
                      name="file"
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                      onChange={handleCsvUpload}
                      maxCount={1}
                      className="w-full"
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        block
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
                      >
                        Click to Upload CSV
                      </Button>
                    </Upload>
                    <div className="mt-2 text-xs text-gray-500">
                      <InfoCircleOutlined className="mr-1" />
                      CSV should contain field definitions to import
                    </div>
                  </div>

                  {csvFields.length > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Object</label>
                        <Select
                          placeholder="Select target object"
                          className="w-full"
                          onChange={(value) => setTargetObjectSelection(value)}
                          size="large"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.props.children[0].props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                          loading={isLoadingTargetObjects}
                          disabled={isLoadingTargetObjects || targetObjects.length === 0}
                        >
                          {targetObjects.map((object) => (
                            <Option key={object.id} value={object.name}>
                              <div className="flex flex-col">
                                <span>{object.name}</span>
                                {object.description && (
                                  <Text type="secondary" className="text-xs">
                                    {object.description}
                                  </Text>
                                )}
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </div>
                      {csvMappings.map((mapping, index) => (
                        <div
                          key={mapping.id}
                          className="flex items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                        >
                          <div className="flex-1">
                            <Input value={mapping.sourceField} disabled size="large" />
                          </div>

                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            <RightOutlined className="text-gray-400" />
                          </div>

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
                              disabled={!targetObjectSelection}
                              showSearch
                              allowClear
                              size="large"
                              dropdownRender={(menu) => (
                                <div>
                                  {menu}
                                  {filteredTargetFields.length > fieldsPerPage && (
                                    <div className="p-2 border-t flex justify-center">
                                      <Pagination
                                        current={targetFieldsPage}
                                        pageSize={fieldsPerPage}
                                        total={filteredTargetFields.length}
                                        onChange={setTargetFieldsPage}
                                        size="small"
                                        showSizeChanger={false}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            >
                              <Option value={`new_${mapping.sourceField}`}>
                                <div className="flex items-center">
                                  <PlusOutlined className="mr-2 text-green-500" />
                                  <span>Create as new field</span>
                                </div>
                              </Option>
                              {paginatedTargetFields.map((field) => (
                                <Option key={field.id} value={field.name}>
                                  <div className="flex items-center">
                                    <span>{field.name}</span>
                                    <Tag color={typeColors[field.type]} style={{ marginLeft: 8, borderRadius: "10px" }}>
                                      {field.type}
                                    </Tag>
                                  </div>
                                </Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          size="large"
                          icon={<CloudSyncOutlined />}
                          disabled={
                            !targetUrl ||
                            !targetToken ||
                            !targetObjectSelection ||
                            !csvMappings.every((m) => m.targetField)
                          }
                          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md"
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

          <TabPane
            tab={
              <span className="px-1">
                <SwapOutlined /> Rename Fields
              </span>
            }
            key="2"
          >
            <Tabs defaultActiveKey="same" type="line" tabBarGutter={24}>
              <TabPane tab="Same Source" key="same">
                <div className="space-y-6">
                  {renderAuthenticationFields("source")}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source Object</label>
                    <Select
                      placeholder="Select source object"
                      className="w-full"
                      onChange={(value) => {
                        setRenameSourceObjectSelection(value)
                        setRenameFields([{ id: 1, currentName: "", newName: "", source: value }])
                      }}
                      size="large"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      loading={isLoadingSourceObjects}
                      disabled={isLoadingSourceObjects || sourceObjects.length === 0}
                    >
                      {sourceObjects.map((object) => (
                        <Option key={object.id} value={object.name}>
                          <div className="flex flex-col">
                            <span>{object.name}</span>
                            {object.description && (
                              <Text type="secondary" className="text-xs">
                                {object.description}
                              </Text>
                            )}
                          </div>
                        </Option>
                      ))}
                    </Select>
                    {isLoadingRenameFields && (
                      <div className="mt-2">
                        <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                      </div>
                    )}
                  </div>

                  <Divider>
                    <Space>
                      <SwapOutlined />
                      <span>Rename Fields</span>
                    </Space>
                  </Divider>

                  {isLoadingRenameFields ? (
                    <div className="py-8">
                      <div className="text-center">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-500">Loading fields...</div>
                      </div>
                    </div>
                  ) : renameSourceFields.length === 0 ? (
                    <Empty description="Select a source object to rename fields" />
                  ) : (
                    <form onSubmit={handleRenameFieldsSubmit}>
                      <div className="mb-4">
                        <Input
                          placeholder="Search fields"
                          prefix={<SearchOutlined />}
                          value={sourceFieldsSearch}
                          onChange={(e) => {
                            setSourceFieldsSearch(e.target.value)
                            setSourceFieldsPage(1)
                          }}
                          allowClear
                        />
                      </div>

                      {renameFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                        >
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
                              showSearch
                              optionFilterProp="children"
                              size="large"
                              dropdownRender={(menu) => (
                                <div>
                                  {menu}
                                  {filteredSourceFields.length > fieldsPerPage && (
                                    <div className="p-2 border-t flex justify-center">
                                      <Pagination
                                        current={sourceFieldsPage}
                                        pageSize={fieldsPerPage}
                                        total={filteredSourceFields.length}
                                        onChange={setSourceFieldsPage}
                                        size="small"
                                        showSizeChanger={false}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            >
                              {paginatedSourceFields.map((f) => (
                                <Option key={f.id} value={f.name}>
                                  <div className="flex items-center">
                                    <span>{f.name}</span>
                                    <Tag color={typeColors[f.type]} style={{ marginLeft: 8, borderRadius: "10px" }}>
                                      {f.type}
                                    </Tag>
                                    {f.isRequired && <Badge status="error" text="Required" className="ml-2" />}
                                  </div>
                                </Option>
                              ))}
                            </Select>
                          </div>

                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            <SwapOutlined className="text-gray-400" />
                          </div>

                          <div className="flex-1">
                            <Input
                              placeholder="New field name"
                              value={field.newName}
                              onChange={(e) => {
                                const updatedFields = [...renameFields]
                                updatedFields[index].newName = e.target.value
                                setRenameFields(updatedFields)
                              }}
                              size="large"
                            />
                          </div>

                          {renameFields.length > 1 && (
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                setRenameFields(renameFields.filter((f) => f.id !== field.id))
                              }}
                              className="text-red-500 hover:bg-red-50 rounded-full"
                              size="large"
                            />
                          )}
                        </div>
                      ))}

                      <div className="flex justify-between">
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={addRenameField}
                          size="large"
                          className="border-blue-400 text-blue-500 hover:border-blue-500 hover:text-blue-600"
                        >
                          Add Field to Rename
                        </Button>

                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          icon={<CloudSyncOutlined />}
                          loading={isRenaming}
                          disabled={
                            !sourceUrl || !sourceToken || !renameFields.every((f) => f.currentName && f.newName)
                          }
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                        >
                          Apply Renames
                        </Button>
                      </div>
                    </form>
                  )}

                  {renameResult && (
                    <Alert
                      message="Rename Operation Successful"
                      description={renameResult.message}
                      type="success"
                      showIcon
                      className="mt-6"
                    />
                  )}
                </div>
              </TabPane>

              <TabPane tab="CSV Fields" key="csv">
                <div className="space-y-6">
                  {renderAuthenticationFields("source")}

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File with Rename Mappings
                    </label>
                    <Upload
                      name="file"
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                      onChange={handleCsvUpload}
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        block
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
                      >
                        Click to Upload CSV
                      </Button>
                    </Upload>
                    <div className="mt-2 text-xs text-gray-500">
                      <InfoCircleOutlined className="mr-1" />
                      CSV should have columns: source, current_field_name, new_field_name
                    </div>
                  </div>

                  <Divider>
                    <Space>
                      <SwapOutlined />
                      <span>Manual Rename Entries</span>
                    </Space>
                  </Divider>

                  {csvRenameFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-3 gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <Select
                        placeholder="Select source"
                        value={field.source || undefined}
                        onChange={(value) => {
                          const updatedFields = [...csvRenameFields]
                          updatedFields[index].source = value
                          setCsvRenameFields(updatedFields)
                        }}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                      >
                        {sourceObjects.map((object) => (
                          <Option key={object.id} value={object.name}>
                            {object.name}
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
                        size="large"
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
                          size="large"
                        />

                        {csvRenameFields.length > 1 && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setCsvRenameFields(csvRenameFields.filter((f) => f.id !== field.id))
                            }}
                            className="text-red-500 hover:bg-red-50 rounded-full"
                            size="large"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addCsvRenameField}
                      size="large"
                      className="border-blue-400 text-blue-500 hover:border-blue-500 hover:text-blue-600"
                    >
                      Add Manual Entry
                    </Button>

                    <Button
                      type="primary"
                      size="large"
                      icon={<CloudSyncOutlined />}
                      disabled={
                        !sourceUrl ||
                        !sourceToken ||
                        !csvRenameFields.every((f) => f.source && f.currentName && f.newName)
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
                    >
                      Apply Renames
                    </Button>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </TabPane>

          <TabPane
            tab={
              <span className="px-1">
                <DeleteOutlined /> Deletion Fields
              </span>
            }
            key="3"
          >
            <div className="space-y-6">
              {renderAuthenticationFields("source")}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Object</label>
                <Select
                  placeholder="Select source object"
                  className="w-full"
                  onChange={(value) => setDeleteObjectSelection(value)}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.props.children[0].props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  loading={isLoadingSourceObjects}
                  disabled={isLoadingSourceObjects || sourceObjects.length === 0}
                >
                  {sourceObjects.map((object) => (
                    <Option key={object.id} value={object.name}>
                      <div className="flex flex-col">
                        <span>{object.name}</span>
                        {object.description && (
                          <Text type="secondary" className="text-xs">
                            {object.description}
                          </Text>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
                {isLoadingDeleteFields && (
                  <div className="mt-2">
                    <Spin size="small" /> <Text className="ml-2 text-xs">Loading fields...</Text>
                  </div>
                )}
              </div>

              {isLoadingDeleteFields ? (
                <div className="py-8">
                  <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4 text-gray-500">Loading fields...</div>
                  </div>
                </div>
              ) : deleteFields.length > 0 ? (
                renderDeleteFieldsSection()
              ) : deleteObjectSelection ? (
                <Empty description="No fields available for this object" />
              ) : (
                <Empty description="Select a source object to view fields" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {renderFieldSelectionModal()}
      {renderResultDrawer()}

      <style jsx global>{`
        .hover-highlight-table .ant-table-tbody > tr:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
          background-color: #f0f7ff;
          border-color: #d1e9ff;
        }
        
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
          border-radius: 6px 6px 0 0;
        }
        
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #f0f7ff;
        }
        
        .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #4f46e5;
          border-color: #4f46e5;
        }
      `}</style>
    </div>
  )
}

export default FieldsMigration
