import { CometAdminFinalFormSearchTextFieldClassKeys } from "@comet/admin";
import { StyleRules } from "@material-ui/styles/withStyles";

export const getFinalFormSearchTextFieldOverrides = (): StyleRules<{}, CometAdminFinalFormSearchTextFieldClassKeys> => ({
    iconContainer: {
        paddingRight: 10,
    },
});