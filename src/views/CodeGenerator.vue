<template>
  <div class="code-generator-container">
    <h1>Code Generator</h1>

    <!-- Database Table Selection -->
    <section class="section-container">
      <h2>1. Select Database Table</h2>
      <div class="form-group">
        <label for="table-select">Table:</label>
        <select id="table-select" v-model="selectedTable" @change="handleTableSelection">
          <option disabled value="">Please select one</option>
          <option v-for="table in mockTables" :key="table.name" :value="table.name">
            {{ table.name }}
          </option>
        </select>
        <button @click="fetchTables" style="margin-left: 10px;">Refresh Tables</button>
      </div>
    </section>

    <!-- Table & Field Configuration (conditional rendering) -->
    <section class="section-container" v-if="selectedTable && currentTableDetails">
      <h2>2. Configure Generation Options</h2>

      <div class="form-group">
        <label for="module-name">Module Name:</label>
        <input type="text" id="module-name" v-model="generationOptions.moduleName" />
      </div>
      <div class="form-group">
        <label for="page-title">Page Title:</label>
        <input type="text" id="page-title" v-model="generationOptions.pageTitle" />
      </div>
      <div class="form-group">
        <label for="output-path">Output Path (optional):</label>
        <input type="text" id="output-path" v-model="generationOptions.outputPath" />
      </div>

      <h3>Fields Configuration</h3>
      <table class="fields-table">
        <thead>
          <tr>
            <th>Field Name</th>
            <th>Data Type</th>
            <th>Display Name</th>
            <th>Show in List</th>
            <th>Searchable</th>
            <th>Sortable</th>
            <th>Is Required</th>
            <th>Control Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in currentTableDetails.fields" :key="field.fieldName">
            <td>{{ field.fieldName }}</td>
            <td>{{ field.dataType }}</td>
            <td><input type="text" v-model="field.displayName" /></td>
            <td><input type="checkbox" v-model="field.showInList" /></td>
            <td><input type="checkbox" v-model="field.searchable" /></td>
            <td><input type="checkbox" v-model="field.sortable" /></td>
            <td><input type="checkbox" v-model="field.isRequired" /></td>
            <td>
              <select v-model="field.controlType">
                <option v-for="ctype in controlTypes" :key="ctype.value" :value="ctype.value">
                  {{ ctype.label }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Action Buttons -->
    <section class="section-container" v-if="selectedTable">
      <h2>3. Actions</h2>
      <button @click="handleGenerateCode" :disabled="isGenerating">
        {{ isGenerating ? 'Generating...' : 'Generate Code' }}
      </button>
      <button @click="resetForm" style="margin-left: 10px;">Reset</button>
    </section>

    <!-- Output/Log Section -->
    <section class="section-container output-log-section" v-if="generationLogs.length > 0">
      <h2>4. Generation Log</h2>
      <pre>{{ generationLogs.join('\n') }}</pre>
    </section>

  </div>
</template>

<script>
export default {
  name: 'CodeGenerator',
  data() {
    return {
      mockTables: [
        { name: 'Users', columns: [
            { name: 'Id', dataType: 'INT', isPrimaryKey: true, isNullable: false },
            { name: 'Username', dataType: 'VARCHAR', isNullable: false, maxLength: 50 },
            { name: 'Email', dataType: 'VARCHAR', isNullable: true, maxLength: 100 },
            { name: 'CreatedAt', dataType: 'DATETIME', isNullable: false },
          ]
        },
        { name: 'Products', columns: [
            { name: 'ProductId', dataType: 'INT', isPrimaryKey: true, isNullable: false },
            { name: 'Name', dataType: 'VARCHAR', isNullable: false, maxLength: 100 },
            { name: 'Description', dataType: 'TEXT', isNullable: true },
            { name: 'Price', dataType: 'DECIMAL', isNullable: false },
            { name: 'Stock', dataType: 'INT', isNullable: false },
          ]
        },
        { name: 'Orders', columns: [
            { name: 'OrderId', dataType: 'INT', isPrimaryKey: true, isNullable: false },
            { name: 'OrderDate', dataType: 'DATETIME', isNullable: false },
            { name: 'CustomerId', dataType: 'INT', isNullable: false },
            { name: 'TotalAmount', dataType: 'DECIMAL', isNullable: false },
          ]
        },
      ],
      selectedTable: '',
      currentTableDetails: null, // To store details of the selected table's fields
      generationOptions: {
        moduleName: '',
        pageTitle: '',
        outputPath: '',
        overwriteExistingFiles: false, // Example of an additional option
        // other options from API contract like generateService, etc.
        generateService: true,
        generateController: true,
        generateModels: true,
      },
      controlTypes: [
        { value: 'text', label: 'Text Input' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'select', label: 'Select Dropdown' },
        { value: 'datepicker', label: 'Date Picker' },
        { value: 'number', label: 'Number Input' },
        { value: 'checkbox', label: 'Checkbox' },
      ],
      isGenerating: false,
      generationLogs: [],
    };
  },
  methods: {
    fetchTables() {
      this.generationLogs = ['Fetching table list...'];
      // Simulate API call
      setTimeout(() => {
        // In a real scenario, this data would come from:
        // GET /api/codegenerator/tables
        this.generationLogs.push('Mock table list fetched.');
        // For now, we just use the mockTables already in data.
        // If mockTables were fetched, assign them here.
      }, 500);
    },
    handleTableSelection() {
      if (!this.selectedTable) {
        this.currentTableDetails = null;
        return;
      }
      this.generationLogs = []; // Clear logs on new table selection
      const tableData = this.mockTables.find(t => t.name === this.selectedTable);
      if (tableData) {
        this.generationOptions.moduleName = this.toPascalCase(tableData.name); // Default module name
        this.generationOptions.pageTitle = tableData.name; // Default page title

        this.currentTableDetails = {
          tableName: tableData.name,
          fields: tableData.columns.map(col => ({
            fieldName: col.name,
            dataType: col.dataType,
            displayName: this.formatDisplayName(col.name),
            showInList: true,
            searchable: !col.isPrimaryKey, // Don't search by PK by default
            sortable: true,
            isRequired: !col.isNullable && !col.isPrimaryKey, // Required if not nullable and not PK
            controlType: this.getDefaultControlType(col.dataType),
          })),
        };
      }
    },
    handleGenerateCode() {
      if (!this.selectedTable || !this.currentTableDetails) {
        alert('Please select a table and configure options.');
        return;
      }
      this.isGenerating = true;
      this.generationLogs = ['Starting code generation...'];

      const payload = {
        tableName: this.selectedTable,
        moduleName: this.generationOptions.moduleName,
        outputPath: this.generationOptions.outputPath,
        pageTitle: this.generationOptions.pageTitle,
        fields: this.currentTableDetails.fields.map(f => ({ ...f })), // Send a copy
        options: {
            generateService: this.generationOptions.generateService,
            generateController: this.generationOptions.generateController,
            generateModels: this.generationOptions.generateModels,
            overwriteExistingFiles: this.generationOptions.overwriteExistingFiles,
        }
      };

      this.generationLogs.push(`Payload: ${JSON.stringify(payload, null, 2)}`);

      // Simulate API POST /api/codegenerator/generate
      setTimeout(() => {
        const success = Math.random() > 0.3; // Simulate random success/failure
        if (success) {
          this.generationLogs.push('Code generation successful! (Mock)');
          this.generationLogs.push('Generated files: /mock/path/to/file1.cs, /mock/path/to/file2.vue (Mock)');
        } else {
          this.generationLogs.push('Error generating code. (Mock)');
          this.generationLogs.push('Error details: Something went wrong during the mock generation. (Mock)');
        }
        this.isGenerating = false;
      }, 2000);
    },
    resetForm() {
      this.selectedTable = '';
      this.currentTableDetails = null;
      this.generationOptions = {
        moduleName: '',
        pageTitle: '',
        outputPath: '',
        overwriteExistingFiles: false,
        generateService: true,
        generateController: true,
        generateModels: true,
      };
      this.generationLogs = [];
      this.isGenerating = false;
    },
    formatDisplayName(fieldName) {
      // Basic formatting: Add spaces before capitals (e.g., ProductName -> Product Name)
      return fieldName.replace(/([A-Z])/g, ' $1').trim();
    },
    toPascalCase(str) {
        return str.replace(/(?:^|[-_\s]+)(\w)/g, (_, c) => c.toUpperCase()).replace(/[-_\s]+/g, '');
    },
    getDefaultControlType(dataType) {
      const type = dataType.toLowerCase();
      if (type.includes('char') || type.includes('text')) return 'text';
      if (type.includes('int') || type.includes('decimal') || type.includes('double')) return 'number';
      if (type.includes('date') || type.includes('time')) return 'datepicker';
      if (type.includes('bool')) return 'checkbox';
      return 'text'; // Default
    }
  },
  mounted() {
    // Optionally fetch tables when component mounts
    // this.fetchTables();
  }
};
</script>

<style scoped>
.code-generator-container {
  padding: 20px;
  font-family: sans-serif;
}

.section-container {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}

.section-container h2 {
  margin-top: 0;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.section-container h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.fields-table th,
.fields-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.fields-table th {
  background-color: #f2f2f2;
}

.fields-table input[type="text"],
.fields-table select {
  width: 95%;
  padding: 6px;
  box-sizing: border-box;
}
.fields-table input[type="checkbox"] {
  cursor: pointer;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.output-log-section pre {
  background-color: #333;
  color: #fff;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap; /* Wrap long lines */
  word-break: break-all; /* Break words if necessary */
  max-height: 300px;
  overflow-y: auto;
}
</style>
