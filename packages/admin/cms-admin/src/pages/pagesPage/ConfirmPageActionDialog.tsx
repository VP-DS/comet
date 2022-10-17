import { CancelButton } from "@comet/admin";
import { Delete } from "@comet/admin-icons";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";
import { FormattedMessage } from "react-intl";

import { PageAction } from "./PagesPageActionToolbar";

interface ContentProps {
    selectedPagesCount: number;
}

type PageActionMessages = {
    [key in PageAction]: {
        title: React.ComponentType;
        content: React.ComponentType<ContentProps>;
    };
};

const Messages: PageActionMessages = {
    publish: {
        title: () => <FormattedMessage id="comet.pages.confirmDialog.publish.title" defaultMessage="Publish selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="comet.pages.confirmDialog.publish.content"
                defaultMessage="Are you sure that you want to publish {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
    unpublish: {
        title: () => <FormattedMessage id="comet.pages.confirmDialog.unpublish.title" defaultMessage="Unpublish selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="comet.pages.confirmDialog.unpublish.content"
                defaultMessage="Are you sure that you want to unpublish {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
    archive: {
        title: () => <FormattedMessage id="comet.pages.confirmDialog.archive.title" defaultMessage="Archive selected pages?" />,
        content: ({ selectedPagesCount }) => (
            <FormattedMessage
                id="comet.pages.confirmDialog.archive.content"
                defaultMessage="Are you sure that you want to archive {amount, plural, =0 {no pages} one {the selected page} other {the # selected pages}}?"
                values={{ amount: selectedPagesCount }}
            />
        ),
    },
};

interface ConfirmPageActionDialogProps {
    open: boolean;
    onCloseDialog: (confirmed: boolean) => void;
    action?: PageAction;
    selectedPagesCount: number;
}

export const ConfirmPageActionDialog: React.VoidFunctionComponent<ConfirmPageActionDialogProps> = ({
    open,
    onCloseDialog,
    action,
    selectedPagesCount,
}) => {
    const Title = action ? Messages[action].title : undefined;
    const Content = action ? Messages[action].content : undefined;

    return (
        <Dialog open={open} onClose={() => onCloseDialog(false)}>
            <DialogTitle>{Title && <Title />}</DialogTitle>
            <DialogContent>
                <DialogContentText>{Content && <Content selectedPagesCount={selectedPagesCount} />}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={() => onCloseDialog(false)} />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        onCloseDialog(true);
                    }}
                    autoFocus={true}
                    startIcon={<Delete />}
                >
                    <FormattedMessage id="comet.pages.confirmDialog.confirm" defaultMessage="Confirm" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
