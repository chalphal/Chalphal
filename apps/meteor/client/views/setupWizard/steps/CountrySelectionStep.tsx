import type { ReactElement } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { useSetupWizardContext } from '../contexts/SetupWizardContext';
import { CountrySelectionForm } from '@rocket.chat/web-ui-registration';

const CountrySelectionStep = (): ReactElement => {
	const { i18n } = useTranslation();
	const {
		setupWizardData: { organizationData },
		setSetupWizardData,
		goToNextStep,
	} = useSetupWizardContext();

	const handleLoginRoute = (route: string) => {
		if (route === 'register') {
			const selectedCountry = localStorage.getItem('selectedCountry');
			if (selectedCountry) {
				setSetupWizardData((prevState) => ({
					...prevState,
					organizationData: {
						...prevState.organizationData,
						country: selectedCountry,
					},
				}));

				sessionStorage.setItem('countrySelected', 'true');
				goToNextStep();
			}
		}
	};

	useEffect(() => {
		if (organizationData.country) {
			localStorage.setItem('selectedCountry', organizationData.country);
		}
	}, [organizationData.country]);

	return (
		<I18nextProvider i18n={i18n} defaultNS='onboarding'>
			<CountrySelectionForm setLoginRoute={handleLoginRoute} />
		</I18nextProvider>
	);
};

export default CountrySelectionStep;
