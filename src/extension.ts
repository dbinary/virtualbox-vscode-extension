import * as vscode from 'vscode';
import { VirtualMachinesProvider } from './vmsProvider';
import { VirtualMachineTreeItem } from './vmTreeitem';
import { isRunning, startWithoutGui, startWithGui, saveState, powerOff, stopAllVms, poweOffAllVms } from './utils';

export function activate(context: vscode.ExtensionContext) {
	const vmProvider = new VirtualMachinesProvider();
	vscode.window.registerTreeDataProvider("vb-machines", vmProvider);

	context.subscriptions.push(
		vscode.commands.registerCommand('virtualbox-extension.runVM', async (vmTreeItem?: VirtualMachineTreeItem) => {
			if (vmTreeItem) {
				const { vm } = vmTreeItem;
				const running = await isRunning(vm.id);

				if (!running) {
					try {
						await startWithGui(vm.id);
						vscode.window.showInformationMessage(`Virtual machine "${vm.name}" has been run successfully`);
					} catch (ex) {
						vscode.window.showErrorMessage(`Cannot run virtual machine "${vm.name}": ${ex?.message ?? "Unknown error"}`);
					}
				}

				vmProvider.refresh();
			}
		}),
		vscode.commands.registerCommand('virtualbox-extension.runHeadlessVM', async (vmTreeItem?: VirtualMachineTreeItem) => {
			if (vmTreeItem) {
				const { vm } = vmTreeItem;
				const running = await isRunning(vm.id);

				if (!running) {
					try {
						await startWithoutGui(vm.id);
						vscode.window.showInformationMessage(`Virtual machine "${vm.name}" has been run successfully`);
					} catch (ex) {
						vscode.window.showErrorMessage(`Cannot run virtual machine "${vm.name}": ${ex?.message ?? "Unknown error"}`);
					}
				}

				vmProvider.refresh();
			}
		}),
		vscode.commands.registerCommand("virtualbox-extension.saveStateVM", async (vmTreeItem: VirtualMachineTreeItem) => {
			if (vmTreeItem) {
				const { vm } = vmTreeItem;

				const running = await isRunning(vm.id);
				if (running) {
					try {
						await saveState(vm.id);
						vscode.window.showInformationMessage(`Virtual machine "${vm.name}" has been stopped successfully`);
					} catch (ex) {
						vscode.window.showErrorMessage(`Cannot stop virtual machine "${vm.name}": ${ex?.message ?? "Unknown error"}`);
					}
				}
				vmProvider.refresh();
			}
		}),
		vscode.commands.registerCommand("virtualbox-extension.poweroffVm", async (vmTreeItem: VirtualMachineTreeItem) => {
			if (vmTreeItem) {
				const { vm } = vmTreeItem;

				const running = await isRunning(vm.id);
				if (running) {
					try {
						await powerOff(vm.id);
						vscode.window.showInformationMessage(`Virtual machine "${vm.name}" has been stopped successfully`);
					} catch (ex) {
						vscode.window.showErrorMessage(`Cannot stop virtual machine "${vm.name}": ${ex?.message ?? "Unknown error"}`);
					}
				}
				vmProvider.refresh();
			}
		}),
		vscode.commands.registerCommand('virtualbox-extension.refreshVMs', () => {
			vmProvider.refresh();
		}),
		vscode.commands.registerCommand('virtualbox-extension.stopAllVms', () => {
			stopAllVms().then(() => {
				vmProvider.refresh();
			});
		}),
		vscode.commands.registerCommand('virtualbox-extension.poweOffAllVms', () => {
			poweOffAllVms().then(() => {
				vmProvider.refresh();
			});
		}),
	);
}

export function deactivate() { }
