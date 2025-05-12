"use client"

import { useState, useRef, useEffect } from "react"
import {
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
  Check,
  Trash2,
  Plus,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  Clock,
  List,
  Mail,
  Percent,
  DollarSign,
  Key,
  FileText,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Map data types to their corresponding icons
const dataTypeIcons = {
  String: <Type className="h-4 w-4" />,
  Number: <Hash className="h-4 w-4" />,
  Boolean: <ToggleLeft className="h-4 w-4" />,
  Date: <Calendar className="h-4 w-4" />,
  DateTime: <Clock className="h-4 w-4" />,
  "Dropdown List": <List className="h-4 w-4" />,
  Email: <Mail className="h-4 w-4" />,
  Percentage: <Percent className="h-4 w-4" />,
  Currency: <DollarSign className="h-4 w-4" />,
  "GS ID": <Key className="h-4 w-4" />,
}

export default function ObjectEditor() {
  const [activeTab, setActiveTab] = useState("fields")
  const [tabState, setTabState] = useState({
    objectInfo: "completed",
    fields: "current",
    settings: "pending",
  })

  const [fields, setFields] = useState([
    {
      id: "field_1",
      name: "Laxman_final_test",
      displayName: "Laxman final test",
      type: "String",
      defaultValue: "",
      description: "",
      isExpanded: false,
    },
    {
      id: "field_2",
      name: "Laxman_new",
      displayName: "Laxman new",
      type: "String",
      defaultValue: "",
      description: "",
      isExpanded: true,
    },
  ])

  const [currentField, setCurrentField] = useState({
    id: "",
    name: "",
    displayName: "",
    type: "String",
    defaultValue: "",
    description: "",
    isExpanded: true,
  })

  const [advancedOptionsFields, setAdvancedOptionsFields] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [draggedType, setDraggedType] = useState(null)

  const dropAreaRef = useRef(null)

  const dataTypes = [
    "String",
    "Number",
    "Boolean",
    "Date",
    "DateTime",
    "Dropdown List",
    "Email",
    "Percentage",
    "Currency",
    "GS ID",
  ]

  // Track mouse position for custom drag visual
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isDragging])

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("dataType", type)
    setIsDragging(true)
    setDraggedType(type)

    // Create a ghost image that's invisible
    const ghostElement = document.createElement("div")
    ghostElement.style.position = "absolute"
    ghostElement.style.top = "-1000px"
    document.body.appendChild(ghostElement)
    e.dataTransfer.setDragImage(ghostElement, 0, 0)

    setTimeout(() => {
      document.body.removeChild(ghostElement)
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedType(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add("border-primary", "bg-blue-50", "border-blue-300")
    }
  }

  const handleDragLeave = () => {
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("border-primary", "bg-blue-50", "border-blue-300")
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove("border-primary", "bg-blue-50", "border-blue-300")
    }

    const type = e.dataTransfer.getData("dataType")
    setIsDragging(false)
    setDraggedType(null)

    addNewField(type)
  }

  const addNewField = (type) => {
    setCurrentField({
      id: `field_${Date.now()}`,
      name: "",
      displayName: "",
      type,
      defaultValue: "",
      description: "",
      isExpanded: true,
    })
  }

  const handleAddField = () => {
    if (currentField.displayName.trim() === "") return

    const fieldName = currentField.displayName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")

    const newField = {
      ...currentField,
      name: fieldName,
    }

    setFields([...fields, newField])
    setCurrentField({
      id: "",
      name: "",
      displayName: "",
      type: "String",
      defaultValue: "",
      description: "",
      isExpanded: true,
    })
  }

  const handleDeleteField = (id, e) => {
    if (e) {
      e.stopPropagation()
    }
    setFields(fields.filter((field) => field.id !== id))
  }

  const toggleFieldExpansion = (id) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, isExpanded: !field.isExpanded } : field)))
  }

  const expandAll = () => {
    setFields(fields.map((field) => ({ ...field, isExpanded: true })))
  }

  const collapseAll = () => {
    setFields(fields.map((field) => ({ ...field, isExpanded: false })))
  }

  const filteredFields = fields.filter(
    (field) =>
      field.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-white   w-[80vw] mx-auto rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-semibold">Edit Object</h1>
        {/* <button className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button> */}
      </div>

      {/* Tabs */}
      {/* <div className="flex border-b">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 font-medium",
            tabState.objectInfo === "completed"
              ? "border-green-500 text-green-600"
              : tabState.objectInfo === "current"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500",
          )}
        >
          {tabState.objectInfo === "completed" ? (
            <div className="bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full h-6 w-6 flex items-center justify-center text-sm",
                tabState.objectInfo === "current" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
              )}
            >
              1
            </div>
          )}
          <span>Object Information</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 font-medium",
            tabState.fields === "completed"
              ? "border-green-500 text-green-600"
              : tabState.fields === "current"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500",
          )}
        >
          {tabState.fields === "completed" ? (
            <div className="bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full h-6 w-6 flex items-center justify-center text-sm",
                tabState.fields === "current" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
              )}
            >
              2
            </div>
          )}
          <span>Fields</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 border-b-2 font-medium",
            tabState.settings === "completed"
              ? "border-green-500 text-green-600"
              : tabState.settings === "current"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500",
          )}
        >
          {tabState.settings === "completed" ? (
            <div className="bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full h-6 w-6 flex items-center justify-center text-sm",
                tabState.settings === "current" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600",
              )}
            >
              3
            </div>
          )}
          <span>Settings</span>
        </div>
      </div> */}

      {/* Main content */}
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-[450px] border-r p-4 h-[calc(100vh-150px)] overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Data Type</h2>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop the required data type to add a field to the object.
            </p>
          </div>

          <div className="space-y-2">
            {dataTypes.map((type) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 group transition-colors"
              >
                <div
                  className="flex items-center gap-2 cursor-move flex-1"
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center justify-center text-gray-500">
                    <div className="grid w-4 h-4">
                      <div className="row-start-1 col-start-1 w-1 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="row-start-1 col-start-2 w-1 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="row-start-2 col-start-1 w-1 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="row-start-2 col-start-2 w-1 h-1 bg-gray-400 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{dataTypeIcons[type]}</span>
                    <span>{type}</span>
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                  onClick={() => addNewField(type)}
                  title={`Add ${type} field`}
                >
                  <Plus className="h-4 w-4 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 p-4 h-[calc(100vh-150px)] overflow-y-auto">
          <div
            className="border border-dashed rounded-lg p-4 mb-6 transition-all duration-200"
            ref={dropAreaRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Fields</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9 pr-4 py-2 w-[300px]"
                    placeholder="Search by Field Display Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  onClick={expandAll}
                >
                  <ChevronDown className="h-3 w-3" />
                  <span>Expand All</span>
                </button>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  onClick={collapseAll}
                >
                  <ChevronUp className="h-3 w-3" />
                  <span>Collapse All</span>
                </button>
              </div>
            </div>

            {/* New field form */}
            {currentField.id && (
              <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-100 text-blue-700">{dataTypeIcons[currentField.type]}</span>
                    <span className="font-medium text-blue-700">New {currentField.type} Field</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() =>
                      setCurrentField({
                        id: "",
                        name: "",
                        displayName: "",
                        type: "String",
                        defaultValue: "",
                        description: "",
                        isExpanded: true,
                      })
                    }
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <Input
                    placeholder="Enter field display name."
                    value={currentField.displayName}
                    onChange={(e) => setCurrentField({ ...currentField, displayName: e.target.value })}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-500">Provide the field details to proceed.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label className="text-sm font-medium">Field Name</label>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex">
                      <Input
                        placeholder="Enter Field Name"
                        value={currentField.displayName
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/[^a-z0-9_]/g, "")}
                        readOnly
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 rounded-r-md px-2 flex items-center text-gray-600">
                        _gc
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Value</label>
                    <Input
                      placeholder="Enter default value"
                      value={currentField.defaultValue}
                      onChange={(e) => setCurrentField({ ...currentField, defaultValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Provide a brief description of the field."
                    value={currentField.description}
                    onChange={(e) => setCurrentField({ ...currentField, description: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    onClick={() => {
                      const newField = { ...currentField, id: currentField.id || `temp_${Date.now()}` }
                      setCurrentField(newField)
                      setAdvancedOptionsFields({
                        ...advancedOptionsFields,
                        [newField.id]: !advancedOptionsFields[newField.id],
                      })
                    }}
                  >
                    {advancedOptionsFields[currentField.id || ""] ? (
                      <>
                        <ChevronUp className="h-3 w-3" />
                        <span>Hide Advanced Options</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3" />
                        <span>Show Advanced Options</span>
                      </>
                    )}
                  </button>
                </div>

                {advancedOptionsFields[currentField.id || ""] && (
                  <div className="border rounded-md p-4 mb-4 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-4">Advanced Options</h3>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="mandatory-field"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="mandatory-field" className="ml-2 block text-sm text-gray-700">
                          Mark it as a mandatory field.
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hide-field"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="hide-field" className="ml-2 block text-sm text-gray-700">
                          Hide this field in other product areas.
                        </label>
                      </div>

                      <div className="pt-2 border-t">
                        <h4 className="font-medium text-gray-800 mb-2">Mapping</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          To activate hyperlink and custom search in Reports and Dashboards, map the Standard fields in
                          the object.
                        </p>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Map To</label>
                          <div className="relative">
                            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                              <option value="">Select Value</option>
                              <option value="name">Name</option>
                              <option value="id">ID</option>
                              <option value="title">Title</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <h4 className="font-medium text-gray-800 mb-2">Lookup</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Create a lookup from one object to another so that Rules and Reports built on one object can
                          access fields from the related object.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                            <div className="relative">
                              <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                <option value="user">User</option>
                                <option value="account">Account</option>
                                <option value="contact">Contact</option>
                                <option value="product">Product</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                            <div className="relative">
                              <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                <option value="gsid">GSID</option>
                                <option value="id">ID</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">On Delete</label>
                          <div className="relative">
                            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                              <option value="none">None</option>
                              <option value="cascade">Cascade</option>
                              <option value="restrict">Restrict</option>
                              <option value="nullify">Nullify</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleAddField} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Field
                  </Button>
                </div>
              </div>
            )}

            {/* Existing fields */}
            {filteredFields.map((field) => (
              <div key={field.id} className="border rounded-lg mb-4 shadow-sm transition-all hover:shadow">
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleFieldExpansion(field.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-green-100 text-green-700">{dataTypeIcons[field.type]}</span>
                      <span className="font-medium">{field.name}</span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                      {dataTypeIcons[field.type]}
                      <span>{field.type}</span>
                    </div>
                    <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">Custom</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => handleDeleteField(field.id, e)}
                      title="Delete field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button>
                      {field.isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {field.isExpanded && (
                  <div className="p-4 border-t">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Field Name</label>
                        <div className="flex">
                          <Input value={field.name} readOnly className="rounded-r-none" />
                          <div className="bg-gray-100 border border-l-0 rounded-r-md px-2 flex items-center text-gray-600">
                            _gc
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Default Value</label>
                        <Input value={field.defaultValue} readOnly />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea value={field.description} readOnly />
                    </div>

                    <div className="mt-4">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAdvancedOptionsFields({
                            ...advancedOptionsFields,
                            [field.id]: !advancedOptionsFields[field.id],
                          })
                        }}
                      >
                        {advancedOptionsFields[field.id] ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            <span>Hide Advanced Options</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            <span>Show Advanced Options</span>
                          </>
                        )}
                      </button>
                    </div>

                    {advancedOptionsFields[field.id] && (
                      <div className="border rounded-md p-4 mt-4 bg-gray-50">
                        <h3 className="font-medium text-gray-800 mb-4">Advanced Options</h3>

                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`mandatory-field-${field.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`mandatory-field-${field.id}`} className="ml-2 block text-sm text-gray-700">
                              Mark it as a mandatory field.
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`hide-field-${field.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`hide-field-${field.id}`} className="ml-2 block text-sm text-gray-700">
                              Hide this field in other product areas.
                            </label>
                          </div>

                          <div className="pt-2 border-t">
                            <h4 className="font-medium text-gray-800 mb-2">Mapping</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              To activate hyperlink and custom search in Reports and Dashboards, map the Standard fields
                              in the object.
                            </p>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Map To</label>
                              <div className="relative">
                                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                  <option value="">Select Value</option>
                                  <option value="name">Name</option>
                                  <option value="id">ID</option>
                                  <option value="title">Title</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <h4 className="font-medium text-gray-800 mb-2">Lookup</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Create a lookup from one object to another so that Rules and Reports built on one object
                              can access fields from the related object.
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Object</label>
                                <div className="relative">
                                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                    <option value="user">User</option>
                                    <option value="account">Account</option>
                                    <option value="contact">Contact</option>
                                    <option value="product">Product</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                                <div className="relative">
                                  <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                    <option value="gsid">GSID</option>
                                    <option value="id">ID</option>
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">On Delete</label>
                              <div className="relative">
                                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                                  <option value="none">None</option>
                                  <option value="cascade">Cascade</option>
                                  <option value="restrict">Restrict</option>
                                  <option value="nullify">Nullify</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredFields.length === 0 && !currentField.id && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">Drag and drop a data type from the left panel to add a new field.</p>
                <p className="text-gray-400 text-sm">Or click the plus icon next to a data type to add it directly.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-between">
        <Button variant="outline" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Review changes
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="default" className="flex items-center gap-1">
            Save and Close
          </Button>
          <Button variant="default" className="flex items-center gap-1">
            Save and Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Custom drag visual */}
      {isDragging && draggedType && (
        <div
          className="fixed pointer-events-none z-50 bg-white border shadow-md rounded-md p-2 flex items-center gap-2"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y + 15,
            transform: "translate(0, 0)",
            opacity: 0.9,
          }}
        >
          <span className="p-1 rounded-md bg-blue-100 text-blue-700">{dataTypeIcons[draggedType]}</span>
          <span>{draggedType}</span>
        </div>
      )}
    </div>
  )
}
