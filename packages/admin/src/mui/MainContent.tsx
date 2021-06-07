import { Theme } from "@material-ui/core/styles";
import { createStyles, WithStyles, withStyles } from "@material-ui/styles";
import * as React from "react";

export type CometAdminMainContentClassKeys = "root";

const styles = (theme: Theme) =>
    createStyles<CometAdminMainContentClassKeys, any>({
        root: {
            position: "relative",
            zIndex: 5,
            padding: theme.spacing(4),
        },
    });

const MainContent: React.FC<WithStyles<typeof styles> & CometAdminMainContentClassKeys> = ({ classes, children }) => {
    return <main className={classes.root}>{children}</main>;
};

const StyledCometAdminMainContent = withStyles(styles, { name: "CometAdminMainContent", withTheme: true })(MainContent);
export { StyledCometAdminMainContent as MainContent };

declare module "@material-ui/core/styles/overrides" {
    interface ComponentNameToClassKey {
        CometAdminMainContent: CometAdminMainContentClassKeys;
    }
}
