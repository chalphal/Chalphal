import { settings } from '../../app/settings/server';

export const COUNTRY_WORKSPACE_MAPPING: Record<string, string> = {
	unitedStates: 'us-workspace',
	unitedKingdom: 'uk-workspace', 
	australia: 'au-workspace',
	europe: 'eu-workspace',
};

export function getWorkspaceIdForCountry(country: string): string {
	const workspaceId = COUNTRY_WORKSPACE_MAPPING[country];
	if (workspaceId) {
		return workspaceId;
	}
	return settings.get<string>('Cloud_Workspace_Id') || 'default-workspace';
}

export function setCountryWorkspaceId(country: string): void {
	const workspaceId = getWorkspaceIdForCountry(country);
}
