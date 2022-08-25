import * as React from "react";
import { PropsWithChildren } from "react";
import { useForm, useFormState } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { SaveButton } from "./common/buttons/save/SaveButton";
import { SplitButton } from "./common/buttons/split/SplitButton";
import { useStackApi } from "./stack/Api";

export interface FormSaveButtonProps {
    localStorageKey?: string;
    onNavigateToEditPage?: () => void;
}

export const FinalFormSaveSplitButton = ({ localStorageKey = "SaveSplitButton", onNavigateToEditPage }: PropsWithChildren<FormSaveButtonProps>) => {
    const stackApi = useStackApi();
    const form = useForm();
    const { pristine, hasValidationErrors, submitting, hasSubmitErrors } = useFormState();

    return (
        <SplitButton disabled={pristine || hasValidationErrors || submitting} localStorageKey={localStorageKey}>
            <SaveButton
                color="primary"
                variant="contained"
                saving={submitting}
                hasErrors={hasSubmitErrors}
                onClick={async () => {
                    const submitReturn = await form.submit();
                    const successful = submitReturn === undefined || Object.keys(submitReturn).length == 0;
                    if (successful && onNavigateToEditPage) {
                        setTimeout(() => {
                            onNavigateToEditPage();
                        });
                    }
                }}
            >
                <FormattedMessage id="comet.generic.save" defaultMessage="Save" />
            </SaveButton>
            <SaveButton
                color="primary"
                variant="contained"
                saving={submitting}
                hasErrors={hasSubmitErrors}
                onClick={async () => {
                    const submitReturn = await form.submit();
                    const successful = submitReturn === undefined || Object.keys(submitReturn).length == 0;
                    if (successful) {
                        stackApi?.goBack();
                    }
                }}
            >
                <FormattedMessage id="comet.generic.saveAndGoBack" defaultMessage="Save and go back" />
            </SaveButton>
        </SplitButton>
    );
};
