import { SaveButton, SaveButtonProps, SplitButton, useStackApi } from "@comet/admin";
import React from "react";
import { FormattedMessage } from "react-intl";

interface SaveStateOptions<TData> {
    hasChanges: boolean;
    saveConflict: {
        dialogs: React.ReactNode;
        checkForConflicts: () => Promise<boolean>;
    };
    mode: "edit" | "add";
    save: () => Promise<TData>;
    navigateToEditPage: (data: TData) => Promise<void>;
    validate: () => Promise<boolean>;
    updateReferenceContent: (data: TData) => void;
}
interface SaveStateReturn {
    handleSaveClick: () => Promise<void>;
    saving: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
    saveButton: JSX.Element;
}

export function useSaveState<TData>(options: SaveStateOptions<TData>): SaveStateReturn {
    const [saving, setSaving] = React.useState(false);
    const [saveError, setSaveError] = React.useState<"invalid" | "conflict" | "error" | undefined>();

    const handleSaveClick = React.useCallback(
        async (canNavigate = false) => {
            setSaving(true);
            setSaveError(undefined);
            const isValid = await options.validate();

            if (!isValid) {
                //onValidationFailed && onValidationFailed();
                setSaving(false);
                setSaveError("invalid");
                return;
            }

            if (options.mode === "edit") {
                const hasSaveConflict = await options.saveConflict.checkForConflicts();
                if (hasSaveConflict) {
                    setSaving(false);
                    setSaveError("conflict");
                    return; // dialogs open for the user to handle the conflict
                }
            }

            try {
                const data = await options.save();
                options.updateReferenceContent(data);
                setTimeout(() => {
                    if (canNavigate) {
                        options.navigateToEditPage(data);
                    }
                }, 0);
            } catch (error) {
                console.error(error);
                setSaveError("error");
            } finally {
                setSaving(false);
            }
        },
        [options],
    );

    const saveButton = (
        <SaveStateSaveButton hasChanges={options.hasChanges} handleSaveClick={handleSaveClick} saveError={saveError} saving={saving} />
    );

    return {
        handleSaveClick,
        saving,
        saveError,
        saveButton,
    };
}

interface SaveStateSaveButtonProps {
    handleSaveClick: (canNavigate?: boolean) => Promise<void>;
    hasChanges?: boolean;
    saving: boolean;
    saveError: "invalid" | "conflict" | "error" | undefined;
}
export function SaveStateSaveButton({ handleSaveClick, hasChanges, saving, saveError }: SaveStateSaveButtonProps): JSX.Element {
    const stackApi = useStackApi();

    const saveButtonProps: Omit<SaveButtonProps, "children" | "onClick"> = {
        color: "primary",
        variant: "contained",
        saving,
        hasErrors: !!saveError,
        errorItem:
            saveError == "invalid" ? (
                <FormattedMessage id="comet.generic.invalidData" defaultMessage="Invalid Data" />
            ) : saveError == "conflict" ? (
                <FormattedMessage id="comet.generic.saveConflict" defaultMessage="Save Conflict" />
            ) : undefined,
    };

    return (
        <SplitButton localStorageKey="SaveSplitButton" disabled={!hasChanges}>
            <SaveButton onClick={() => handleSaveClick(true)} {...saveButtonProps}>
                <FormattedMessage id="comet.generic.save" defaultMessage="Save" />
            </SaveButton>
            <SaveButton
                onClick={async () => {
                    await handleSaveClick();
                    stackApi?.goBack();
                }}
                {...saveButtonProps}
            >
                <FormattedMessage id="comet.generic.saveAndGoBack" defaultMessage="Save and go back" />
            </SaveButton>
        </SplitButton>
    );
}
