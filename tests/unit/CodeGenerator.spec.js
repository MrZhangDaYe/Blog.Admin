import { shallowMount, mount } from '@vue/test-utils';
import CodeGenerator from '@/views/CodeGenerator.vue';
import Vue from 'vue';

// It might be necessary to mock globally registered components if not done already
// Vue.component('el-select', { template: '<div><slot></slot></div>' }); // etc.

describe('CodeGenerator.vue - Multi-Mode Functionality', () => {
  let wrapper;

  // Helper to set mockTables with FK info, similar to what's in the component
  const getMockTablesWithFK = () => [
    { name: 'Users', columns: [ { name: 'Id', dataType: 'INT', isPrimaryKey: true }, { name: 'Username', dataType: 'VARCHAR' } ] },
    { name: 'Orders', columns: [ { name: 'OrderID', dataType: 'INT', isPrimaryKey: true }, { name: 'OrderDate', dataType: 'DATETIME' }, { name: 'UserID', dataType: 'INT', isForeignKey: true, referencedTable: 'Users', referencedColumn: 'Id' } ] },
    { name: 'OrderItems', columns: [ { name: 'OrderItemID', dataType: 'INT', isPrimaryKey: true }, { name: 'OrderID', dataType: 'INT', isForeignKey: true, referencedTable: 'Orders', referencedColumn: 'OrderID' }, { name: 'ProductName', dataType: 'VARCHAR' } ] },
    { name: 'Categories', columns: [ { name: 'CategoryID', dataType: 'INT', isPrimaryKey: true }, { name: 'CategoryName', dataType: 'VARCHAR' }, { name: 'ParentID', dataType: 'INT', isNullable: true, isForeignKey: true, referencedTable: 'Categories', referencedColumn: 'CategoryID' } ] }
  ];

  beforeEach(() => {
    wrapper = shallowMount(CodeGenerator, {
      // Provide initial data, including updated mockTables if component doesn't self-initialize them with FKs for tests
      data() {
        return {
          // It's often better if the component itself initializes its data,
          // but for testing specific scenarios, overriding can be useful.
          // Ensure this matches the component's data structure.
          mockTables: getMockTablesWithFK(),
          // ... other initial data properties if needed for stability ...
          generationMode: 'single',
          selectedTable: '',
          generationOptions: { moduleName: '', pageTitle: '', outputPath: '', overwriteExistingFiles: false, generateService: true, generateController: true, generateModels: true },
          currentTableDetails: null,
          selectedMasterTable: '',
          masterTableData: { moduleName: '', pageTitle: '', outputPath: '', fields:[], columns:[]},
          detailTablesData: [],
          selectedTreeTable: '',
          treeTableData: { moduleName: '', pageTitle: '', outputPath: ''},
          treeConfigData: { idField:'', parentIdField: '', nameField: '', rootValue: ''},
          controlTypes: [{ value: 'text', label: 'Text Input' }], // Simplified for test
          isGenerating: false,
          generationLogs: []
        }
      }
    });
  });

  it('renders generation mode selector', () => {
    expect(wrapper.find('#generation-mode-select').exists()).toBe(true);
  });

  it('defaults to single table mode and shows single table UI', () => {
    expect(wrapper.vm.generationMode).toBe('single');
    // For v-if, check existence and visibility if the element is not removed but hidden by CSS.
    // If v-if removes element, just check exists().
    // Given the template uses v-if, elements should not exist when condition is false.
    // However, Vue Test Utils' isVisible() can be more robust.
    // The provided snippet uses v-if="generationMode === 'single'" directly on a div.
    // It's better to find a unique element *within* that conditional div.
    expect(wrapper.find('#table-select').exists()).toBe(true); // Part of single mode UI
    expect(wrapper.find('select[v-model="selectedMasterTable"]').exists()).toBe(false); // Part of master-detail
    expect(wrapper.find('select[v-model="selectedTreeTable"]').exists()).toBe(false); // Part of tree
  });

  it('changes mode and UI when mode selector changes', async () => {
    const mockReset = jest.spyOn(wrapper.vm, '_resetAllConfigData');

    await wrapper.find('#generation-mode-select').setValue('masterDetail');
    expect(wrapper.vm.generationMode).toBe('masterDetail');
    expect(mockReset).toHaveBeenCalled();
    await Vue.nextTick();

    expect(wrapper.find('#table-select').exists()).toBe(false);
    expect(wrapper.find('select[v-model="selectedMasterTable"]').exists()).toBe(true);
    expect(wrapper.find('select[v-model="selectedTreeTable"]').exists()).toBe(false);

    await wrapper.find('#generation-mode-select').setValue('tree');
    expect(wrapper.vm.generationMode).toBe('tree');
    expect(mockReset).toHaveBeenCalledTimes(2);
    await Vue.nextTick();

    expect(wrapper.find('#table-select').exists()).toBe(false);
    expect(wrapper.find('select[v-model="selectedMasterTable"]').exists()).toBe(false);
    expect(wrapper.find('select[v-model="selectedTreeTable"]').exists()).toBe(true);

    mockReset.mockRestore();
  });

  describe('Master-Detail Mode', () => {
    beforeEach(async () => {
      // Set mode to masterDetail and ensure data is reset as if component did it
      await wrapper.setData({
          generationMode: 'single', // Start from a different mode to ensure change handler logic is covered
          mockTables: getMockTablesWithFK()
      });
      await wrapper.find('#generation-mode-select').setValue('masterDetail');
      // _resetAllConfigData is called by handleModeChange, so data should be clean for masterDetail
    });

    it('selects master table and populates its data', async () => {
      await wrapper.find('select[v-model="selectedMasterTable"]').setValue('Orders');
      await Vue.nextTick();

      expect(wrapper.vm.selectedMasterTable).toBe('Orders');
      expect(wrapper.vm.masterTableData.moduleName).toBe('Orders');
      expect(wrapper.vm.masterTableData.fields.length).toBeGreaterThan(0);
      expect(wrapper.vm.masterTableData.fields[0].fieldName).toBe('OrderID');
    });

    it('adds and removes detail tables', async () => {
      expect(wrapper.vm.detailTablesData.length).toBe(0);
      const addDetailButton = wrapper.findAll('div[v-if="generationMode === \'masterDetail\'"] button').filter(w => w.text() === 'Add Detail Table').at(0);
      await addDetailButton.trigger('click');
      expect(wrapper.vm.detailTablesData.length).toBe(1);

      await addDetailButton.trigger('click');
      expect(wrapper.vm.detailTablesData.length).toBe(2);
      await Vue.nextTick(); // Allow DOM to update with new detail items

      const removeDetailButton = wrapper.find('.detail-table-item button[style*="background-color: #f44336;"]');
      await removeDetailButton.trigger('click');
      expect(wrapper.vm.detailTablesData.length).toBe(1);
    });

    it('selects detail table and populates its foreign keys', async () => {
      await wrapper.vm.addDetailTable();
      await wrapper.setData({ selectedMasterTable: 'Orders' });
      await wrapper.vm.handleMasterTableSelect();
      await Vue.nextTick();

      const detailTableConfig = wrapper.vm.detailTablesData[0];
      const detailTableSelect = wrapper.find(`#detail-table-select-0`); // First detail table
      await detailTableSelect.setValue('OrderItems');
      // handleDetailTableSelect is called via @change
      await Vue.nextTick();

      expect(detailTableConfig.fields.length).toBeGreaterThan(0);
      expect(detailTableConfig.availableForeignKeys.length).toBe(1);
      expect(detailTableConfig.availableForeignKeys[0].name).toBe('OrderID');
      expect(detailTableConfig.availableForeignKeys[0].referencedTable).toBe('Orders');
    });

    it('constructs correct payload for master-detail generation', async () => {
      const mockHandleGenerateCode = jest.spyOn(wrapper.vm, 'handleGenerateCode');
      // We are testing the payload construction inside handleGenerateCode before the mock API call.
      // So, we don't mockImplementation for handleGenerateCode, but let it run.

      await wrapper.setData({
        selectedMasterTable: 'Orders',
        masterTableData: {
          tableName: 'Orders', moduleName: 'OrdersModule', pageTitle: 'Orders Page', outputPath: '',
          fields: [{ fieldName: 'OrderID', dataType: 'INT', displayName: 'Order ID' }],
          columns: getMockTablesWithFK().find(t=>t.name==='Orders').columns
        },
        detailTablesData: [{
          tableName: 'OrderItems', foreignKeyToMaster: 'OrderID', moduleName: 'OrderItemsModule', pageTitle: 'Items',
          fields: [{ fieldName: 'OrderItemID', dataType: 'INT', displayName: 'Item ID' }],
          columns: getMockTablesWithFK().find(t=>t.name==='OrderItems').columns,
          availableForeignKeys: getMockTablesWithFK().find(t=>t.name==='OrderItems').columns.filter(c => c.isForeignKey && c.referencedTable === 'Orders')
        }]
      });
      await Vue.nextTick();

      const generateButton = wrapper.findAll('button').filter(b => b.text().includes('Generate Code')).at(0);
      await generateButton.trigger('click');

      expect(mockHandleGenerateCode).toHaveBeenCalled();

      const loggedPayloadString = wrapper.vm.generationLogs.find(log => log.startsWith('Payload:'));
      expect(loggedPayloadString).toBeDefined();
      const loggedPayload = JSON.parse(loggedPayloadString.substring('Payload: '.length));

      expect(loggedPayload.generationMode).toBe('masterDetail');
      expect(loggedPayload.masterTable.tableName).toBe('Orders');
      expect(loggedPayload.masterTable.moduleName).toBe('OrdersModule');
      expect(loggedPayload.detailTables.length).toBe(1);
      expect(loggedPayload.detailTables[0].tableName).toBe('OrderItems');
      expect(loggedPayload.detailTables[0].foreignKeyToMaster).toBe('OrderID');

      mockHandleGenerateCode.mockRestore();
    });
  });

  describe('Tree Mode', () => {
    beforeEach(async () => {
      await wrapper.setData({ generationMode: 'single', mockTables: getMockTablesWithFK() });
      await wrapper.find('#generation-mode-select').setValue('tree');
    });

    it('selects tree table and populates data', async () => {
      await wrapper.find('select[v-model="selectedTreeTable"]').setValue('Categories');
      await Vue.nextTick();

      expect(wrapper.vm.selectedTreeTable).toBe('Categories');
      expect(wrapper.vm.treeTableData.moduleName).toBe('Categories');
      expect(wrapper.vm.currentTableDetails.fields.length).toBeGreaterThan(0);
      expect(wrapper.vm.currentTableDetails.fields[0].fieldName).toBe('CategoryID');
      expect(wrapper.vm.treeConfigData.idField).toBe('CategoryID');
    });

    it('allows selection of tree configuration fields', async () => {
      await wrapper.setData({ selectedTreeTable: 'Categories' });
      await wrapper.vm.handleTreeTableSelect();
      await Vue.nextTick();

      await wrapper.find('select[v-model="treeConfigData.idField"]').setValue('CategoryID');
      await wrapper.find('select[v-model="treeConfigData.parentIdField"]').setValue('ParentID');
      await wrapper.find('select[v-model="treeConfigData.nameField"]').setValue('CategoryName');

      expect(wrapper.vm.treeConfigData.idField).toBe('CategoryID');
      expect(wrapper.vm.treeConfigData.parentIdField).toBe('ParentID');
      expect(wrapper.vm.treeConfigData.nameField).toBe('CategoryName');
    });

    it('constructs correct payload for tree generation', async () => {
      const mockHandleGenerateCode = jest.spyOn(wrapper.vm, 'handleGenerateCode');

      await wrapper.setData({
        selectedTreeTable: 'Categories',
        treeTableData: { moduleName: 'CategoriesModule', pageTitle: 'Categories Page', outputPath: '' },
        currentTableDetails: {
          tableName: 'Categories',
          fields: [{ fieldName: 'CategoryID', dataType: 'INT' }],
          columns: getMockTablesWithFK().find(t=>t.name==='Categories').columns
        },
        treeConfigData: { idField: 'CategoryID', parentIdField: 'ParentID', nameField: 'CategoryName', rootValue: '0' }
      });
      await Vue.nextTick();

      const generateButton = wrapper.findAll('button').filter(b => b.text().includes('Generate Code')).at(0);
      await generateButton.trigger('click');

      expect(mockHandleGenerateCode).toHaveBeenCalled();

      const loggedPayloadString = wrapper.vm.generationLogs.find(log => log.startsWith('Payload:'));
      expect(loggedPayloadString).toBeDefined();
      const loggedPayload = JSON.parse(loggedPayloadString.substring('Payload: '.length));

      expect(loggedPayload.generationMode).toBe('tree');
      expect(loggedPayload.tableName).toBe('Categories');
      expect(loggedPayload.treeConfig.idField).toBe('CategoryID');
      expect(loggedPayload.treeConfig.parentIdField).toBe('ParentID');
      expect(loggedPayload.treeConfig.nameField).toBe('CategoryName');
      expect(loggedPayload.treeConfig.rootValue).toBe('0');

      mockHandleGenerateCode.mockRestore();
    });
  });

  describe('Single Table Mode - Payload', () => {
    beforeEach(async () => {
      await wrapper.setData({ generationMode: 'tree', mockTables: getMockTablesWithFK() }); // Start from different
      await wrapper.find('#generation-mode-select').setValue('single'); // Switch to single
    });

    it('constructs correct payload for single table generation', async () => {
      const mockHandleGenerateCode = jest.spyOn(wrapper.vm, 'handleGenerateCode');

      await wrapper.setData({ selectedTable: 'Users' });
      await wrapper.vm.handleTableSelection();
      await wrapper.setData({
        generationOptions: {
          ...wrapper.vm.generationOptions,
          moduleName: 'UsersModule',
          pageTitle: 'Users Page',
          overwriteExistingFiles: true
        }
      });
      await Vue.nextTick();

      const generateButton = wrapper.findAll('button').filter(b => b.text().includes('Generate Code')).at(0);
      await generateButton.trigger('click');

      expect(mockHandleGenerateCode).toHaveBeenCalled();

      const loggedPayloadString = wrapper.vm.generationLogs.find(log => log.startsWith('Payload:'));
      expect(loggedPayloadString).toBeDefined();
      const loggedPayload = JSON.parse(loggedPayloadString.substring('Payload: '.length));

      expect(loggedPayload.generationMode).toBe('single');
      expect(loggedPayload.tableName).toBe('Users');
      expect(loggedPayload.moduleName).toBe('UsersModule');
      expect(loggedPayload.options.overwriteExistingFiles).toBe(true);
      expect(loggedPayload.fields.length).toBeGreaterThan(0);

      mockHandleGenerateCode.mockRestore();
    });
  });
});
