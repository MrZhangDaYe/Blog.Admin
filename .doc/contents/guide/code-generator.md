# Code Generator

## Overview

The Code Generator is a tool designed to accelerate development by automatically creating boilerplate code for various modules based on your database schema. It provides a user-friendly interface to select database tables, customize field properties for UI generation, and specify output options.

This can help in rapidly scaffolding CRUD (Create, Read, Update, Delete) operations, views, services, and more.

## Accessing the Code Generator

The Code Generator can be accessed from the main navigation sidebar, typically under a "Developer Tools" or "System" section (Note: The exact location might vary based on system configuration). Look for a menu item named "Code Generator".

*(You will need appropriate permissions to access this feature.)*

## How to Use

Using the Code Generator involves a few straightforward steps:

### 1. Select Database Table

- **Table**: Use the dropdown menu to select the database table for which you want to generate code.
- **Refresh Tables**: Click this button to fetch the latest list of tables from the database.

### 2. Configure Generation Options

Once a table is selected, a configuration section will appear:

- **Module Name**: Specify the name for the generated module. This often influences generated class names, folder names, or route prefixes. (e.g., `Products`, `UserDetails`). Defaults to a PascalCase version of the table name.
- **Page Title**: Define the title to be used for generated pages or views. Defaults to the table name.
- **Output Path (Optional)**: If you need to specify a particular output directory or a key for a predefined path in the backend configuration, you can enter it here.

#### Fields Configuration

A table will display all fields from your selected database table. You can customize how each field will be handled in the generated code, especially for UI elements like forms and lists:

- **Field Name**: The original name of the field in the database (read-only).
- **Data Type**: The original data type of the field in the database (read-only).
- **Display Name**: The user-friendly name for this field, used for labels in forms and table headers (e.g., "User Name" instead of "UserName").
- **Show in List**: Check if this field should be displayed as a column in generated list views or tables.
- **Searchable**: Check if this field should be included in search/filter functionality.
- **Sortable**: Check if generated lists should be sortable by this field.
- **Is Required**: Check if this field should be marked as required in generated forms, often used for validation.
- **Control Type**: Select the type of HTML form control to be generated for this field (e.g., Text Input, Textarea, Select Dropdown, Date Picker, Number Input, Checkbox). The default is inferred from the data type.

### 3. Actions

- **Generate Code**: Once you have configured all options, click this button to start the code generation process.
- **Reset**: Click this button to clear all selections and configurations on the form.

### 4. Generation Log

After initiating code generation, this section will display real-time logs from the backend. This includes:
- Progress messages.
- Names of files being generated.
- Any errors or warnings encountered during the process.

Review the logs carefully to ensure the generation was successful and to identify any issues.

## API Contract

The Code Generator frontend interacts with the backend through the following API endpoints:

### Fetch Database Tables

- **Endpoint**: `GET /api/codegenerator/tables`
- **Purpose**: Retrieves a list of available database tables and their basic column information.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "tables": [
      {
        "name": "string", // Table name
        "schema": "string", // Optional: Table schema
        "columns": [
          {
            "name": "string", // Column name
            "dataType": "string", // e.g., "VARCHAR", "INT", "DATETIME"
            "isPrimaryKey": "boolean",
            "isNullable": "boolean",
            "maxLength": "number" // if applicable
          }
          // ... more column objects
        ]
      }
      // ... more table objects
    ]
  }
  ```
- **Error Response (e.g., 500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "message": "Error fetching database tables."
  }
  ```

### Generate Code

- **Endpoint**: `POST /api/codegenerator/generate`
- **Purpose**: Initiates the code generation process based on the provided configuration.
- **Request Payload (JSON)**:
  ```json
  {
    "tableName": "string",
    "moduleName": "string",
    "outputPath": "string", // Optional
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
        "controlType": "string" // (e.g., "text", "textarea", "select")
      }
      // ... more field objects
    ],
    "options": { // Optional: For additional generator-specific settings
      "generateService": "boolean",
      "generateController": "boolean",
      "generateModels": "boolean",
      "overwriteExistingFiles": "boolean"
    }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Code generated successfully.",
    "logs": ["string"], // Array of log messages
    "generatedFiles": ["string"] // Optional: List of file paths generated
  }
  ```
- **Error Response (e.g., 400 Bad Request, 500 Internal Server Error)**:
  ```json
  {
    "success": false,
    "message": "Error generating code.",
    "errors": [ // Optional: Specific field errors
      {
        "field": "string",
        "message": "string"
      }
    ],
    "logs": ["string"] // Logs captured before error
  }
  ```

## Current Limitations

- (Add any known limitations here, e.g., specific database support, template customization options, etc.)
- This documentation primarily covers the frontend interface. Backend implementation details may vary.
