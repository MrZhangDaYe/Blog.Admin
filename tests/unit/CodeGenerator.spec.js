import { shallowMount, mount } from '@vue/test-utils';
import CodeGenerator from '@/views/CodeGenerator.vue';
import Vue from 'vue'; // Import Vue for nextTick if needed for more complex scenarios

// Mock Element UI components or other global components if they cause issues
// For example, if CodeGenerator uses ElSelect, ElOption, ElButton, etc.
// Vue.component('el-select', { template: '<div><slot></slot></div>' });
// Vue.component('el-option', { template: '<div><slot></slot></div>' });
// Vue.component('el-button', { template: '<button><slot></slot></button>' });
// Vue.component('el-table', { template: '<div><slot></slot></div>' });
// Vue.component('el-table-column', { template: '<div><slot></slot></div>' });
// Note: It's often better to properly mock or use a Vue instance with ElementUI registered for integration-style unit tests.
// For shallowMount, direct children might not need extensive mocking unless they are functional components or heavily integrated.

describe('CodeGenerator.vue', () => {
  it('renders the component and the main title', () => {
    const wrapper = shallowMount(CodeGenerator);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Code Generator');
  });

  it('shows table selection dropdown', () => {
    const wrapper = shallowMount(CodeGenerator);
    const tableSelect = wrapper.find('#table-select');
    expect(tableSelect.exists()).toBe(true);
  });

  it('initially does not show table configuration section', () => {
    const wrapper = shallowMount(CodeGenerator);
    // Assuming the configuration section has a unique class or ID, or we check for v-if bound element
    // Based on CodeGenerator.vue, the section has: v-if="selectedTable && currentTableDetails"
    // We can check for an element within that section, e.g., the module name input
    expect(wrapper.find('#module-name').exists()).toBe(false);
  });

  it('shows table configuration section after a table is selected', async () => {
    // Using `mount` for this test might be more reliable if interactions involve child component updates or complex DOM changes.
    // However, let's try with shallowMount and manually setting data first.
    const wrapper = shallowMount(CodeGenerator);

    // Simulate selecting a table by setting data property and calling the handler
    // This is a more direct unit test of the component's logic
    await wrapper.setData({ selectedTable: 'Users' });
    wrapper.vm.handleTableSelection(); // Call the method that updates currentTableDetails
    await Vue.nextTick(); // Wait for DOM updates

    expect(wrapper.vm.currentTableDetails).not.toBeNull();
    expect(wrapper.find('#module-name').exists()).toBe(true); // Module name input should now be visible
    expect(wrapper.find('.fields-table').exists()).toBe(true); // Fields table should be visible
  });

  it('initially has the "Generate Code" button but it might be part of a conditional section', () => {
    const wrapper = shallowMount(CodeGenerator);
    // The button section is v-if="selectedTable", so initially it's hidden.
    expect(wrapper.find('button.generate-button').exists()).toBe(false); // Assuming a class for easier selection

    // Let's test that it appears after table selection
  });

  it('shows "Generate Code" button after a table is selected', async () => {
    const wrapper = shallowMount(CodeGenerator);
    await wrapper.setData({ selectedTable: 'Users' });
    // Manually call handleTableSelection if it's responsible for more than just setting currentTableDetails
    // wrapper.vm.handleTableSelection(); // Already tested above that this sets up currentTableDetails
    await Vue.nextTick();

    // Find button more robustly - e.g. by text content if no specific class/id
    const generateButton = wrapper.findAll('button').filter(b => b.text().includes('Generate Code'));
    expect(generateButton.length).toBeGreaterThan(0);
    expect(generateButton.at(0).exists()).toBe(true);
  });

  it('calls handleGenerateCode when "Generate Code" button is clicked', async () => {
    const wrapper = shallowMount(CodeGenerator);
    const mockGenerateMethod = jest.fn();
    wrapper.setMethods({ handleGenerateCode: mockGenerateMethod }); // Mock the method

    // Simulate table selection to make the button visible
    await wrapper.setData({ selectedTable: 'Users' });
    wrapper.vm.handleTableSelection(); // Ensure dependent data is set
    await Vue.nextTick();


    const generateButton = wrapper.findAll('button').filter(b => b.text().includes('Generate Code')).at(0);
    await generateButton.trigger('click');

    expect(mockGenerateMethod).toHaveBeenCalled();
  });

  it('resets the form when "Reset" button is clicked', async () => {
    const wrapper = shallowMount(CodeGenerator);
    const mockResetMethod = jest.fn();
    wrapper.setMethods({ resetForm: mockResetMethod }); // Mock the method

    // Simulate table selection to make the button visible
    await wrapper.setData({ selectedTable: 'Users' });
    await Vue.nextTick();

    const resetButton = wrapper.findAll('button').filter(b => b.text().includes('Reset')).at(0);
    await resetButton.trigger('click');

    expect(mockResetMethod).toHaveBeenCalled();
  });

});
