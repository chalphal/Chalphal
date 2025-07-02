import type { IUser } from '@rocket.chat/core-typings';

export function handleCountryWorkspaceAssignment(user: IUser): void {
	if (user.customFields?.country) {
		console.log(`User ${user.username} assigned to country: ${user.customFields.country}`);
	}
}
