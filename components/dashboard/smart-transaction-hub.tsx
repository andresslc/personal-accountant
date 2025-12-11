"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Zap, FileText, Upload, AlertCircle } from "lucide-react"

export function SmartTransactionHub() {
  const [activeTab, setActiveTab] = useState("ai-agent")
  const [textInput, setTextInput] = useState("")
  const [manualForm, setManualForm] = useState({
    description: "",
    amount: "",
    category: "",
    liability: "",
    date: "",
    type: "expense",
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)

  const handleAnalyze = () => {
    console.log("[v0] Analyzing:", textInput)
    // AI analysis logic will go here
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Manual transaction:", manualForm)
    // Submit logic will go here
  }

  const handleCSVUpload = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setCsvFile(files[0])
    }
  }

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0])
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="ai-agent" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">AI Agent</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: AI Agent */}
        <TabsContent value="ai-agent" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-input">Describe your transaction (text or voice)</Label>
            <Textarea
              id="ai-input"
              placeholder="E.g., 'Spent $45 on groceries at Whole Foods' OR 'Paid $200 towards my Visa Card'"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-24 resize-none"
            />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Supports Debt Repayment
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!textInput.trim()}
          >
            <Zap className="w-4 h-4 mr-2" />
            Analyze Transaction
          </Button>
          <p className="text-sm text-muted-foreground">
            Our AI will automatically extract details like amount, category, and date from your description.
          </p>
        </TabsContent>

        {/* Tab 2: Manual Entry */}
        <TabsContent value="manual" className="space-y-4">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter transaction description"
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup
                  value={manualForm.type}
                  onValueChange={(value) => setManualForm({ ...manualForm, type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="type-expense" />
                    <Label htmlFor="type-expense" className="font-normal cursor-pointer">
                      Expense
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="type-income" />
                    <Label htmlFor="type-income" className="font-normal cursor-pointer">
                      Income
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debt-payment" id="type-debt-payment" />
                    <Label htmlFor="type-debt-payment" className="font-normal cursor-pointer">
                      Debt Payment
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {manualForm.type === "debt-payment" ? (
              <div className="space-y-2">
                <Label htmlFor="liability">Select Liability</Label>
                <Select
                  value={manualForm.liability}
                  onValueChange={(value) => setManualForm({ ...manualForm, liability: value })}
                >
                  <SelectTrigger id="liability">
                    <SelectValue placeholder="Select a liability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chase-sapphire">Chase Sapphire</SelectItem>
                    <SelectItem value="auto-loan">Auto Loan</SelectItem>
                    <SelectItem value="student-loans">Student Loans</SelectItem>
                    <SelectItem value="personal-loan">Personal Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={manualForm.category}
                  onValueChange={(value) => setManualForm({ ...manualForm, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className={`w-full ${
                manualForm.type === "debt-payment"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
              disabled={
                !manualForm.description ||
                !manualForm.amount ||
                (manualForm.type === "debt-payment" ? !manualForm.liability : !manualForm.category) ||
                !manualForm.date
              }
            >
              {manualForm.type === "debt-payment" ? "Record Debt Payment" : "Add Transaction"}
            </Button>
          </form>
        </TabsContent>

        {/* Tab 3: CSV Upload */}
        <TabsContent value="csv" className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCSVUpload}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <input type="file" accept=".csv" onChange={handleCSVChange} id="csv-upload" className="hidden" />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-foreground">Drag and drop your CSV file</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </label>
          </div>

          {csvFile && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground">File selected: {csvFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Size: {(csvFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          <Button className="w-full bg-primary hover:bg-primary/90" disabled={!csvFile}>
            <Upload className="w-4 h-4 mr-2" />
            Import Transactions
          </Button>

          <p className="text-sm text-muted-foreground">
            CSV should include columns: Date, Description, Amount, Category, Type
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
