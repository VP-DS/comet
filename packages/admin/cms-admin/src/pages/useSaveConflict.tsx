import { useSnackbarApi } from "@comet/admin";
import { Alert, Snackbar } from "@mui/material";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { SaveConflictDialog } from "./SaveConflictDialog";

export interface SaveConflictOptions {
    checkConflict: () => Promise<boolean>;
    hasChanges: () => boolean;
    loadLatestVersion: () => Promise<void>;
    onDiscardButtonPressed: () => Promise<void>;
}

export interface SaveConflictHookReturn {
    hasConflict: boolean;
    loading: boolean;
    dialogs: React.ReactNode;
    checkForConflicts: () => Promise<boolean>;
}

export function useSaveConflict(options: SaveConflictOptions): SaveConflictHookReturn {
    const { checkConflict, hasChanges, loadLatestVersion, onDiscardButtonPressed } = options;
    const snackbarApi = useSnackbarApi();

    const [loading, setLoading] = React.useState(false);
    const [showDialog, setShowDialog] = React.useState(false);
    const [hasConflict, setHasConflict] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(async () => {
            const newHasConflict = await checkConflict();
            //we don't need setHasConflict as that is used during save only
            if (newHasConflict) {
                if (!hasChanges()) {
                    // No local changes, server changes available
                    await loadLatestVersion();
                    snackbarApi.showSnackbar(
                        <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} autoHideDuration={5000}>
                            <Alert severity="success">
                                <FormattedMessage
                                    id="comet.saveConflict.autoReloadSuccessfull"
                                    defaultMessage="This content has changed. We've refreshed the page for you."
                                />
                            </Alert>
                        </Snackbar>,
                    );
                } else {
                    // local changes, and server changes available: ask user what to do
                    setShowDialog(true);
                }
            } else {
                setShowDialog(false);
            }
        }, 10000);
        return () => {
            clearInterval(interval);
        };
    }, [checkConflict, snackbarApi, loadLatestVersion, hasChanges]);

    const checkForConflicts = React.useCallback(async () => {
        setLoading(true);
        setHasConflict(false);
        const newHasConflict = await checkConflict();
        setHasConflict(newHasConflict);
        setLoading(false);
        return newHasConflict;
    }, [checkConflict]);
    return {
        hasConflict,
        loading,
        checkForConflicts,
        dialogs: (
            <>
                <SaveConflictDialog
                    open={showDialog}
                    onClosePressed={() => {
                        setShowDialog(false);
                    }}
                    onDiscardChangesPressed={() => {
                        setHasConflict(false);
                        onDiscardButtonPressed();
                    }}
                />
            </>
        ),
    };
}
