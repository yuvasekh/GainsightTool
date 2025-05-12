"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Code,
  Database,
  HelpCircle,
  Key,
  Link,
  Lock,
  Mail,
  Plus,
  Save,
  Settings,
  Shield,
  Tag,
  Type,
} from "lucide-react"

const dataTypes = [
  {
    value: "text",
    label: "Text",
    icon: <Type className="h-5 w-5" />,
    description: "Alphanumeric text up to 255 characters",
    color: "bg-blue-50 text-blue-600",
  },
  {
    value: "number",
    label: "Number",
    icon: <Code className="h-5 w-5" />,
    description: "Numeric values without decimal places",
    color: "bg-purple-50 text-purple-600",
  },
  {
    value: "date",
    label: "Date",
    icon: <Calendar className="h-5 w-5" />,
    description: "Date values with optional time component",
    color: "bg-amber-50 text-amber-600",
  },
  {
    value: "boolean",
    label: "Boolean",
    icon: <Check className="h-5 w-5" />,
    description: "True/false values",
    color: "bg-green-50 text-green-600",
  },
  {
    value: "email",
    label: "Email",
    icon: <Mail className="h-5 w-5" />,
    description: "Email address format",
    color: "bg-rose-50 text-rose-600",
  },
  {
    value: "url",
    label: "URL",
    icon: <Link className="h-5 w-5" />,
    description: "Web address format",
    color: "bg-sky-50 text-sky-600",
  },
  {
    value: "lookup",
    label: "Lookup",
    icon: <Database className="h-5 w-5" />,
    description: "Reference to records in another object",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    value: "picklist",
    label: "Picklist",
    icon: <Tag className="h-5 w-5" />,
    description: "Selection from predefined options",
    color: "bg-teal-50 text-teal-600",
  },
]

const mappingOptions = [
  { id: "id", label: "ID", description: "Unique identifier" },
  { id: "name", label: "Name", description: "Display name" },
  { id: "title", label: "Title", description: "Title field" },
]

const objectOptions = [
  { id: "user", label: "User", icon: <Database className="h-4 w-4" /> },
  { id: "account", label: "Account", icon: <Database className="h-4 w-4" /> },
  { id: "contact", label: "Contact", icon: <Database className="h-4 w-4" /> },
]

const fieldOptions = [
  { id: "gsid", label: "GSID", icon: <Key className="h-4 w-4" /> },
  { id: "name", label: "Name", icon: <Key className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Key className="h-4 w-4" /> },
]

const deleteOptions = [
  { id: "none", label: "None", description: "No action" },
  { id: "cascade", label: "Cascade", description: "Delete this record" },
  { id: "restrict", label: "Restrict", description: "Prevent deletion" },
  { id: "nullify", label: "Nullify", description: "Set to null" },
]

export default function FieldConfiguration() {
  const [fieldName, setFieldName] = useState("Assignee_ID")
  const [dataType, setDataType] = useState("text")
  const [description, setDescription] = useState("")
  const [isMandatory, setIsMandatory] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [mappingOption, setMappingOption] = useState("")
  const [selectedObject, setSelectedObject] = useState("user")
  const [selectedField, setSelectedField] = useState("gsid")
  const [onDeleteOption, setOnDeleteOption] = useState("none")
  const [activeSection, setActiveSection] = useState("basic")

  const selectedDataType = dataTypes.find((type) => type.value === dataType)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-8 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 bg-white shadow-sm hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Field Configuration</h1>
            <p className="text-slate-500">Configure field properties and relationships</p>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "basic", label: "Basic Information", icon: <Settings className="h-4 w-4" /> },
            { id: "advanced", label: "Advanced Options", icon: <Database className="h-4 w-4" /> },
            { id: "security", label: "Security Settings", icon: <Lock className="h-4 w-4" /> },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSection === section.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Basic Information Section */}
          {activeSection === "basic" && (
            <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">Basic Information</h2>
                <Badge className="bg-emerald-50 text-emerald-700 border-0 px-2.5 py-1">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Custom Field
                </Badge>
              </div>

              <div className="space-y-8">
                {/* Field Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="fieldName" className="text-sm font-medium text-slate-700">
                      Field Name
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm bg-slate-900 text-slate-50">
                          <p className="text-sm">
                            Enter a unique name for this field. This will be used in API calls and database references.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="fieldName"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className="flex-1 focus-visible:ring-slate-400 border-slate-300"
                    />
                    <div className="px-3 flex items-center rounded-md bg-slate-100 text-slate-500 text-sm font-mono">
                      _gc
                    </div>
                  </div>
                  {fieldName.includes(" ") && (
                    <p className="text-xs flex items-center text-amber-600 mt-1">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      Field names should not contain spaces
                    </p>
                  )}
                </div>

                {/* Data Type - Visual Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700">Data Type</Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {dataTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setDataType(type.value)}
                        className={`flex flex-col items-start p-4 rounded-lg border transition-all ${
                          dataType === type.value
                            ? "border-slate-800 bg-slate-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`rounded-full p-2 mb-2 ${type.color}`}>{type.icon}</div>
                        <div className="text-left">
                          <div className="font-medium text-slate-800">{type.label}</div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{type.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief description of the field's purpose and usage."
                    className="min-h-24 resize-y focus-visible:ring-slate-400 border-slate-300"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">{description.length}/500 characters</p>
                    <p className="text-xs text-slate-500">Supports markdown formatting</p>
                  </div>
                </div>

                {/* Field Properties */}
                <div className="space-y-5 bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-700 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-slate-500" />
                    Field Properties
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsMandatory(!isMandatory)}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isMandatory
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-slate-800">Required Field</div>
                        <div className="text-xs text-slate-500 mt-1">Users will be required to provide a value</div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isMandatory ? "bg-slate-800 text-white" : "bg-slate-200"
                        }`}
                      >
                        {isMandatory && <Check className="h-4 w-4" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsHidden(!isHidden)}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isHidden
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium text-slate-800">Hidden Field</div>
                        <div className="text-xs text-slate-500 mt-1">Field will be hidden from views and reports</div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isHidden ? "bg-slate-800 text-white" : "bg-slate-200"
                        }`}
                      >
                        {isHidden && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Options Section */}
          {activeSection === "advanced" && (
            <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden p-6 space-y-8">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                  <Database className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Advanced Options</h2>
                  <p className="text-sm text-slate-500">Configure relationships and validation rules</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Mapping Section */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
                    <Database className="h-4 w-4 text-slate-500 mr-2" />
                    <h3 className="text-sm font-medium text-slate-700">Field Mapping</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600">
                      Map this field to standard fields to enable hyperlinks and custom search in Reports and
                      Dashboards.
                    </p>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Map To</Label>
                      <div className="flex flex-wrap gap-3">
                        {mappingOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setMappingOption(option.id)}
                            className={`group relative overflow-hidden rounded-lg border transition-all ${
                              mappingOption === option.id
                                ? "border-slate-800 bg-slate-800 text-white"
                                : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                            }`}
                          >
                            <div className="px-4 py-3">
                              <div className="font-medium">{option.label}</div>
                              <div
                                className={`text-xs mt-0.5 ${
                                  mappingOption === option.id ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                {option.description}
                              </div>
                            </div>
                            {mappingOption === option.id && (
                              <div className="absolute top-0 right-0 p-1.5">
                                <div className="bg-white rounded-full p-0.5">
                                  <Check className="h-3 w-3 text-slate-800" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lookup Relationship */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
                    <Key className="h-4 w-4 text-slate-500 mr-2" />
                    <h3 className="text-sm font-medium text-slate-700">Lookup Relationship</h3>
                  </div>
                  <div className="p-5 space-y-6">
                    <p className="text-sm text-slate-600">
                      Create a lookup from one object to another so that Rules and Reports built on one object can
                      access fields from the related object.
                    </p>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">Object</Label>
                      <div className="flex flex-wrap gap-2">
                        {objectOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedObject(option.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                              selectedObject === option.id
                                ? "bg-slate-800 text-white"
                                : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className={selectedObject === option.id ? "text-white" : "text-slate-500"}>
                              {option.icon}
                            </span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">Field</Label>
                      <div className="flex flex-wrap gap-2">
                        {fieldOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setSelectedField(option.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                              selectedField === option.id
                                ? "bg-slate-800 text-white"
                                : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className={selectedField === option.id ? "text-white" : "text-slate-500"}>
                              {option.icon}
                            </span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-slate-700">On Delete</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {deleteOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setOnDeleteOption(option.id)}
                            className={`flex flex-col items-start p-3 rounded-md transition-all ${
                              onDeleteOption === option.id
                                ? "bg-slate-800 text-white"
                                : "bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div
                              className={`text-xs mt-1 ${
                                onDeleteOption === option.id ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Rules */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
                    <Shield className="h-4 w-4 text-slate-500 mr-2" />
                    <h3 className="text-sm font-medium text-slate-700">Validation Rules</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600">
                      Define validation rules to ensure data quality and consistency.
                    </p>

                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-md p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                        <Shield className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 mb-3">No validation rules defined yet</p>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Validation Rule</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Section */}
          {activeSection === "security" && (
            <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden p-6 space-y-8">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                  <Lock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Security Settings</h2>
                  <p className="text-sm text-slate-500">Control access and permissions for this field</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
                    <Lock className="h-4 w-4 text-slate-500 mr-2" />
                    <h3 className="text-sm font-medium text-slate-700">Field-Level Security</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600">Control which user profiles can see and edit this field.</p>

                    <div className="space-y-4">
                      {[
                        { name: "Administrator", visible: true, editable: true },
                        { name: "Standard User", visible: true, editable: false },
                        { name: "Read Only", visible: false, editable: false },
                      ].map((profile) => (
                        <div key={profile.name} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="font-medium text-slate-800">{profile.name}</div>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                  profile.visible
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                <span>Visible</span>
                                {profile.visible ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              </button>

                              <button
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                                  profile.editable
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                <span>Editable</span>
                                {profile.editable ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" className="px-4">
              Cancel
            </Button>
            <Button className="px-4 gap-1.5 bg-slate-900 hover:bg-slate-800">
              <Save className="h-4 w-4 mr-1" />
              Save Field
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
