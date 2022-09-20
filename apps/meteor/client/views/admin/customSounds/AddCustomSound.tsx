import { Field, TextInput, Box, Icon, Margins, Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useMethod, useToastMessageDispatch, useTranslation, useUpload } from '@rocket.chat/ui-contexts';
import React, { useState, useCallback, ReactElement, FormEvent } from 'react';

import VerticalBar from '../../../components/VerticalBar';
import { useFileInput } from '../../../hooks/useFileInput';
import { validate, createSoundData, soundDataType } from './lib';

type AddCustomSoundProps = {
	goToNew: (where: string) => () => void;
	close: () => void;
	onChange: () => void;
};

const AddCustomSound = function AddCustomSound({ goToNew, close, onChange, ...props }: AddCustomSoundProps): ReactElement {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	// const successText = t('Sound_uploaded_successfully');

	const [name, setName] = useState('');
	const [sound, setSound] = useState<{ name: string }>();

	const uploadCustomSound = useUpload('/v1/custom-sounds.uploadCustomSound');

	const insertOrUpdateSound = useMethod('insertOrUpdateSound');

	const handleChangeFile = useCallback((soundFile) => {
		setSound(soundFile);
	}, []);

	const [clickUpload] = useFileInput(handleChangeFile, 'audio/mp3');

	const saveAction = useCallback(
		async (name, soundFile): Promise<string | undefined> => {
			const soundData: soundDataType = createSoundData(soundFile, name);
			const validation = validate(soundData, soundFile) as Array<Parameters<typeof t>[0]>;

			validation.forEach((error) => {
				throw new Error(t('error-the-field-is-required', { field: t(error) }));
			});

			try {
				const soundId = await insertOrUpdateSound(soundData);

				if (!soundId) {
					return undefined;
				}

				dispatchToastMessage({ type: 'success', message: t('Uploading_file') });

				const reader = new FileReader();
				reader.readAsBinaryString(soundFile);
				reader.onloadend = (): void => {
					try {
						if (sound instanceof FormData && reader.result) {
							sound.set('sound', new Blob([reader.result]));

							uploadCustomSound({
								sound,
								contentType: soundFile.type,
								soundData: {
									...soundData,
									_id: soundId,
									random: Math.round(Math.random() * 1000),
								},
							});
						}

						dispatchToastMessage({ type: 'success', message: t('File_uploaded') });
					} catch (error) {
						(typeof error === 'string' || error instanceof Error) && dispatchToastMessage({ type: 'error', message: error });
					}
				};
				return soundId;
			} catch (error) {
				(typeof error === 'string' || error instanceof Error) && dispatchToastMessage({ type: 'error', message: error });
			}
		},
		[dispatchToastMessage, insertOrUpdateSound, sound, t, uploadCustomSound],
	);

	const handleSave = useCallback(async () => {
		try {
			const result = await saveAction(name, sound);
			if (!result) {
				throw new Error('error-something-went-wrong');
			}
			goToNew(result);
			dispatchToastMessage({ type: 'success', message: t('Custom_Sound_Saved_Successfully') });
			onChange();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [dispatchToastMessage, goToNew, name, onChange, saveAction, sound, t]);

	return (
		<VerticalBar.ScrollableContent {...props}>
			<Field>
				<Field.Label>{t('Name')}</Field.Label>
				<Field.Row>
					<TextInput
						value={name}
						onChange={(e: FormEvent<HTMLInputElement>): void => setName(e.currentTarget.value)}
						placeholder={t('Name')}
					/>
				</Field.Row>
			</Field>
			<Field>
				<Field.Label alignSelf='stretch'>{t('Sound_File_mp3')}</Field.Label>
				<Box display='flex' flexDirection='row' mbs='none'>
					<Margins inline='x4'>
						<Button square onClick={clickUpload}>
							<Icon name='upload' size='x20' />
						</Button>
						{sound?.name || t('None')}
					</Margins>
				</Box>
			</Field>
			<Field>
				<Field.Row>
					<ButtonGroup stretch w='full'>
						<Button mie='x4' onClick={close}>
							{t('Cancel')}
						</Button>
						<Button primary onClick={handleSave} disabled={name === ''}>
							{t('Save')}
						</Button>
					</ButtonGroup>
				</Field.Row>
			</Field>
		</VerticalBar.ScrollableContent>
	);
};

export default AddCustomSound;
