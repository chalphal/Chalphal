import { Accordion, Field, FieldLabel, FieldRow, Select } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';

const COUNTRIES = [
	{ key: 'unitedStates', i18nLabel: 'Country_United_States' },
	{ key: 'unitedKingdom', i18nLabel: 'Country_United_Kingdom' },
	{ key: 'australia', i18nLabel: 'Country_Australia' },
	{ key: 'europe', i18nLabel: 'Europe' },
];

const PreferencesCountrySection = (): ReactElement => {
	const { t } = useTranslation();
	const { register } = useFormContext();

	return (
		<Accordion.Item title={t('Country_Settings')}>
			<Field>
				<FieldLabel htmlFor='country'>{t('Country')}</FieldLabel>
				<FieldRow>
					<Select
						{...register('country')}
						id='country'
						placeholder={t('Select_country')}
						options={COUNTRIES.map((country) => [country.key, t(country.i18nLabel)])}
					/>
				</FieldRow>
			</Field>
		</Accordion.Item>
	);
};

export default PreferencesCountrySection;
