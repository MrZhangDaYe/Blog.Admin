# 代码生成器

## 概述

代码生成器是一个旨在通过根据您的数据库结构自动创建各种模块的样板代码来加速开发的工具。它提供了一个用户友好的界面，用于选择数据库表、自定义用于 UI 生成的字段属性以及指定输出选项。

这有助于快速搭建 CRUD（创建、读取、更新、删除）操作、视图、服务等。

## 访问代码生成器

代码生成器可以从主导航侧边栏访问，通常位于“开发工具”或“系统”部分（注意：确切位置可能因系统配置而异）。请查找名为“代码生成器”的菜单项。

*（您需要适当的权限才能访问此功能。）*

## 如何使用

使用代码生成器涉及几个简单的步骤：

### 1. 选择数据库表

- **表(Table)**：使用下拉菜单选择您要为其生成代码的数据库表。
- **刷新表(Refresh Tables)**：单击此按钮以从数据库中获取最新的表列表。

### 2. 配置生成选项

选择表后，将出现配置部分：

- **模块名称(Module Name)**：指定生成模块的名称。这通常会影响生成的类名、文件夹名或路由前缀。（例如：`Products`、`UserDetails`）。默认为表名的帕斯卡命名法（PascalCase）版本。
- **页面标题(Page Title)**：定义用于生成的页面或视图的标题。默认为表名。
- **输出路径(Output Path) (可选)**：如果您需要指定特定的输出目录或后端配置中预定义路径的键，可以在此处输入。

#### 字段配置

表格将显示所选数据库表中的所有字段。您可以自定义如何在生成的代码中处理每个字段，特别是对于表单和列表等 UI 元素：

- **字段名(Field Name)**：数据库中字段的原始名称（只读）。
- **数据类型(Data Type)**：数据库中字段的原始数据类型（只读）。
- **显示名称(Display Name)**：此字段的用户友好名称，用于表单中的标签和表头（例如，“用户名”而不是“UserName”）。
- **列表中显示(Show in List)**：选中此项，则该字段将作为列显示在生成的列表视图或表格中。
- **可搜索(Searchable)**：选中此项，则该字段将包含在搜索/筛选功能中。
- **可排序(Sortable)**：选中此项，则生成的列表应能按此字段排序。
- **是否必填(Is Required)**：选中此项，则该字段将在生成的表单中标记为必填项，通常用于验证。
- **控件类型(Control Type)**：选择要为此字段生成的 HTML 表单控件的类型（例如：文本输入框、文本域、下拉选择框、日期选择器、数字输入框、复选框）。默认类型会根据数据类型推断。

### 3. 操作

- **生成代码(Generate Code)**：配置完所有选项后，单击此按钮开始代码生成过程。
- **重置(Reset)**：单击此按钮以清除表单上的所有选择和配置。

### 4. 生成日志

启动代码生成后，此部分将显示来自后端的实时日志。包括：
- 进度消息。
- 正在生成的文件的名称。
- 在此过程中遇到的任何错误或警告。

请仔细查看日志，以确保生成成功并识别任何问题。

## API 约定

代码生成器前端通过以下 API 端点与后端交互：

### 获取数据库表

- **端点(Endpoint)**：`GET /api/codegenerator/tables`
- **目的(Purpose)**：检索可用数据库表及其基本列信息的列表。
- **成功响应 (200 OK)**：
  ```json
  {
    "success": true,
    "tables": [
      {
        "name": "string", // 表名
        "schema": "string", // 可选：表模式
        "columns": [
          {
            "name": "string", // 列名
            "dataType": "string", // 例如："VARCHAR", "INT", "DATETIME"
            "isPrimaryKey": "boolean",
            "isNullable": "boolean",
            "maxLength": "number" // 如果适用
          }
          // ... 更多列对象
        ]
      }
      // ... 更多表对象
    ]
  }
  ```
- **错误响应 (例如：500 内部服务器错误)**：
  ```json
  {
    "success": false,
    "message": "获取数据库表时出错。"
  }
  ```

### 生成代码

- **端点(Endpoint)**：`POST /api/codegenerator/generate`
- **目的(Purpose)**：根据提供的配置启动代码生成过程。
- **请求负载 (JSON)**：
  ```json
  {
    "tableName": "string",
    "moduleName": "string",
    "outputPath": "string", // 可选
    "pageTitle": "string",
    "fields": [
      {
        "fieldName": "string",
        "dataType": "string",
        "displayName": "string",
        "showInList": "boolean",
        "searchable": "boolean",
        "sortable": "boolean",
        "isRequired": "boolean",
        "controlType": "string" // (例如："text", "textarea", "select")
      }
      // ... 更多字段对象
    ],
    "options": { // 可选：用于其他特定于生成器的设置
      "generateService": "boolean",
      "generateController": "boolean",
      "generateModels": "boolean",
      "overwriteExistingFiles": "boolean"
    }
  }
  ```
- **成功响应 (200 OK)**：
  ```json
  {
    "success": true,
    "message": "代码生成成功。",
    "logs": ["string"], // 日志消息数组
    "generatedFiles": ["string"] // 可选：生成的文件路径列表
  }
  ```
- **错误响应 (例如：400 错误请求, 500 内部服务器错误)**：
  ```json
  {
    "success": false,
    "message": "生成代码时出错。",
    "errors": [ // 可选：特定字段错误
      {
        "field": "string",
        "message": "string"
      }
    ],
    "logs": ["string"] // 错误发生前捕获的日志
  }
  ```

## 当前限制

- （在此处添加任何已知的限制，例如：特定的数据库支持、模板自定义选项等）
- 本文档主要涵盖前端界面。后端实现细节可能会有所不同。
