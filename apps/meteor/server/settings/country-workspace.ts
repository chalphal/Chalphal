import { settingsRegistry } from '../../app/settings/server';

export const createCountryWorkspaceSettings = () =>
	settingsRegistry.addGroup('Country_Workspace', async function () {
		await this.section('Country_Workspace_Mapping', async function () {
			await this.add('Country_Workspace_USA', 'us-workspace', {
				type: 'string',
				hidden: true,
				readonly: true,
			});
			await this.add('Country_Workspace_UK', 'uk-workspace', {
				type: 'string',
				hidden: true,
				readonly: true,
			});
			await this.add('Country_Workspace_Australia', 'au-workspace', {
				type: 'string',
				hidden: true,
				readonly: true,
			});
			await this.add('Country_Workspace_Europe', 'eu-workspace', {
				type: 'string',
				hidden: true,
				readonly: true,
			});
		});
	});
