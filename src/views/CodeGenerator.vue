<template>
  <div class="code-generator-container">
    <h1>Code Generator</h1>

    <!-- Generation Mode Selection -->
    <section class="section-container">
      <h2>1. Select Generation Mode</h2>
      <div class="form-group">
        <label for="generation-mode-select">Generation Mode:</label>
        <select id="generation-mode-select" v-model="generationMode" @change="handleModeChange">
          <option value="single">Single Table</option>
          <option value="masterDetail">Master-Detail</option>
          <option value="tree">Tree Structure</option>
        </select>
      </div>
    </section>

    <!-- SINGLE TABLE MODE -->
    <div v-if="generationMode === 'single'">
      <section class="section-container">
        <h2>2. Select Database Table</h2>
        <div class="form-group">
          <label for="table-select">Table:</label>
          <select id="table-select" v-model="selectedTable" @change="handleTableSelection">
            <option disabled value="">Please select one</option>
            <option v-for="table in mockTables" :key="table.name + '-single-opt'" :value="table.name">
              {{ table.name }}
            </option>
          </select>
          <button @click="fetchTables" style="margin-left: 10px;">Refresh Tables</button>
        </div>
      </section>

      <section class="section-container" v-if="selectedTable && currentTableDetails">
        <h2>3. Configure Generation Options (Single Table)</h2>
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
              <th>Field Name</th><th>Data Type</th><th>Display Name</th><th>Show in List</th><th>Searchable</th><th>Sortable</th><th>Is Required</th><th>Control Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in currentTableDetails.fields" :key="field.fieldName + '-single-field'">
              <td>{{ field.fieldName }}</td><td>{{ field.dataType }}</td>
              <td><input type="text" v-model="field.displayName" /></td>
              <td><input type="checkbox" v-model="field.showInList" /></td>
              <td><input type="checkbox" v-model="field.searchable" /></td>
              <td><input type="checkbox" v-model="field.sortable" /></td>
              <td><input type="checkbox" v-model="field.isRequired" /></td>
              <td><select v-model="field.controlType"><option v-for="ctype in controlTypes" :key="ctype.value + '-single-ctype'" :value="ctype.value">{{ ctype.label }}</option></select></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- MASTER-DETAIL MODE -->
    <div v-if="generationMode === 'masterDetail'">
      <section class="section-container">
        <h2>2. Configure Master Table</h2>
        <div class="form-group">
          <label>Select Master Table:</label>
          <select v-model="selectedMasterTable" @change="handleMasterTableSelect">
            <option disabled value="">Please select master table</option>
            <option v-for="table in mockTables" :key="table.name + '-master-opt'" :value="table.name">
              {{ table.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label :for="'master-module-name'">Master Module Name:</label>
          <input type="text" :id="'master-module-name'" v-model="masterTableData.moduleName" />
        </div>
        <div class="form-group">
          <label :for="'master-page-title'">Master Page Title:</label>
          <input type="text" :id="'master-page-title'" v-model="masterTableData.pageTitle" />
        </div>
        <div class="form-group">
          <label :for="'master-output-path'">Master Output Path (optional):</label>
          <input type="text" :id="'master-output-path'" v-model="masterTableData.outputPath" />
        </div>
        <div v-if="selectedMasterTable && masterTableData.fields.length > 0">
          <h3>Master Table Fields Configuration</h3>
          <table class="fields-table">
             <thead><tr><th>Field Name</th><th>Data Type</th><th>Display Name</th><th>Show in List</th><th>Searchable</th><th>Sortable</th><th>Is Required</th><th>Control Type</th></tr></thead>
             <tbody>
               <tr v-for="field in masterTableData.fields" :key="field.fieldName + '-master-field'">
                 <td>{{ field.fieldName }}</td><td>{{ field.dataType }}</td>
                 <td><input type="text" v-model="field.displayName" /></td>
                 <td><input type="checkbox" v-model="field.showInList" /></td>
                 <td><input type="checkbox" v-model="field.searchable" /></td>
                 <td><input type="checkbox" v-model="field.sortable" /></td>
                 <td><input type="checkbox" v-model="field.isRequired" /></td>
                 <td><select v-model="field.controlType"><option v-for="ctype in controlTypes" :key="ctype.value + '-master-ctype'" :value="ctype.value">{{ ctype.label }}</option></select></td>
               </tr>
             </tbody>
          </table>
        </div>
      </section>

      <section class="section-container">
        <h2>3. Configure Detail Tables</h2>
        <div v-for="(detailTable, index) in detailTablesData" :key="'detail-' + index" class="detail-table-item">
          <h3>Detail Table {{ index + 1 }}</h3>
          <div class="form-group">
            <label :for="'detail-table-select-' + index">Select Detail Table:</label>
            <select :id="'detail-table-select-' + index" v-model="detailTable.tableName" @change="handleDetailTableSelect(detailTable)">
              <option disabled value="">Please select detail table</option>
              <option v-for="table in mockTables" :key="table.name + '-detail-opt-' + index" :value="table.name">
                {{ table.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label :for="'detail-fk-' + index">Foreign Key to Master (in {{detailTable.tableName || 'Detail Table'}}):</label>
            <select :id="'detail-fk-' + index" v-model="detailTable.foreignKeyToMaster">
              <option disabled value="">Select Foreign Key</option>
              <option v-for="fk in detailTable.availableForeignKeys" :key="fk.name + '-fk-' + index" :value="fk.name">
                {{ fk.name }} (references {{ fk.referencedTable }}.{{fk.referencedColumn}})
              </option>
            </select>
          </div>
          <div class="form-group"><label>Detail Module Name:</label><input type="text" v-model="detailTable.moduleName" /></div>
          <div class="form-group"><label>Detail Page Title:</label><input type="text" v-model="detailTable.pageTitle" /></div>
          <div v-if="detailTable.tableName && detailTable.fields.length > 0">
             <h4>Detail Table {{ index + 1 }} Fields Configuration</h4>
             <table class="fields-table">
               <thead><tr><th>Field Name</th><th>Data Type</th><th>Display Name</th><th>Show in List</th><th>Searchable</th><th>Sortable</th><th>Is Required</th><th>Control Type</th></tr></thead>
               <tbody>
                 <tr v-for="field in detailTable.fields" :key="field.fieldName + '-detail-field-' + index">
                   <td>{{ field.fieldName }}</td><td>{{ field.dataType }}</td>
                   <td><input type="text" v-model="field.displayName" /></td>
                   <td><input type="checkbox" v-model="field.showInList" /></td>
                   <td><input type="checkbox" v-model="field.searchable" /></td>
                   <td><input type="checkbox" v-model="field.sortable" /></td>
                   <td><input type="checkbox" v-model="field.isRequired" /></td>
                   <td><select v-model="field.controlType"><option v-for="ctype in controlTypes" :key="ctype.value + '-detail-ctype-' + index" :value="ctype.value">{{ ctype.label }}</option></select></td>
                 </tr>
               </tbody>
             </table>
          </div>
          <button @click="removeDetailTable(index)" type="button" style="margin-top:10px; background-color: #f44336;">Remove Detail Table</button>
        </div>
        <button @click="addDetailTable" type="button" style="margin-top:10px;">Add Detail Table</button>
      </section>
    </div>

    <!-- TREE STRUCTURE MODE -->
    <div v-if="generationMode === 'tree'">
      <section class="section-container">
        <h2>2. Configure Tree Table</h2>
        <div class="form-group">
          <label>Select Table for Tree:</label>
          <select v-model="selectedTreeTable" @change="handleTreeTableSelect">
            <option disabled value="">Please select table</option>
            <option v-for="table in mockTables" :key="table.name + '-tree-opt'" :value="table.name">
              {{ table.name }}
            </option>
          </select>
        </div>
        <div class="form-group"><label>Module Name:</label><input type="text" v-model="treeTableData.moduleName" /></div>
        <div class="form-group"><label>Page Title:</label><input type="text" v-model="treeTableData.pageTitle" /></div>
        <div class="form-group"><label>Output Path (optional):</label><input type="text" v-model="treeTableData.outputPath" /></div>

        <h3>Tree Configuration</h3>
        <div class="form-group">
          <label>ID Field:</label>
          <select v-model="treeConfigData.idField">
            <option disabled value="">Select ID field</option>
            <option v-for="col in (currentTableDetails ? currentTableDetails.columns : [])" :key="col.name + '-idField-tree'" :value="col.name">{{ col.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Parent ID Field:</label>
          <select v-model="treeConfigData.parentIdField">
            <option disabled value="">Select Parent ID field</option>
            <option v-for="col in (currentTableDetails ? currentTableDetails.columns : [])" :key="col.name + '-parentIdField-tree'" :value="col.name">{{ col.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Display Name Field (for Tree Label):</label>
          <select v-model="treeConfigData.nameField">
            <option disabled value="">Select Display Name field</option>
            <option v-for="col in (currentTableDetails ? currentTableDetails.columns : [])" :key="col.name + '-nameField-tree'" :value="col.name">{{ col.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Root Node Parent ID Value (optional):</label>
          <input type="text" v-model="treeConfigData.rootValue" placeholder="e.g., 0, null, or specific ID" />
        </div>
        <div v-if="selectedTreeTable && currentTableDetails && currentTableDetails.fields.length > 0">
            <h3>Fields Configuration for Tree Table</h3>
            <table class="fields-table">
              <thead><tr><th>Field Name</th><th>Data Type</th><th>Display Name</th><th>Show in List</th><th>Searchable</th><th>Sortable</th><th>Is Required</th><th>Control Type</th></tr></thead>
              <tbody>
                <tr v-for="field in currentTableDetails.fields" :key="field.fieldName + '-tree-field'">
                  <td>{{ field.fieldName }}</td><td>{{ field.dataType }}</td>
                  <td><input type="text" v-model="field.displayName" /></td>
                  <td><input type="checkbox" v-model="field.showInList" /></td>
                  <td><input type="checkbox" v-model="field.searchable" /></td>
                  <td><input type="checkbox" v-model="field.sortable" /></td>
                  <td><input type="checkbox" v-model="field.isRequired" /></td>
                  <td><select v-model="field.controlType"><option v-for="ctype in controlTypes" :key="ctype.value + '-tree-ctype'" :value="ctype.value">{{ ctype.label }}</option></select></td>
                </tr>
              </tbody>
            </table>
        </div>
      </section>
    </div>

    <!-- Action Buttons (Visible for all modes if a primary table is selected) -->
    <section class="section-container"
      v-if="(generationMode === 'single' && selectedTable) ||
            (generationMode === 'masterDetail' && selectedMasterTable) ||
            (generationMode === 'tree' && selectedTreeTable)">
      <h2>Actions</h2> <!-- Adjusted title from "3. Actions" to generic "Actions" -->
      <button @click="handleGenerateCode" :disabled="isGenerating">
        {{ isGenerating ? 'Generating...' : 'Generate Code' }}
      </button>
      <button @click="resetForm" style="margin-left: 10px;">Reset</button>
    </section>

    <!-- Output/Log Section -->
    <section class="section-container output-log-section" v-if="generationLogs.length > 0">
      <h2>Generation Log</h2> <!-- Adjusted title from "4. Generation Log" to generic "Generation Log" -->
      <pre>{{ generationLogs.join('\n') }}</pre>
    </section>

  </div>
</template>

<script>
export default {
  name: 'CodeGenerator',
  data() {
    return {
      generationMode: 'single',
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
        { name: 'Orders', columns: [ // Renamed from NewOrders for consistency if it was an example
            { name: 'OrderId', dataType: 'INT', isPrimaryKey: true, isNullable: false },
            { name: 'OrderDate', dataType: 'DATETIME', isNullable: false },
            { name: 'CustomerId', dataType: 'INT', isNullable: false }, // Assuming this is FK to Users.Id for example
            { name: 'TotalAmount', dataType: 'DECIMAL', isNullable: false },
          ]
        },
        {
          name: 'OrderItems', // Renamed from NewOrderItems
          columns: [
            { name: 'OrderItemId', dataType: 'INT', isPrimaryKey: true, isNullable: false },
            { name: 'OrderId', dataType: 'INT', isNullable: false, isForeignKey: true, referencedTable: 'Orders', referencedColumn: 'OrderId' },
            { name: 'ProductId', dataType: 'INT', isNullable: false, isForeignKey: true, referencedTable: 'Products', referencedColumn: 'ProductId' },
            { name: 'ProductName', dataType: 'VARCHAR', isNullable: false }, // Could be redundant if joined with Products
            { name: 'Quantity', dataType: 'INT', isNullable: false },
            { name: 'UnitPrice', dataType: 'DECIMAL', isNullable: false }
          ]
        },
        {
          name: 'CategoriesTree',
          columns: [
             { name: 'CategoryId', dataType: 'INT', isPrimaryKey: true, isNullable: false },
             { name: 'CategoryName', dataType: 'VARCHAR', isNullable: false },
             { name: 'ParentCategoryId', dataType: 'INT', isNullable: true, isForeignKey: true, referencedTable: 'CategoriesTree', referencedColumn: 'CategoryId' }, // Self-referencing FK
             { name: 'Description', dataType: 'TEXT', isNullable: true },
          ]
        }
      ],
      selectedTable: '', // For single mode
      currentTableDetails: null, // For single mode & tree mode's main table fields/columns
      generationOptions: { // For single mode options
        moduleName: '',
        pageTitle: '',
        outputPath: '',
        overwriteExistingFiles: false,
        generateService: true,
        generateController: true,
        generateModels: true,
      },

      // Master-Detail Mode Data
      selectedMasterTable: '',
      masterTableData: { moduleName: '', pageTitle: '', outputPath: '', fields: [], columns: [] },
      detailTablesData: [], // Array of: { tableName: '', foreignKeyToMaster: '', moduleName: '', pageTitle: '', fields: [], columns: [], availableForeignKeys: [] }

      // Tree Structure Mode Data
      selectedTreeTable: '',
      treeTableData: { moduleName: '', pageTitle: '', outputPath: ''}, // Stores module, page title for tree
      treeConfigData: { idField: '', parentIdField: '', nameField: '', rootValue: '' }, // Stores tree structural field names

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
    _resetAllConfigData() {
      this.selectedTable = '';
      this.generationOptions = {
        moduleName: '',
        pageTitle: '',
        outputPath: '',
        overwriteExistingFiles: false,
        generateService: true,
        generateController: true,
        generateModels: true,
      };
      this.currentTableDetails = null;

      this.selectedMasterTable = '';
      this.masterTableData = { moduleName: '', pageTitle: '', outputPath: '', fields: [], columns: [] };
      this.detailTablesData = [];

      this.selectedTreeTable = '';
      this.treeTableData = { moduleName: '', pageTitle: '', outputPath: '' };
      this.treeConfigData = { idField: '', parentIdField: '', nameField: '', rootValue: '' };
    },
    handleModeChange() {
      this._resetAllConfigData();
      this.generationLogs = []; // Also clear logs when mode changes
    },
    _loadTableInfo(tableName) {
      return this.mockTables.find(t => t.name === tableName);
    },
    _prepareFieldsFromColumns(columnsArray) {
      if (!columnsArray) return [];
      return columnsArray.map(col => ({
        fieldName: col.name,
        dataType: col.dataType,
        displayName: this.formatDisplayName(col.name),
        showInList: true,
        searchable: !col.isPrimaryKey,
        sortable: true,
        isRequired: !col.isNullable && !col.isPrimaryKey,
        controlType: this.getDefaultControlType(col.dataType),
      }));
    },
    fetchTables() {
      this.generationLogs = ['Fetching table list...'];
      setTimeout(() => {
        this.generationLogs.push('Mock table list fetched.');
      }, 500);
    },
    handleTableSelection() { // For Single Mode
      if (this.generationMode !== 'single' || !this.selectedTable) {
        if (this.generationMode === 'single') this.currentTableDetails = null; // Clear only if in single mode and no table
        return;
      }
      this.generationLogs = [];
      const tableData = this._loadTableInfo(this.selectedTable);
      if (tableData) {
        this.generationOptions.moduleName = this.toPascalCase(tableData.name);
        this.generationOptions.pageTitle = tableData.name;
        this.currentTableDetails = {
          tableName: tableData.name,
          columns: tableData.columns, // Keep original columns info
          fields: this._prepareFieldsFromColumns(tableData.columns),
        };
      } else {
        this.currentTableDetails = null;
      }
    },
    handleMasterTableSelect() {
      if (!this.selectedMasterTable) {
        this.masterTableData = { moduleName: '', pageTitle: '', outputPath: '', fields: [], columns: [] };
        this.detailTablesData.forEach(dt => this.populateForeignKeys(dt)); // Refresh FKs for details if master changes
        return;
      }
      this.generationLogs = [];
      const tableInfo = this._loadTableInfo(this.selectedMasterTable);
      if (tableInfo) {
        this.masterTableData.columns = tableInfo.columns;
        this.masterTableData.fields = this._prepareFieldsFromColumns(tableInfo.columns);
        this.masterTableData.moduleName = this.toPascalCase(this.selectedMasterTable);
        this.masterTableData.pageTitle = this.selectedMasterTable;
      } else {
         this.masterTableData = { moduleName: '', pageTitle: '', outputPath: '', fields: [], columns: [] };
      }
      this.detailTablesData.forEach(dt => this.populateForeignKeys(dt)); // Refresh FKs
    },
    handleDetailTableSelect(detailTableObject) {
      if (!detailTableObject.tableName) {
        detailTableObject.fields = [];
        detailTableObject.columns = [];
        detailTableObject.moduleName = '';
        detailTableObject.pageTitle = '';
        this.populateForeignKeys(detailTableObject);
        return;
      }
      const tableInfo = this._loadTableInfo(detailTableObject.tableName);
      if (tableInfo) {
        detailTableObject.columns = tableInfo.columns;
        detailTableObject.fields = this._prepareFieldsFromColumns(tableInfo.columns);
        detailTableObject.moduleName = this.toPascalCase(detailTableObject.tableName);
        detailTableObject.pageTitle = detailTableObject.tableName; // Default page title
      } else {
        detailTableObject.fields = [];
        detailTableObject.columns = [];
        detailTableObject.moduleName = '';
        detailTableObject.pageTitle = '';
      }
      this.populateForeignKeys(detailTableObject);
    },
    populateForeignKeys(detailTableObject) {
      detailTableObject.availableForeignKeys = [];
      if (this.selectedMasterTable && detailTableObject.columns && detailTableObject.columns.length > 0) {
        detailTableObject.availableForeignKeys = detailTableObject.columns.filter(
          col => col.isForeignKey && col.referencedTable === this.selectedMasterTable
        );
        // If the current foreignKeyToMaster is no longer valid, reset it
        if (detailTableObject.foreignKeyToMaster && !detailTableObject.availableForeignKeys.find(fk => fk.name === detailTableObject.foreignKeyToMaster)) {
            detailTableObject.foreignKeyToMaster = '';
        }
      } else {
          detailTableObject.foreignKeyToMaster = ''; // Clear if no master table or columns
      }
    },
    addDetailTable() {
      const newDetailTable = {
        tableName: '',
        foreignKeyToMaster: '',
        moduleName: '',
        pageTitle: '',
        fields: [],
        columns: [],
        availableForeignKeys: []
      };
      this.populateForeignKeys(newDetailTable); // Populate initial FKs if master is selected
      this.detailTablesData.push(newDetailTable);
    },
    removeDetailTable(index) {
      this.detailTablesData.splice(index, 1);
    },
    handleTreeTableSelect() {
      if (!this.selectedTreeTable) {
        this.currentTableDetails = null;
        this.treeTableData = { moduleName: '', pageTitle: '', outputPath: ''};
        this.treeConfigData = { idField: '', parentIdField: '', nameField: '', rootValue: '' };
        return;
      }
      this.generationLogs = [];
      const tableInfo = this._loadTableInfo(this.selectedTreeTable);
      if (tableInfo) {
        this.currentTableDetails = { // Used by tree mode for its fields config and FK selection
            tableName: this.selectedTreeTable,
            columns: tableInfo.columns,
            fields: this._prepareFieldsFromColumns(tableInfo.columns)
        };
        this.treeTableData.moduleName = this.toPascalCase(this.selectedTreeTable);
        this.treeTableData.pageTitle = this.selectedTreeTable;

        const pkField = tableInfo.columns.find(c => c.isPrimaryKey);
        this.treeConfigData.idField = pkField ? pkField.name : '';
        this.treeConfigData.parentIdField = '';
        this.treeConfigData.nameField = '';
        this.treeConfigData.rootValue = '';
      } else {
        this.currentTableDetails = null;
        this.treeTableData = { moduleName: '', pageTitle: '', outputPath: ''};
        this.treeConfigData = { idField: '', parentIdField: '', nameField: '', rootValue: '' };
      }
    },
    handleGenerateCode() {
      this.isGenerating = true;
      this.generationLogs = ['Starting code generation...'];
      let payload = {
        generationMode: this.generationMode,
        // Common options can be part of a global options object if needed later
        // For now, including single-table's specific options here.
        options: {
            generateService: this.generationOptions.generateService,
            generateController: this.generationOptions.generateController,
            generateModels: this.generationOptions.generateModels,
            overwriteExistingFiles: this.generationOptions.overwriteExistingFiles,
        }
      };

      if (this.generationMode === 'single') {
        if (!this.selectedTable || !this.currentTableDetails) {
            alert('Please select a table and configure options for Single Table mode.');
            this.isGenerating = false; return;
        }
        payload.tableName = this.selectedTable;
        payload.moduleName = this.generationOptions.moduleName;
        payload.pageTitle = this.generationOptions.pageTitle;
        payload.outputPath = this.generationOptions.outputPath;
        payload.fields = this.currentTableDetails.fields.map(f => ({ ...f }));
        // 'options' already added above for single mode
      } else if (this.generationMode === 'masterDetail') {
        if (!this.selectedMasterTable || this.detailTablesData.some(dt => !dt.tableName || !dt.foreignKeyToMaster)) {
            alert('Please select master table, all detail tables, and their foreign keys for Master-Detail mode.');
            this.isGenerating = false; return;
        }
        payload.masterTable = {
          tableName: this.selectedMasterTable,
          moduleName: this.masterTableData.moduleName,
          pageTitle: this.masterTableData.pageTitle,
          outputPath: this.masterTableData.outputPath,
          fields: this.masterTableData.fields.map(f => ({ ...f }))
        };
        payload.detailTables = this.detailTablesData.map(dt => ({
          tableName: dt.tableName,
          foreignKeyToMaster: dt.foreignKeyToMaster,
          moduleName: dt.moduleName,
          pageTitle: dt.pageTitle,
          fields: dt.fields.map(f => ({ ...f }))
        }));
        // TODO: Add specific options for master-detail if needed in future
        delete payload.options; // Remove single-table options if not applicable or merge
      } else if (this.generationMode === 'tree') {
         if (!this.selectedTreeTable || !this.treeConfigData.idField || !this.treeConfigData.parentIdField || !this.treeConfigData.nameField) {
            alert('Please select a table and configure all Tree ID/ParentID/Name fields for Tree mode.');
            this.isGenerating = false; return;
        }
        payload.tableName = this.selectedTreeTable;
        payload.moduleName = this.treeTableData.moduleName;
        payload.pageTitle = this.treeTableData.pageTitle;
        payload.outputPath = this.treeTableData.outputPath;
        payload.fields = this.currentTableDetails.fields.map(f => ({ ...f }));
        payload.treeConfig = { ...this.treeConfigData };
        // TODO: Add specific options for tree if needed in future
        delete payload.options; // Remove single-table options if not applicable or merge
      }

      this.generationLogs.push(`Payload: ${JSON.stringify(payload, null, 2)}`);

      setTimeout(() => {
        const success = Math.random() > 0.3;
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
      this._resetAllConfigData();
      this.generationLogs = [];
      this.isGenerating = false;
      this.generationMode = 'single'; // Reset mode to default
    },
    formatDisplayName(fieldName) {
      return fieldName.replace(/([A-Z])/g, ' $1').trim();
    },
    toPascalCase(str) {
        if (!str) return '';
        return str.replace(/(?:^|[-_\s]+)(\w)/g, (_, c) => c.toUpperCase()).replace(/[-_\s]+/g, '');
    },
    getDefaultControlType(dataType) {
      const type = dataType.toLowerCase();
      if (type.includes('char') || type.includes('text')) return 'text';
      if (type.includes('int') || type.includes('decimal') || type.includes('double')) return 'number';
      if (type.includes('date') || type.includes('time')) return 'datepicker';
      if (type.includes('bool') || type.includes('boolean')) return 'checkbox';
      return 'text';
    }
  },
  mounted() {
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
.section-container h4 {
    margin-top: 15px;
    margin-bottom: 8px;
    font-size: 1.05em;
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
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.detail-table-item {
  border: 1px dashed #ccc;
  padding: 15px;
  margin-top: 15px;
  border-radius: 4px;
  background-color: #fdfdfd;
}
.detail-table-item h3 {
  margin-top: 0;
  font-size: 1.1em;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
</style>
