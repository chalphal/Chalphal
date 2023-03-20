import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { LivechatRooms } from '@rocket.chat/models';

import { Users } from '../../../models/server';
import { Livechat } from '../lib/Livechat';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

Meteor.methods({
	async 'livechat:getNextAgent'({ token, department }) {
		methodDeprecationLogger.warn('livechat:getNextAgent will be deprecated in future versions of Rocket.Chat');
		check(token, String);

		const room = await LivechatRooms.findOpenByVisitorToken(token).toArray();

		if (room && room.length > 0) {
			return;
		}

		if (!department) {
			const requireDeparment = await Livechat.getRequiredDepartment();
			if (requireDeparment) {
				department = requireDeparment._id;
			}
		}

		const agent = await Livechat.getNextAgent(department);
		if (!agent) {
			return;
		}

		return Users.getAgentInfo(agent.agentId);
	},
});
