# 代码生成器

## 概述

代码生成器是一个旨在通过根据您的数据库结构自动创建各种模块的样板代码来加速开发的工具。它提供了一个用户友好的界面，用于选择生成模式、数据库表、自定义用于 UI 生成的字段属性以及指定输出选项。

这有助于快速搭建 CRUD（创建、读取、更新、删除）操作、视图、服务等，并支持单表、主子表及树状结构等多种复杂场景。

## 访问代码生成器

代码生成器可以从主导航侧边栏访问，通常位于“开发工具”或“系统”部分（注意：确切位置可能因系统配置而异）。请查找名为“代码生成器”的菜单项。

*（您需要适当的权限才能访问此功能。）*

## 如何使用

使用代码生成器涉及以下步骤：

### 1. 选择生成模式

在页面顶部，首先选择您希望的代码生成模式：

- **单表 (Single Table)**：为单个独立的数据库表生成代码。
- **主子表 (Master-Detail)**：为具有一对一或一对多关系的主表及其一个或多个子表生成代码。
- **树状表 (Tree Structure)**：为具有层级或自引用关系的表（如分类、组织结构）生成代码。

根据您选择的模式，后续的配置选项会有所不同。

### 2. 配置表及选项 (根据模式)

#### A. 单表模式 (Single Table Mode)

选择此模式后，按以下步骤操作：

- **选择数据库表 (Select Database Table)**：
    - **表(Table)**：使用下拉菜单选择您要为其生成代码的数据库表。
    - **刷新表(Refresh Tables)**：单击此按钮以从数据库中获取最新的表列表。
- **配置生成选项 (Configure Generation Options)**：
    - **模块名称(Module Name)**：指定生成模块的名称。默认为表名的帕斯卡命名法（PascalCase）版本。
    - **页面标题(Page Title)**：定义用于生成的页面或视图的标题。默认为表名。
    - **输出路径(Output Path) (可选)**：指定特定的输出目录。
- **字段配置 (Fields Configuration)**：
    (与之前文档相同：字段名, 数据类型, 显示名称, 列表中显示, 可搜索, 可排序, 是否必填, 控件类型)

#### B. 主子表模式 (Master-Detail Mode)

选择此模式后，您需要分别配置主表和子表：

- **配置主表 (Configure Master Table)**：
    - **选择主表(Select Master Table)**：从下拉列表中选择主表。
    - **主表模块名称/页面标题/输出路径**: 为主表设置这些选项。
    - **主表字段配置**: 配置主表的字段属性，方式与单表模式类似。
- **配置子表 (Configure Detail Tables)**：
    - 点击 **“添加子表 (Add Detail Table)”** 按钮来添加一个或多个子表。
    - 对于每个子表，您需要配置：
        - **选择子表(Select Detail Table)**：从下拉列表中选择子表。
        - **关联主表外键(Foreign Key to Master)**：从下拉列表中选择子表中用于关联到主表主键的外键字段。此列表通常会基于数据库元数据自动填充可能的选项。
        - **子表模块名称/页面标题**: 为子表设置这些选项。
        - **子表字段配置**: 单独配置每个子表的字段属性。
    - 您可以随时点击 **“移除子表 (Remove Detail Table)”** 来删除不需要的子表。

#### C. 树状表模式 (Tree Structure Mode)

选择此模式后，进行如下配置：

- **选择数据库表 (Select Database Table for Tree)**：选择将用作树结构基础的表。
- **配置常规选项**:
    - **模块名称/页面标题/输出路径**: 为树状结构模块设置这些选项。
- **树结构配置 (Tree Configuration)**：
    - **ID 字段 (ID Field)**：从下拉列表中选择表中的主键字段，作为树节点的唯一标识。
    - **父 ID 字段 (Parent ID Field)**：选择表中表示父级记录ID的字段。
    - **显示名称字段 (Display Name Field)**：选择表中用于在树状结构中显示节点名称或标签的字段。
    - **根节点父ID值 (Root Node Parent ID Value) (可选)**：如果树的根节点是通过特定的父ID值（如0或null）来确定的，可以在此指定。
- **字段配置 (Fields Configuration)**：配置所选基础表的字段属性，方式与单表模式类似。


### 3. 操作 (Actions)

- **生成代码(Generate Code)**：配置完所有选项后，单击此按钮开始代码生成过程。
- **重置(Reset)**：单击此按钮以清除表单上的所有选择和配置，并将模式重置为“单表”。

### 4. 生成日志 (Generation Log)

(与之前文档相同：显示进度、文件名、错误或警告)

## API 约定

代码生成器前端通过以下 API 端点与后端交互：

### 获取数据库表

- **端点(Endpoint)**：`GET /api/codegenerator/tables`
- **目的(Purpose)**：检索可用数据库表及其列信息。
- **成功响应 (200 OK) (扩展建议)**：
  为了更好地支持主子表模式下的外键选择，建议在每个列的定义中包含外键信息。
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
            "dataType": "string",
            "isPrimaryKey": "boolean",
            "isNullable": "boolean",
            "maxLength": "number", // 如果适用
            "isForeignKey": "boolean",         // 新增建议：是否为外键
            "referencedTable": "string" | null, // 新增建议：引用的主表名称
            "referencedColumn": "string" | null // 新增建议：引用的主表列名称
          }
          // ... 更多列对象
        ]
      }
      // ... 更多表对象
    ]
  }
  ```
- **错误响应**：(与之前文档相同)

### 生成代码

- **端点(Endpoint)**：`POST /api/codegenerator/generate`
- **目的(Purpose)**：根据提供的配置启动代码生成过程。
- **请求负载 (JSON)**：
  ```json
  {
    "generationMode": "'single' | 'masterDetail' | 'tree'", // 新增：生成模式

    // --- 当 generationMode === "single" ---
    "tableName": "string",
    "moduleName": "string",
    "outputPath": "string", // 可选
    "pageTitle": "string",
    "fields": [ /* ...字段配置... */ ],
    "options": { /* ...options配置... */ },

    // --- 当 generationMode === "masterDetail" ---
    "masterTable": {
      "tableName": "string",
      "moduleName": "string",
      "outputPath": "string", // 可选
      "pageTitle": "string",
      "fields": [ /* ...主表字段配置... */ ],
      "options": { /* ...主表options... */ }
    },
    "detailTables": [
      {
        "tableName": "string",
        "moduleName": "string",
        "pageTitle": "string",
        "foreignKeyToMaster": "string", // 子表中关联到主表的外键字段名
        "relationName": "string", // 可选，定义关系名称
        "fields": [ /* ...子表字段配置... */ ],
        "options": { /* ...子表options... */ }
      }
      // ...更多子表对象
    ],

    // --- 当 generationMode === "tree" ---
    "tableName": "string", // 树结构基于的表
    "moduleName": "string",
    "outputPath": "string", // 可选
    "pageTitle": "string",
    "fields": [ /* ...字段配置... */ ],
    "treeConfig": {
      "idField": "string",
      "parentIdField": "string",
      "nameField": "string",
      "rootValue": "any" // 可选
    },
    "options": { /* ...options配置... */ }
  }
  ```
- **成功响应 (200 OK)**：(与之前文档相同)
- **错误响应**：(与之前文档相同)

## 当前限制

- (在此处添加任何已知的限制，例如：特定的数据库支持、模板自定义选项等)
- 本文档主要涵盖前端界面。后端实现细节可能会有所不同。
- 对于主子表模式，外键下拉列表的自动填充依赖于后端在 `GET /api/codegenerator/tables` 接口中提供准确的外键元数据。
