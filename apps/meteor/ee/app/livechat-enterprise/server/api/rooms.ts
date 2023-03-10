import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { isLivechatRoomOnHoldProps, isLivechatRoomResumeOnHoldProps, isPOSTLivechatRoomPriorityParams } from '@rocket.chat/rest-typings';
import { LivechatRooms } from '@rocket.chat/models';
import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { isOmnichannelRoom } from '@rocket.chat/core-typings';
import { OmnichannelEEService } from '@rocket.chat/core-services';

import { API } from '../../../../../app/api/server';
import { hasPermission } from '../../../../../app/authorization/server';
import { Subscriptions } from '../../../../../app/models/server';
import { removePriorityFromRoom, updateRoomPriority } from './lib/priorities';

API.v1.addRoute(
	'livechat/room.onHold',
	{ authRequired: true, permissionsRequired: ['on-hold-livechat-room'], validateParams: isLivechatRoomOnHoldProps },
	{
		async post() {
			const { roomId } = this.bodyParams;
			if (!roomId || roomId.trim() === '') {
				return API.v1.failure('Invalid room Id');
			}

			const room = await LivechatRooms.findOneById<Pick<IOmnichannelRoom, '_id' | 't' | 'open' | 'onHold' | 'lastMessage'>>(roomId, {
				projection: { _id: 1, t: 1, open: 1, onHold: 1, lastMessage: 1 },
			});
			if (!room || !isOmnichannelRoom(room)) {
				return API.v1.failure('error-invalid-room');
			}

			if (room.lastMessage?.token) {
				return API.v1.failure('You cannot place chat on-hold, when the Contact has sent the last message');
			}

			if (room.onHold) {
				return API.v1.failure('Room is already On-Hold');
			}

			if (!room.open) {
				return API.v1.failure('Room cannot be placed on hold after being closed');
			}

			const user = Meteor.user();
			if (!user) {
				return API.v1.failure('Invalid user');
			}

			const subscription = Subscriptions.findOneByRoomIdAndUserId(roomId, user._id, { _id: 1 });
			if (!subscription && !hasPermission(this.userId, 'on-hold-others-livechat-room')) {
				return API.v1.failure('Not authorized');
			}

			const onHoldBy = { _id: user._id, username: user.username, name: (user as any).name };
			const comment = TAPi18n.__('Omnichannel_On_Hold_manually', {
				user: onHoldBy.name || `@${onHoldBy.username}`,
			});

			await OmnichannelEEService.placeRoomOnHold(room, comment, this.user);

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'livechat/room.resumeOnHold',
	{ authRequired: true, permissionsRequired: ['view-l-room'], validateParams: isLivechatRoomResumeOnHoldProps },
	{
		async post() {
			const { roomId } = this.bodyParams;
			if (!roomId || roomId.trim() === '') {
				throw new Error('invalid-param');
			}

			const room = await LivechatRooms.findOneById<Pick<IOmnichannelRoom, '_id' | 't' | 'open' | 'onHold' | 'lastMessage' | 'servedBy'>>(
				roomId,
				{
					projection: { _id: 1, t: 1, open: 1, onHold: 1, servedBy: 1 },
				},
			);
			if (!room || !isOmnichannelRoom(room)) {
				throw new Error('error-invalid-room');
			}

			if (!room.onHold) {
				throw new Error('error-room-not-on-hold');
			}

			if (!room.open) {
				throw new Error('This_conversation_is_already_closed');
			}

			const subscription = Subscriptions.findOneByRoomIdAndUserId(roomId, this.userId, { _id: 1 });
			if (!subscription && !hasPermission(this.userId, 'on-hold-others-livechat-room')) {
				return API.v1.failure('Not authorized');
			}

			const { name, username, _id: userId } = this.user;
			const onHoldBy = { _id: userId, username, name };
			const comment = TAPi18n.__('Omnichannel_on_hold_chat_resumed_manually', {
				user: onHoldBy.name || `@${onHoldBy.username}`,
			});

			await OmnichannelEEService.resumeRoomOnHold(room, comment, this.user, true);

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'livechat/room/:rid/priority',
	{
		authRequired: true,
		validateParams: { POST: isPOSTLivechatRoomPriorityParams },
		permissionsRequired: {
			POST: { permissions: ['view-l-room'], operation: 'hasAny' },
			DELETE: { permissions: ['view-l-room'], operation: 'hasAny' },
		},
	},
	{
		async post() {
			const { rid } = this.urlParams;
			const { priorityId } = this.bodyParams;

			if (!this.user.username) {
				return API.v1.failure('Invalid user');
			}

			await updateRoomPriority(
				rid,
				{
					_id: this.user._id,
					name: this.user.name || '',
					username: this.user.username,
				},
				priorityId,
			);

			return API.v1.success();
		},
		async delete() {
			const { rid } = this.urlParams;

			if (!this.user.username) {
				return API.v1.failure('Invalid user');
			}

			await removePriorityFromRoom(rid, {
				_id: this.user._id,
				name: this.user.name || '',
				username: this.user.username,
			});

			return API.v1.success();
		},
	},
);
